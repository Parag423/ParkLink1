import "./SearchParking.css";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import Logo from "../../../assets/logo.png";
import logo2 from "../../../assets/Road_fill.png";
import { useNavigate } from "react-router";
import parkingImage from "../../../assets/test.png";
import { FaRegBookmark } from 'react-icons/fa';
import { useEffect, useState } from "react";
import Footer from "../../common/footer/Footer";
import { apiConnector } from "../../../services/apiconnector";
import { vehicle_api } from "../../../services/apis";
import toast from "react-hot-toast";
import LoadingPage from "../../Loading/Loading";
import { FaBookmark } from "react-icons/fa";

const SearchParking=()=>{
    const [book,setBook]=useState([]);
    const navigate=useNavigate();
    const [flg,setFlg]=useState(false);
    const [parkinglots,setParkinglots]=useState([]);
    const [token,setToken]=useState();
    const esp32id="jsdnjsd";
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [error, setError] = useState(null);

    const User = JSON.parse(localStorage.getItem('user'));
    
   

    async function findparking(){
        try{
         
            setFlg(true);
            console.log(flg);
            toast.loading("Loading...");
            setToken(User?.token);

            console.log("tokenis",token)
            console.log("Enter in findparking");
            var latitude=location?.latitude;
            var longitude=location?.longitude;
            console.log("latitude is",latitude);
          const res=await apiConnector("POST",vehicle_api.FINDPARKING_API,{latitude,longitude,token})
          console.log("findparking res",res);
          setParkinglots(res?.data?.parkingLots)
          var email=User?.email;
          console.log(1)
          const res1 =await apiConnector("POST",vehicle_api.GETESP32,{email});
          console.log(2)
          console.log(res1);
          setBook(res1.data.esp32Ids);
          toast.dismiss();
          setFlg(false);
        
        }
        catch(error){
            toast.dismiss();
            
           console.log(error);
        }
    }


    async function checkagain(){
        try{
         
            
            console.log(flg);
           
            setToken(User?.token);

            console.log("tokenis",token)
            console.log("Enter in findparking");
            var latitude=location?.latitude;
            var longitude=location?.longitude;
            console.log("latitude is",latitude);
          const res=await apiConnector("POST",vehicle_api.FINDPARKING_API,{latitude,longitude,token})
          console.log("findparking res",res);
          setParkinglots(res?.data?.parkingLots)
          var email=User?.email;
          console.log(1)
          const res1 =await apiConnector("POST",vehicle_api.GETESP32,{email});
          console.log(2)
          console.log(res1);
          setBook(res1.data.esp32Ids);
     
        
        
        }
        catch(error){
            toast.dismiss();
            
           console.log(error);
        }
    }


    // useEffect(() => {
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(
    //             (position) => {
    //                 setLocation({
    //                     latitude: position.coords.latitude,
    //                     longitude: position.coords.longitude
    //                 });
    //             },
    //             (error) => {
    //                 setError(error.message);
    //             }
    //         );
    //     } else {
    //         setError("Geolocation is not supported by this browser.");
    //         navigate(-1);
    //     }
    //     console.log(location);
    //     //Location pwar pist  backend call korim . And process tu nohok logi loding show krim.
       
    // }, []);

    useEffect(() => {
        const fetchLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (error) => {
                        setError(error.message);
                    }
                );
            } else {
                setError("Geolocation is not supported by this browser.");
                navigate(-1);
            }
        };
    
        if (!location.latitude) {
            const interval = setInterval(() => {
                fetchLocation();
                console.log("Retrying to fetch location...");
            }, 4000); // Retry every 3 seconds
    
            return () => clearInterval(interval); // Cleanup interval on component unmount
        }
    
        console.log(location);
        // Location fetch successful; backend call logic here
    
    }, [location.latitude, navigate]);

    useEffect(()=>{
        findparking();
        console.log("Findparking solil");
    },[location]);


        const timer = setTimeout(() => {
            checkagain();
            console.log("Findparking solil");
        }, 8000); // 2000ms = 2 seconds
    


    async function bookHandeler(e){
        try{
           
            const esp32id=e?.parkinglotsesp32id   ;
              
       const res=await apiConnector("POST",vehicle_api.BOOKPARKING_API,{esp32id,token});
       var email=User?.email;
       const res1 =await apiConnector("POST",vehicle_api.GETESP32,{email});
       console.log(res1);
       setBook(res1.data.esp32Ids);
       console.log("array is",book);
       var latitude=location?.latitude;
       var longitude=location?.longitude;
       const res2=await apiConnector("POST",vehicle_api.FINDPARKING_API,{latitude,longitude,token})
          console.log("findparking res",res);
          setParkinglots(res2?.data?.parkingLots)
        }
        catch(error){
            console.log(error)
        }
    }
