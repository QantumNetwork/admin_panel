import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ai-chat.css';
import '../styles/power-bi.css';

const QANTUM_ORIGIN = 'https://qantumbi.com';

export default function PowerBIDashboard({ venueId }) {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const requestRef = useRef(null);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    requestRef.current = controller;

    const send = (message) => {
      console.log('Sending message to Qantum iframe:', message);
      iframeRef.current?.contentWindow?.postMessage(message, QANTUM_ORIGIN);
    };

    const handleMessage = async (event) => {
      if (event.origin !== QANTUM_ORIGIN) return;
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const data = event.data;
      console.log('Received message from Qantum iframe:', data);

      if (data?.type === 'qantum:ready') {
        if (!/^[0-9a-f]{64}$/.test(data.challenge)) return;

        try {
          setStatus('Authorising...');
          const token = localStorage.getItem('token');
          const response = await axios.post(
            `${baseUrl}/qantum-powerbi/iframe-ticket`,
            {
              challenge: data.challenge,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
              withCredentials: true,
            }
          );

          if (!active || controller.signal.aborted) return;
          console.log('response.data.ticket:', response.data.data.ticket);
          send({
            type: 'qantum:ticket',
            ticket: response.data.data.ticket,
          });
        } catch (error) {
          if (active && !controller.signal.aborted) {
            setStatus('Unable to authorise report');
          }
        }
      }

      if (data?.type === 'qantum:authorised') {
        setStatus('Connected');
      }

      if (data?.type === 'qantum:reauth-required') {
        setStatus('Session expired. Please reconnect.');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      active = false;
      controller.abort();
      window.removeEventListener('message', handleMessage);
    };
  }, [venueId]);

  return (
    <div className="power-bi-page">
      <header className="app-header-ai">
        <div className="s2w-logo" onClick={() => navigate('/dashboard')}>
          <img src="/s2w-logo.png" alt="S2W Logo" />
        </div>

        <div className="viper-logo">
          <img src="/viper-icon.png" alt="Viper Logo" />
        </div>

        <div className="header-btn">
          <button className="exit-btn" onClick={() => navigate('/dashboard')}>
            Exit to Menu
          </button>
        </div>
      </header>
      {status !== 'Connected' && (
        <div
          className="power-bi-status-loader"
          role="status"
          aria-live="polite"
        >
          <span className="power-bi-status-spinner" />
          <span>{status}</span>
        </div>
      )}

      <iframe
        key={venueId}
        ref={iframeRef}
        title="Qantum BI reports"
        src={`${QANTUM_ORIGIN}/?qantum_iframe=1`}
        onLoad={() => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'qantum:init' },
            QANTUM_ORIGIN
          );
        }}
        style={{
          display: 'block',
          width: '100%',
          height: 'calc(100vh - 90px)',
          border: 'none',
        }}
        allow="fullscreen"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
