import "./Caraddsucc.css";
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
        <h2 className="addcar-header">Add Car</h2>
        <div className="addcar-input-wraper">
            <h2 className="caraddsuc-h2"><div>Car</div> <div>successfully</div> added!</h2>
            <button onClick={()=>navigate("/dashboard")}>Go back</button>
            
        </div>
        <Footer/>
    </div>
    )
}

export default Caraddsucc;