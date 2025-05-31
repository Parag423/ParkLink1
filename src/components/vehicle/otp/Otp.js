import React, { useState, useEffect } from 'react';
import './Otp.css';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { auth_api } from '../../../services/apis';
import {apiConnector} from '../../../services/apiconnector';

const Otp = () => {
  const navigate=useNavigate();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(90); 
  const data=useSelector((state)=>state.signup)

 
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };


  async function handleSubmit (e){
    e.preventDefault();
    try{
        toast.loading("Loading...")
        console.log(data.signupdata.email);
        var name=data.signupdata.name;
        var email=data.signupdata.email;
        var password=data.signupdata.password;
        var confirmPassword=data.signupdata.confirmPassword;
        var type=data.signupdata.type;

      const res=await apiConnector("POST",auth_api.SIGNUP_API,{name,email,password,confirmPassword,otp,type});
      toast.dismiss();
      navigate("/login");
    }
    catch(error){
        toast.dismiss();
        toast.error("Internal server error.")
    }
    console.log(data);
  };

 
  async function resendOtp ()  {
    console.log('Resend OTP clicked');
    if(timer!=0){
        toast.error("Please wait for the timer.")
    }else
   { 
    try{
      toast.loading("Loading...");
      const email = data?.signupdata?.email;
      const res=await apiConnector("POST",auth_api.SENDOTP_API,{email});
    }
    catch(error){
        toast.dismiss();
        toast.error("Internal Server error.")
    }
    setTimer(180); 
   
    console.log("Sola ni rhh")
}
  };

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer((prevTimer) => prevTimer - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="otp-container">
      <div className="welcome-text">Welcome to <span className="app-name">ParkLink.</span></div>
      <form className="otp-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input 
          type="text"
          value={data?.signupdata?.email}
          readOnly
        />
        <div className="otp-sent">Code has been sent</div>
        
        <input
          type="text"
          value={otp}
          onChange={handleOtpChange}
          maxLength="6"
          placeholder="Enter OTP"
          required
        />

      
        <div className="otp-bottom-row">
          <div className="timer">{Math.floor(timer / 60)} mins {timer % 60} secs</div>
          <button type="button" onClick={resendOtp} className="resend-btn">Resend OTP</button>
        </div>
        
        <button type="submit" className="submit-btn">Ok</button>
      </form>
    </div>
  );
};

export default Otp;