// Data for testing purpose . Data will get from backend in the same formate


function navigateHandeler(latitude,longitude)
{
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

// Open the URL in a new tab
window.open(googleMapsUrl, '_blank');

}

async function cancelHandeler(e) {
    
    try{
        const esp32id=e?.parkinglotsesp32id   ;
              
    const res=await apiConnector("POST",vehicle_api.UNBOOKPARKING_API,{esp32id,token});
    var email=User?.email;
    const res1 =await apiConnector("POST",vehicle_api.GETESP32,{email});
    console.log(res1);
    setBook(res1.data.esp32Ids);
    console.log("array is",book);
    var latitude=location?.latitude;
    var longitude=location?.longitude;
    const res2=await apiConnector("POST",vehicle_api.FINDPARKING_API,{latitude,longitude,token})
       console.log("findparking res",res);
       setParkinglots(res2?.data?.parkingLots)
    }
    catch(error){
      console.log(error);
    }
}
    return(
        <div>{flg && <LoadingPage/>}
       {!flg &&
        <div className="searchparking-wraper">
        <div className="searchparking-logo-wraper">
            <MdKeyboardDoubleArrowLeft  onClick={()=>navigate(-1)}  className="serchparking-arrow"/>
            <img src={Logo} alt="Logo"/>
        </div>
        <h2 className="searchparking-heading">Parkings in your area <img src={logo2}/></h2>
        <h3 className="searchparking-yourlocationis">Your location is</h3>
        {/* <h5 className="searchparking-locationname">Barpeta,Assam</h5> */}
        <p className="searchparking-long">Latitude:{location?.latitude}</p>
        <p className="searchparking-long">Longitude:{location?.longitude}</p>
        <div className="searchparking-card-wraper">
                {
                    parkinglots.map((e)=>{
                        return <div className="parking-lot-card">
                        <div>
                            <div className="card-header">
                                <h2>{e?.name}</h2>
                              {!book.includes(e.parkinglotsesp32id) && <FaRegBookmark className="bookmark-icon" />}
                              {book.includes(e.parkinglotsesp32id) && <FaBookmark className="bookmark-icon" />}
                               
                            </div>
                            <div className="card-details">
                                <h6>{e?.address}</h6>
                                <p>Latitude: {e?.latitude}"</p>
                                <p>Longitude: {e?.longitude}"</p>
                            </div>
                            <div className="card-free-slots">
                                <span>Free slots:</span>
                                <strong>{e?.parking_available}/{e?.total_capacity}</strong>
                            </div>
                        
                            {!book.includes(e.parkinglotsesp32id) &&  <button onClick={()=>{bookHandeler(e)}} className="book-button">Book now</button>}
                            {book.includes(e.parkinglotsesp32id) &&  <button onClick={()=>{cancelHandeler(e)}} className="book-button">Cancel</button>}
                            <button className="navigate-button" onClick={()=>{navigateHandeler(e?.latitude,e?.longitude)}}>Navigate</button>
                        </div>
                          <div className="searchparking-image-wraper">
                          <img src={parkingImage} alt="Parking lot" className="card-image" /> 
                          </div>
                    </div>
                    })
                }
        </div>
        <div className="searchparking-footer-margine"></div>
        <Footer/>
    </div>}
        </div>
    )
}


export default SearchParking;