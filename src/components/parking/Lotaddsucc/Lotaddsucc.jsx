import "./Lotaddsucc.css";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import Logo from "../../../assets/logo.png";
import Footer from "../../common/footer/Footer";
import { useNavigate } from "react-router";

const Caraddsucc=()=>{

    const navigate=useNavigate();

    return (
        <div className="addcar-wraper">
        <div className="addcar-logobox">
            <MdKeyboardDoubleArrowLeft onClick={()=>navigate(-1)} className="arrow" />
            <img src={Logo} alt="Logo"/>
        </div>
        <h2 className="addcar-header">Add Lot</h2>
        <div className="addcar-input-wraper">
            <h2 className="caraddsuc-h2"><div>Request received.</div> <div>Our team will contact you shortly.</div></h2>
            <button onClick={()=>navigate("/parkinglotsownerdashboard")}>Go back</button>
            
        </div>
        <Footer/>
    </div>
    )
}

export default Caraddsucc;