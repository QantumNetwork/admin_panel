import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { logout } from '../utils/auth';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ai-reporting.css';
import { MdMicOff } from 'react-icons/md';
import { GrMicrophone } from 'react-icons/gr';
import { handleLogout } from '../utils/api';
import Swal from 'sweetalert2';

let mediaRecorderRef = null;
let streamRef = null;

const AIReporting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [question, setQuestion] = useState('');
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const email = localStorage.getItem('userEmail') || 'user@example.com';
  const username = email.split('@')[0];
  const userInitial = email.charAt(0).toUpperCase();
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');
  const appGroup = localStorage.getItem('appGroup');
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const [selectedVenue, setSelectedVenue] = useState(
    localStorage.getItem('selectedVenue') || ''
  );
  const [loadingVenue, setLoadingVenue] = useState(true);
  const [venues, setVenues] = useState([]);

  const handleNavigation = (path) => {
    if (
      path === '/push-messaging' ||
      path === '/sms-email' ||
      path === '/geo-targeting'
    ) {
      navigate('/market-to-members');
    } else {
      navigate(path);
    }
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
      case 'North':
        return 'North Shore Tavern';
      case 'Hogan':
        return "Hogan's";
      case 'Ace':
        return 'Ace Rewards';
      default:
        return appType;
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
        setIsListening(false);

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
      }
      setIsListening(false);
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;
    const requestBody = {
      chat_history: [],
      prompt: question,
      username: username,
    };
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

    if (!endpoint) {
      Swal.fire({
        icon: 'warning',
        title: 'Unsupported Venue',
        text: 'AI Reporting is not available for the selected venue.',
        confirmButtonColor: '#002977',
      });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.chat_history)) {
        navigate('/chat', {
          state: {
            initialChatHistory: [{ role: 'user', content: question }],
            userEmail: email,
          },
        });
      } else {
        toast.error('AI response failed.');
      }
    } catch (error) {
      toast.error('Error contacting AI.');
      console.error(error);
    } finally {
      setLoading(false);
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
  }, [token]);

    const handleLock = async () => {
      try {
        const result = await handleLogout();
        if(result.success) {
          navigate('/dashboard');
        } else {
          toast.error(result.message || 'Failed to remove lock. Please try again.');
        }
  
      } catch (error) {
        console.error('Error in handleLock:', error);
        toast.error(error.message || 'Failed to remove lock. Please try again.');
      }
    }
  

  return (
    <div className="digital-app-container">
      <ToastContainer 
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        style={{ zIndex: 9999, 
          marginTop: '90px',
          fontSize: '14px',
          minWidth: '300px',
          textAlign: 'center' }}
            />
      <header className="app-header-ai">
        <div
          className="s2w-logo"
          onClick={() => handleLock()}
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
                  fontWeight: 'bold',
                  color: '#002977',
                  fontSize: '15px',
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
                      localStorage.setItem('token', response.data.data.token);
                      setSelectedVenue(selectedValue);
                      localStorage.setItem('selectedVenue', selectedValue);

                      navigate('/dashboard');
                    }
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
              <p>{email}</p>
              <button className="logout-btn" onClick={() => logout(navigate)}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="ai-content">
        <div className="question-container">
          <h2 className="question-title">Please ask a question</h2>
          <div className="input-container">
            <textarea
              className="question-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows={4}
            />
            <div className="input-controls">
              <button className="mic-button" onClick={handleMicButtonClick}>
                {isListening ? (
                  <GrMicrophone size={20} color="white" />
                ) : (
                  <MdMicOff size={20} color="white" />
                )}
              </button>

              <button className="go-button" onClick={handleSubmit}>
                Go
              </button>
            </div>
          </div>

          {loading && <p className="ai-loading">Loading AI response...</p>}
          {responseText && (
            <div className="ai-response-box">
              <h3>AI Response</h3>
              <pre>{responseText}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIReporting;
