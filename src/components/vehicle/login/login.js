import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './login.css';
import { apiConnector } from '../../../services/apiconnector';
import { auth_api } from '../../../services/apis';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';



const Login = () => {
  const navigate=useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  async function handleSubmit (e){
    e.preventDefault();
    try{
     toast.loading("Loading...");
     console.log(email);
     const res=await apiConnector("POST",auth_api.LOGIN_API, {email,password});
     console.log(res);
     localStorage.setItem('user', JSON.stringify(res?.data?.userDetails));
     const username = JSON.parse(localStorage.getItem('user'));
      console.log("userdetails is",username); // Output: Pratima
      if(res.data.userDetails.Usertype=='vehicle')
     navigate("/dashboard")
    else navigate("/parkinglotsownerdashboard")
     toast.dismiss();
     console.log("user login")
    }
    catch(error){
      toast.dismiss();
      toast.error("Internal Server error.");
    }
  };

  return (
    <div className="otp-container">
      <div className="welcome-text">
        Welcome to <span className="app-name">ParkLink.</span>
      </div>
      <form className="otp-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="text"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter Email"
          required
        />

        <label>Password</label>
        <div className="password-input-container">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter Password"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="eye-button"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button type="submit" className="submit-btn">Login</button>
      </form>

      <button className="signup-btn" onClick={()=>navigate("/signup")}>
        Do not have an account? Signup
      </button>
    </div>
  );
};

export default Login;