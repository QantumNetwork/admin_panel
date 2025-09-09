import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, Slide } from 'react-toastify';
import Login from "./pages/Login";
import PasswordVerification from "./pages/PasswordVerification";
import MFASetup from "./pages/MFASetup";
import MFAVerification from "./pages/MFAVerification";
import Dashboard from "./pages/Dashboard";
import DigitalApp from "./pages/Digital-App";
import DigitalSmall from "./pages/Digital-App-small-advert";
import SpecialOffers from "./pages/SpecialOffers";
import ArtGallery from "./pages/ArtGallery";
import MyBenefits from "./pages/MyBenefits";
import MarketToMembers from "./pages/MarketToMembers";
import ScheduledSent from "./pages/ScheduledSent";
import AIReporting from "./pages/AIReporting";
import AIChatPage from "./pages/AIChatPage";
import Displays from "./pages/Displays";
import StandardAdmin from "./pages/StandardAdmin";
import PowerAdmin from "./pages/PowerAdmin";
import AdminCustom from "./pages/AdminCustom";
import SmartIncentives from "./pages/SmartIncentives";
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/password-verification" element={<PasswordVerification />} />
        <Route path="/setup-mfa" element={<MFASetup />} />
        <Route path="/verify-mfa" element={<MFAVerification />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/digital-app" element={<DigitalApp />} />
        <Route path="/small-advert" element={<DigitalSmall />} />
        <Route path="/special-offers" element={<SpecialOffers />} />
        <Route path="/art-gallery" element={<ArtGallery />} />
        <Route path="/my-benefits" element={<MyBenefits />} />
        <Route path="/market-to-members" element={<MarketToMembers />} />
        <Route path="/scheduled-&-sent" element={<ScheduledSent />} />
        <Route path="/ai-reporting" element={<AIReporting />} />
        <Route path="/chat" element={<AIChatPage />} /> 
        <Route path="/displays" element={<Displays />} />
        <Route path="/standard-admin" element={<StandardAdmin />} />
        <Route path="/power-admin" element={<PowerAdmin />} />
        <Route path="/admin-custom" element={<AdminCustom />} />
        <Route path="/smart-incentives" element={<SmartIncentives />} />
      </Routes>
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
    marginTop: '60px',
    fontSize: '14px',
    minWidth: '300px',
    textAlign: 'center' }}
      />
    </Router>
  );
}

export default App;