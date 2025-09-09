import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';
import '../styles/ai-reporting.css';
import '../styles/ai-chat.css';
import { IoMdSend } from 'react-icons/io';
import { GrMicrophone } from 'react-icons/gr';
import { MdMicOff } from 'react-icons/md';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
let mediaRecorderRef = null;
let streamRef = null;
let stopTimeout = null;

const AIChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { initialChatHistory } = location.state || {};
  const userEmail = localStorage.getItem('userEmail');
  const userType = localStorage.getItem('userType');
  const safeHistory = Array.isArray(initialChatHistory)
    ? initialChatHistory
    : [];
  const [chatHistory, setChatHistory] = useState(safeHistory);
  const [isListening, setIsListening] = useState(false);

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);

  const handleImageClick = (url) => {
    setModalImageUrl(url);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setModalImageUrl(null);
  };

  const userInitial = userEmail.charAt(0).toUpperCase();
  const username = userEmail.split('@')[0];

  const token = localStorage.getItem('token');
  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const appGroup = localStorage.getItem('appGroup');
  const [loadingVenue, setLoadingVenue] = useState(true);
  const [venues, setVenues] = useState([]);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  // Helper to resolve endpoint using your requested one-liner style
  const getEndpoint = () => {
    const isQantumOrMaxGaming =
      selectedVenue === 'Qantum' || selectedVenue === 'MaxGaming';
    const isManly = selectedVenue === 'Manly';
    const isStarReward = selectedVenue === 'StarReward';

    const endpoint = isQantumOrMaxGaming
      ? 'https://qantumdemoaireportingviperapi.gentlehill-ca974cf4.australiaeast.azurecontainerapps.io/api/airesponse'
      : isManly
      ? 'https://mhbcviperaireportingapi.victoriouswater-d292e9e7.australiaeast.azurecontainerapps.io/api/airesponse'
      : isStarReward
      ? 'https://aireportingviperapi.wonderfulglacier-1e6957c7.australiaeast.azurecontainerapps.io/api/airesponse'
      : null;

    return endpoint;
  };

  const sendToAI = async (historyToSend) => {
    const lastUserMessage = historyToSend[historyToSend.length - 1];
    const trimmed = lastUserMessage?.content?.trim?.() || '';
    if (!trimmed) return;

    setLoading(true);
    setIsTyping(true);

    const endpoint = getEndpoint();
    if (!endpoint) {
      toast.error('No endpoint configured for this venue.');
      setIsTyping(false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_history: historyToSend,
          prompt: trimmed,
          username: username,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.chat_history)) {
        const assistantMsg = data.chat_history[data.chat_history.length - 1];
        if (data.type === 'pdf') assistantMsg.fileType = 'pdf';
        else if (data.type === 'excel') assistantMsg.fileType = 'excel';
        else if (data.type === 'graph') assistantMsg.fileType = 'graph';

        setChatHistory([...historyToSend, assistantMsg]);
      } else {
        toast.error('AI failed to respond.');
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error('An error occurred while sending your message.');
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const shouldSendInitialPrompt =
      chatHistory.length === 1 && chatHistory[0].role === 'user';

    if (shouldSendInitialPrompt) {
      sendToAI(chatHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const newChat = [...chatHistory, { role: 'user', content: trimmed }];
    setChatHistory(newChat);
    setQuestion('');
    setLoading(true);
    setIsTyping(true);

    const endpoint = getEndpoint();
    if (!endpoint) {
      toast.error('No endpoint configured for this venue.');
      setIsTyping(false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_history: newChat,
          prompt: trimmed,
          username: username,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.chat_history)) {
        const assistantMsg = data.chat_history[data.chat_history.length - 1];

        // Add file type if applicable
        if (data.type === 'pdf') assistantMsg.fileType = 'pdf';
        else if (data.type === 'excel') assistantMsg.fileType = 'excel';
        else if (data.type === 'graph') assistantMsg.fileType = 'graph';
        setChatHistory([...newChat, assistantMsg]);
      } else {
        toast.error('AI failed to respond.');
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error('An error occurred while sending your message.');
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const recordAudio = () =>
    new Promise((resolve) => {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        streamRef = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef = mediaRecorder;
        const audioChunks = [];

        mediaRecorder.addEventListener('dataavailable', (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          resolve(audioBlob);
        });

        mediaRecorder.start();
      });
    });

  const handleMicButtonClick = () => {
    if (!isListening) {
      setIsListening(true);
      recordAudio().then(async (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob);

        const response = await axios.post(
          `${baseUrl}/proxy/whisper-transcribe`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.text) {
          setQuestion((prev) => prev + ' ' + response.data.text);
        } else {
          toast.error('Transcription failed.');
        }

        if (streamRef) {
          streamRef.getTracks().forEach((track) => track.stop());
        }
      });
    } else {
      if (mediaRecorderRef && mediaRecorderRef.state === 'recording') {
        mediaRecorderRef.stop();
        clearTimeout(stopTimeout);
      }
      setIsListening(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      setIsListening(true);
      const audioBlob = await recordAudio();

      const formData = new FormData();
      formData.append('file', audioBlob);

      const response = await axios.post(
        `${baseUrl}/proxy/whisper-transcribe`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.text) {
        setQuestion((prev) => prev + ' ' + response.data.text);
      } else {
        toast.error('Transcription failed.');
      }
    } catch (error) {
      console.error('Voice input failed:', error);
      toast.error('Voice input failed.');
    } finally {
      setIsListening(false);
    }
  };

  const handleNavigation = (path) => navigate(path);

  const renderAssistantMessage = (msg) => {
    if (msg.fileType === 'pdf' || msg.fileType === 'excel') {
      const fileUrlMatch = msg.content.match(/https?:\/\/[^\s]+/);
      const url = fileUrlMatch ? fileUrlMatch[0] : null;

      return (
        <div className="file-message">
          <p>This is your {msg.fileType} File. Click to download:</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="file-link"
          >
            {msg.fileType === 'pdf' ? (
              <FaFilePdf className="file-icon" color="red" />
            ) : (
              <FaFileExcel className="file-icon" color="green" />
            )}
            {msg.fileType.toUpperCase()}
          </a>
        </div>
      );
    }

    if (msg.fileType === 'graph') {
      const imgUrlMatch = msg.content.match(/https?:\/\/[^\s]+/);
      const imageUrl = imgUrlMatch ? imgUrlMatch[0] : null;

      return (
        <div className="graph-message">
          <a
            href={imageUrl}
            download
            className="download-btn"
            title="Download graph"
          >
            ⬇
          </a>
          <img
            src={imageUrl}
            alt="Graph from AI"
            className="graph-image"
            onClick={() => handleImageClick(imageUrl)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      );
    }

    return <div className="message-bubble">{msg.content}</div>;
  };

  const getAppType = (appType) => {
    switch (appType) {
      case 'MaxGaming':
        return 'Max Gaming';
      case 'Manly':
        return 'Manly Harbour Boat Club';
      case 'Montauk':
        return 'Montauk Tavern';
      case 'StarReward':
        return 'Star Reward';
      case 'Central':
        return 'Central Lane Hotel';
      case 'Sense':
        return 'Sense Of Taste';
      default:
        return appType;
    }
  };

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${baseUrl}/admin/app-registries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.data) {
          setVenues(response.data.data);
          setLoadingVenue(false);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
        setLoadingVenue(false);
      }
    };

    if (token && userType === 'admin') {
      fetchVenues();
    }
  }, [token, userType, baseUrl]);

  return (
    <div className="digital-app-container">
      <ToastContainer />
      <header className="app-header-ai">
        <div
          className="s2w-logo"
          onClick={() => handleNavigation('/dashboard')}
        >
          <img src="/s2w-logo.png" alt="S2W Logo" />
        </div>
        <div className="viper-logo">
          <img src="/viper-icon.png" alt="Viper Logo" />
        </div>
        <div className="header-btn">
          {userType === 'admin' && (
            <div
              style={{
                position: 'absolute',
                right: '70px',
                top: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                style={{
                  fontWeight: '500',
                  color: '#002977',
                  fontSize: '15px',
                  fontWeight: 'bold',
                }}
              >
                Venue
              </span>
              <select
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: '#F2F2F2',
                  cursor: 'pointer',
                  minWidth: '200px',
                }}
                value={selectedVenue}
                onChange={async (e) => {
                  const selectedValue = e.target.value;
                  if (!selectedValue) return;

                  try {
                    const response = await axios.post(
                      `${baseUrl}/admin/token`,
                      { appType: selectedValue },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );

                    if (
                      response.data &&
                      response.data.data &&
                      response.data.data.token
                    ) {
                      // Remove old token and save new one
                      localStorage.removeItem('token');
                      localStorage.setItem('token', response.data.data.token);
                      setSelectedVenue(selectedValue);
                      localStorage.removeItem('selectedVenue');
                      localStorage.setItem('selectedVenue', selectedValue);
                      navigate('/dashboard');                    }
                  } catch (error) {
                    console.error('Error updating venue:', error);
                  }
                }}
                disabled={loadingVenue}
              >
                {userType === 'admin' &&
                  venues.map(
                    (venue) =>
                      venue.appType === appGroup &&
                      venue.appName &&
                      venue.appName.map((app, index) => (
                        <option key={`${venue._id}-${index}`} value={app}>
                          {getAppType(app)}
                        </option>
                      ))
                  )}
                {userType === 'user' && (
                  <option value={appGroup}>{getAppType(appGroup)}</option>
                )}
              </select>
            </div>
          )}

          <button
            className="exit-btn"
            onClick={() => handleNavigation('/dashboard')}
          >
            Exit to Menu
          </button>
        </div>
        <div className="user-section">
          <div
            className="user-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {userInitial}
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              <p>{userEmail}</p>
              <button className="logout-btn" onClick={() => logout(navigate)}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="chat-container">
        <div className="chat-full-wrapper">
          <div className="chat-wrapper">
            <div className="chat-box" ref={chatBoxRef}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="chat-icon-circle left">
                      <img src="/Group.svg" alt="AI" className="chat-avatar" />
                    </div>
                  )}
                  {msg.role === 'assistant' ? (
                    renderAssistantMessage(msg)
                  ) : (
                    <div className="message-bubble">{msg.content}</div>
                  )}
                  {msg.role === 'user' && (
                    <div className="chat-icon-circle right">
                      <img
                        src="/question.svg"
                        alt="User"
                        className="chat-avatar"
                      />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="chat-message assistant">
                  <div className="chat-icon-circle left">
                    <img src="/Group.svg" alt="AI" className="chat-avatar" />
                  </div>
                  <div className="message-bubble typing-indicator">
                    <p>Processing your Request</p> <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* chat input bar */}
          <div className="chat-input-bar">
            <button
              className="mic-button-ai-chat"
              onClick={handleMicButtonClick}
            >
              {isListening ? (
                <GrMicrophone size={20} color="white" />
              ) : (
                <MdMicOff size={20} color="white" />
              )}
            </button>

            {/* This hidden input tricks LastPass into thinking autofill is handled */}
            <input type="text" name="fake-user" style={{ display: 'none' }} />
            <input
              type="password"
              name="fake-password"
              style={{ display: 'none' }}
            />

            <div className="chat-input-wrapper">
              <textarea
                name="no-password-here"
                autoComplete="off"
                data-lpignore="true"
                placeholder="Ask your question here or use voice recognition"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  // Send on Enter (without Shift); newline with Shift+Enter
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                className="chat-textarea"
              />
              <button
                className="send-icon"
                onClick={handleSend}
                disabled={loading}
              >
                <IoMdSend size={22} color="#0C285B" />
              </button>
            </div>
          </div>
        </div>
        {showImageModal && (
          <div className="image-modal-overlay" onClick={handleCloseModal}>
            <div
              className="image-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ✖
              </button>
              <img
                src={modalImageUrl}
                alt="Full View"
                className="image-modal-img"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIChatPage;
