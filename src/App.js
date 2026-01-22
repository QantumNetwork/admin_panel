import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ClubDesk from "./pages/ClubDesk";
import ManualReg from "./pages/ManualReg";
import ClubPackage from "./pages/ClubPackage";
import MembershipPage from "./pages/MembershipPage";
import AppSettings from "./pages/AppSettings";
import PaymentReporting from "./pages/PaymentReporting";
import { ToastContainer, Slide } from 'react-toastify';
import { useEffect } from 'react';
import { setupRefreshLock, clearRefreshLock } from './utils/api';
import Reporting from "./pages/Reporting";
import 'react-toastify/dist/ReactToastify.css';


function App() {
  useEffect(() => {
    // Set up the refresh lock when component mounts
    setupRefreshLock();
    
    // Clean up on unmount
    return () => {
      clearRefreshLock();
    };
  }, []);
  return (
    <Router>
      {/* <ToastContainer 
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
      /> */}
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
        <Route path="/approvals" element={<ClubDesk />} />
        <Route path="/manual-reg" element={<ManualReg />} />
        <Route path="/club-pkg" element={<ClubPackage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/app-settings" element={<AppSettings />} />
        <Route path="/payment-reporting" element={<PaymentReporting />} />
        <Route path="/reporting" element={<Reporting />} />
      </Routes>
      
    </Router>
  );
}

export default App;