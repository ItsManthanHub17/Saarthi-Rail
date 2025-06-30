import React, { useState } from 'react';
// import HomePage from './pages/HomePage';
import PilotPanel from './pages/PilotPanel';
import StationDashboard from './pages/StationDashboard';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from './pages/LoginSignupPage';
import User from './pages/user';


function App() {
  return <>
    {/* <HomePage /> */}
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup/>} />
        <Route path="/pages/PilotPanel" element={<PilotPanel />} />
        <Route path="/pages/StationDashboard" element={<StationDashboard />} />
        <Route path="/pages/user" element={<User />} />
      </Routes>
    </Router>

  </>;
}

export default App;
