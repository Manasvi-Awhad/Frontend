import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css"; // Reuse the existing CSS

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/${role}-dashboard`); // Redirect to the selected role's dashboard
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Select Your Role</h2>
        <div className="form">
          <button
            onClick={() => handleRoleSelection("manufacturer")}
            className="button"
          >
            Manufacturer
          </button>
          <button
            onClick={() => handleRoleSelection("distributor")}
            className="button"
          >
            Distributor
          </button>
          <button
            onClick={() => handleRoleSelection("retailer")}
            className="button"
          >
            Retailer
          </button>
          <button
            onClick={() => handleRoleSelection("regulator")}
            className="button"
          >
            Regulator
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;