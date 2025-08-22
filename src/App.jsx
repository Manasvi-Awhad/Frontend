import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import SignUp from "./signup";
import RoleSelection from "./roleselection";
import ManufacturerDashboard from "./manufacturer";
import DistributorDashboard from "./distributor";
import RetailerDashboard from "./retailer";
import RegulatorDashboard from "./regulator";
import './App.css'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route to Login page */}
        <Route path="/" element={<Login />} />
        {/* Route for Login page */}
        <Route path="/login" element={<Login />} />
        {/* Route for SignUp page */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/manufacturer-dashboard" element={<ManufacturerDashboard />} />
        <Route path="/distributor-dashboard" element={<DistributorDashboard />} />
        <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
        <Route path="/regulator-dashboard" element={<RegulatorDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;