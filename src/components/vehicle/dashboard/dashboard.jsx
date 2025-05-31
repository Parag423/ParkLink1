import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Logo from "../../../assets/logo.png";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import Footer from '../../common/footer/Footer';
import { useNavigate } from 'react-router';
import Logo2 from "../../../assets/Road_fill.png";
import Logo3 from "../../../assets/Wallet_fill.png";
import { Addmoney } from '../../../services/operations/Addmoney';
import { useDispatch } from "react-redux";
import { Payment_api } from '../../../services/apis';

function Dashboard() {
  const dispatch = useDispatch();
  const User = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [state, setState] = useState(false);
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState(User?.email || ""); // Fetch email from localStorage
  const [vehicle, setVehicle] = useState(User?.vehicles || []);
  const [razorpayScriptLoaded, setRazorpayScriptLoaded] = useState(false); // State to track if Razorpay script is loaded

  // Dynamically load Razorpay script if not already loaded
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setRazorpayScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setRazorpayScriptLoaded(true);
    }
  }, []);

  function amountHandler(e) {
    setAmount(e.target.value);
    console.log(amount);
  }

  function searchparkingHandeler() {
    navigate("/searchparking");
  }

  async function procedHandeler() {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    if (!razorpayScriptLoaded) {
      alert("Razorpay script is still loading. Please try again.");
      return;
    }

    try {
      // Convert amount to paise
      const paymentAmount = amount ;

      // Backend call to generate Razorpay order
      const response = await fetch(Payment_api.CREATE_ORDER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: paymentAmount, email }),
      });

      const orderData = await response.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create Razorpay order.");
      }

      const options = {
        key: "rzp_test_M490QZYuqB0lSb", // Replace with your Razorpay key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ParkLink",
        description: "Wallet Recharge",
        order_id: orderData.id,
        handler: async function (response) {
          // After successful payment, verify payment with the backend
          const verifyResponse = await fetch(Payment_api.VERIFY_PAYMENT_API, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              email:User.email,
              amount:amount
            }),
          });

          const verifyData = await verifyResponse.json();
          
          if (verifyData.success) {
            alert("Payment successful!");
            console.log("verify datacus",verifyData);
            setState(false); // Close payment modal
            localStorage.setItem('user', JSON.stringify(verifyData.userDetails));
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: User?.name,
          email: email,
        },
        theme: {
          color: "#3498db",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error.message);
      alert("Something went wrong. Please try again.");
    }
  }

  // New code added for realtime updation of amount
  async function updateESP32ID(email) {
  try {
    const response = await fetch('http://localhost:4000/api/v1/auth/getamount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email:email})
    });

   
    const data = await response.json();

    if (response.ok) {
     console.log("Response is", data.amount)
     setAmount(data.amount);
    
    }
  } catch (error) {
    console.log("Error in searching amount");
    console.error('🚫 Error while calling backend:', error.message);
  }
}

function update(){
updateESP32ID(email);
}

// useEffect(()=>{
// updateESP32ID(email)
// },[])

// setInterval(()=>updateESP32ID(email), 15000);


  return (
    <div className="vehicledashboard-dashboard">
      <div className='vehicledashboard-header-wraper'>  
        <div className="vehicledashboard-header">
          <p>Hello,</p>
          <h1>{User?.name}</h1>
        </div>  
        <div className="vehicledashboard-icon">
          <img src={Logo} aria-label="icon" alt='logo' />
        </div>
      </div> 

      <div className="vehicledashboard-search-section">
        <button onClick={searchparkingHandeler} className="vehicledashboard-search-button">
          Search for parking <img src={Logo2} alt="search icon" />
        </button>
      </div>

      <div className="vehicledashboard-wallet-section">
        {state === false && (
          <div className='vehicledashboard-wallet-section-w'>
            <div className="vehicledashboard-wallet">
              <p onClick={()=>{update()}} className='vdd-w'><img src={Logo3} alt="wallet icon" /> Wallet</p>
              <p>Balance: <strong className='vdwm'>Rs {amount}</strong></p>
            </div>
            <button onClick={() => setState(true)} className="vehicledashboard-add-money-button">Add money ➜</button>
          </div>
        )}
        {state === true && (
          <div className='payment'>
            <div className='payment-left'>
              <p>Enter amount</p>
              <input 
                type="number" 
                onChange={amountHandler} 
                value={amount} 
                required 
                placeholder='XXX' 
              />
            </div>
            <div className='payment-right'>
              <button onClick={() => setState(false)} className='payment-cancel'>Cancel</button>
              <button onClick={procedHandeler}>Proceed</button>
            </div>
          </div>
        )}
      </div>

      <section className="vehicledashboard-vehicles-section">
        <div className='yourve'>
          <p>Your</p>
          <h2> Vehicles</h2>
        </div>
        <div className="vehicledashboard-vehicles">
          {vehicle.map((e, index) => (
            <div key={index} className="vehicledashboard-vehicle-card">
              <img src={Logo} aria-label="icon" alt='logo' />
              <div className='vehicle-data'>
                <p className='name'>{e?.name} {e?.brand}</p>
                <p>{e?.number}</p>
              </div>
              <button><FaRegArrowAltCircleRight /></button>
            </div>
          ))}
        </div>
        <button onClick={() => navigate("/addcar")} className="vehicledashboard-add-car-button">Add a car ➜</button>
      </section>
  
      <Footer />
    </div>
  );
}

export default Dashboard;