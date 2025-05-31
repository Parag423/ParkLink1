import React from 'react';
import './Loading.css'; // Add styles for customization
import vehicle from "../../assets/logo.png";

const LoadingPage = () => {
  return (
    <div className="loading-container">
      <div className="spinner">
      <img src={vehicle} alt="Vehicle" class="vehicle" />
      </div>
      <h2>Loading...</h2>
    </div>
  );
};

export default LoadingPage;