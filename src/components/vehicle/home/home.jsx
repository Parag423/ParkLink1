import React, { useState } from 'react';
import './home.css';
import Logo from "../../../assets/logo.png";
import {  Link, useNavigate } from "react-router-dom";
import Signup from '../signup/signup';

const Home = () => {
const navigate=useNavigate();
  return (
    <div className="vehiclehome-container">
      <div className="vehiclehome-content">
        <div className="vehiclehome-logo">
          {/* Placeholder for logo */}
          <span role="img" aria-label="logo">
          <img src={Logo} alt="logo"/>
          </span>
        </div>
        <h1 className="vehiclehome-title">Welcome to ParkLink.</h1>
      
      
       
        <p className="vehiclehome-description">
          Make parking effortless. Using IoT and AI, we connect drivers to available spaces in real time, saving time and reducing hassle. Find parking instantly, stress-free, and help create smarter cities with innovative technology.
        </p>
        <div className="vehiclehome-buttons">
          <button className="vehiclehome-button dive-button">Dive Deeper</button>
          <button onClick={()=>navigate("/login")}  className="vehiclehome-button signup-button">Signin</button>
          </div>
       
       
      </div>
    </div>
  );
};

export default Home;