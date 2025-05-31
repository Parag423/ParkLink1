import './App.css';
import { Route, Routes } from "react-router-dom";
import Home from "./components/vehicle/home/home";
import { ToastContainer } from 'react-toastify';
import Otp from './components/vehicle/otp/Otp';
import Login from './components/vehicle/login/login';
import Signup from './components/vehicle/signup/signup';
import Dashboard from "./components/vehicle/dashboard/dashboard";
import SearchParking from './components/vehicle/SearchParking/SearchParking'; 
import Addcar from "./components/vehicle/Addcar/Addcar";
import Caraddsucc from './components/vehicle/Caraddsucc/Caraddsucc';
import Parkinglotsownerdashboard from "./components/parking/Dashboard/Dashboard";
import Transaction from './components/parking/Transactions/Transactions';
import ParkingOwnerSignup from './components/parking/signup/signup';
import AddLot from "./components/parking/AddLot/AddLot";
import Lotaddsucc from "./components/parking/Lotaddsucc/Lotaddsucc";

function App() {
 
  return (
    <div className="App">
       <ToastContainer /> 

     <Routes>
         <Route path="/" element={<Home/>} />
         <Route path='/vehicle/otp' element={<Otp/>}/>
         <Route path='/login' element={<Login/>}/>
         <Route path='/signup' element={<Signup/>}/> 
         <Route path='/dashboard' element={<Dashboard/>}/>
         <Route path='/searchparking' element={<SearchParking/>}/>
         <Route path='/addcar' element={<Addcar/>}/>
         <Route path='/caraddsucc' element={<Caraddsucc/>}/>
         <Route path='/lotaddsucc' element={<Lotaddsucc/>}/>
         <Route path='/parkinglotsownerdashboard' element={<Parkinglotsownerdashboard/>}/>
         <Route path='//parkinglotsowner/transactions' element={<Transaction/>}/>
         <Route path='/ParkingOwnerSignup' element={<ParkingOwnerSignup/>}/>
         <Route path='/addlot' element={<AddLot/>}/>
      </Routes>
      
     
    </div>
  );
}

export default App;
