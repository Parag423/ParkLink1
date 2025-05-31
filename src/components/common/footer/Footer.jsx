import "./Footer.css";
import Logo from "../../../assets/logo.png";


const Footer=()=>{

    return (
        <footer className="vehicledashboard-footer">
        <div className="vehicledashboard-footer-links">
          <div className="vehicledashboard-footer-links-group">
            <a href="#">Signup as a service provider</a>
            <a href="#">About us</a>
            <a href="#">Contact us</a>
          </div>
          <div className="vehicledashboard-footer-links-group" >
            <a href="#">Career</a>
            <a href="#">Blog</a>
            <a href="#">Help & support</a>
          </div>
          <div className="vehicledashboard-footer-links-group">
            <a href="#">Terms</a>
            <a href="#">Privacy policy</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
        <div className="vehicledashboard-footer-log-right-reserverd">
            <div className="vehicledashboard-footer-logo">
            <img  src={Logo} alt="logo" />ParkLink
            </div>
            <p>© 2024 ParkLink.</p>
        </div>
      </footer>
    )
}

export default Footer;