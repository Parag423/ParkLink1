import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './signup.css';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSignupdata } from '../../../slices/signup';
import { auth_api } from '../../../services/apis';
import {apiConnector} from '../../../services/apiconnector';

const Signup = () => {
  const dispatch=useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  async function handleSubmit(event){
    event.preventDefault(); 
 const type='vehicle';
    // Create the data object
    const data = {
      name,
      email,
      password,
      confirmPassword,
      type
    };

    if(password!=confirmPassword){
        toast.error("Passwords do not match.");
    }else{
        console.log(data);
       
            try{
             toast.loading("Loading...")  
             console.log("11",auth_api.SENDOTP_API); 
             const res=await apiConnector("POST",auth_api.SENDOTP_API,{email});
             toast.dismiss();
             dispatch(setSignupdata(data));
             navigate(`/vehicle/otp`)
            }
            catch(error){
             toast.dismiss();
             toast.error("Internal Server error.")
             console.log(error);
            }
            
         
       
    }

 
  };

  return (
   <div className='signup-wraper'>
    <div className="welcome-text">
        Welcome to <span className="app-name">ParkLink.</span>
      </div>
    <div className="vehiclehome-signup-container">
      <h2 className="vehiclehome-signup-title">Signup</h2>
      <form className="vehiclehome-signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          className="vehiclehome-input"
          value={name}
          onChange={(e) => setName(e.target.value)} 
        />
        <input
          type="email"
          placeholder="Email"
          className="vehiclehome-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="password-input-container">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="vehiclehome-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={togglePasswordVisibility} className="eye-button">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className="password-input-container">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            className="vehiclehome-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
          <button type="button" onClick={toggleConfirmPasswordVisibility} className="eye-button">
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button type="submit" onClick={handleSubmit} className="vehiclehome-signup-button">
          Signup
        </button>
      </form>
    </div>
    </div> 
  );
};

export default Signup;