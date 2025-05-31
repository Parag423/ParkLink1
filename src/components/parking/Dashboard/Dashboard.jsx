import React, { useState } from 'react';
import './Dashboard.css';
import Logo from "../../../assets/logo.png";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import Footer from '../../common/footer/Footer';
import { useNavigate } from 'react-router';
import Logo2 from "../../../assets/Road_fill.png";
import Logo3 from "../../../assets/Wallet_fill.png";
import { Addmoney } from '../../../services/operations/Addmoney';
import Logo4 from "../../../assets/Speed_fill.png";
import { apiConnector } from '../../../services/apiconnector';
import { parking_api } from '../../../services/apis';
function Dashboard() {

  const User = JSON.parse(localStorage.getItem('user'));
    const navigate=useNavigate();
    const [state,setState]=useState(false);
    const [amount,setAmount]=useState();
    //email tu local storage r pora lole hol.
    const [email,setEmail]=useState();
  
    const [vehicle, setVehicle] = useState([]);

function amountHandeler(e){
   setAmount(e.target.value);
   console.log(amount);
}    

//backend call for recharge.
function procedHandeler(){
  console.log(amount);
  // convert from paisa to rupee
  setAmount(amount*100);
  Addmoney(email,amount,navigate);
}

async function lotsdetails() {
  try{

    var email=User.email;
    const res=await apiConnector("POST",parking_api.LOTSDETAILS,{email});
    setVehicle(res.data.parkingLot)
    
    
  }
  catch(error){
   
  }
}

const timer = setTimeout(() => {
  lotsdetails();
}, 4000); // 2000ms = 2 seconds


function searchparkingHandeler(){
  navigate("/searchparking")
}
 

  return (
    <div className="vehicledashboard-dashboard">
      <div className='vehicledashboard-header-wraper'>  
      <div className="vehicledashboard-header">
        <p>Hello,</p>
        <h1>{User?.name}</h1>
     </div>  
        <div className="vehicledashboard-icon">
          <img src={Logo} aria-label="icon" alt='logo'/>
        </div>
       </div> 
      

     

      <div className="vehicledashboard-wallet-section">
      <div className='vehicledashboard-wallet-section-w'>
            <div className="vehicledashboard-wallet">
            <p className='vd-w'><img src={Logo4}/><p className='ptrt'>Total Revenue</p></p>
            
            {/* <p className='parkinglotsownerdashboard-p'>This month: <strong className='vdwm'>Rs 7780</strong></p> */}
            <p className='parkinglotsownerdashboard-p parkinglotsownerdashboard-2p'>All time: <strong className='vdwm'>Rs {User?.Blance==null?'0':User?.Blance}</strong></p>
            </div>
            <button onClick={()=>navigate("/parkinglotsowner/transactions")} className="parkinglotsownerdashboard-all-trn-btn">All transaction ➜</button>
        </div>
       
      </div>

      <section className="vehicledashboard-vehicles-section">
        <div className='yourve'>
        <p>Your</p>
        <h2> Lots</h2>
        </div>
        <div className="vehicledashboard-vehicles">
          {vehicle.map((e,index)=>{
             return  <div key={index} className="vehicledashboard-vehicle-card">
              <img src={Logo} aria-label="icon" alt='logo'/>
                <div className='vehicle-data'>
                  <p className='name'>{e?.name}</p>
                  <p>{e?.number}</p>
                </div>
                <p className='parkinglotsownerdashoard-numberoflotsavailable'>{e.parking_available}/{e.total_capacity}<span> full</span></p>
              </div>
          })}
        </div>
        <button onClick={()=>navigate("/addlot")} className="vehicledashboard-add-car-button">Add a lot ➜</button>
      </section>
      <section className='parkinglotsowner-maintenance-wraper'>
         <h2>Maintenance</h2>
         <div className='parkinglotsowner-maintenance-p'>
           <p >Call us ➜</p>
           <p>Email us ➜</p>
         </div>
      </section>

      <Footer/>
    </div>
  );
}

export default Dashboard;