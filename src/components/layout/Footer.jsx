
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

function Footer() {
  return (
    <footer className="main-footer">

      <div className="footer-inner">

        <div className="footer-brand">
          <Link to="/" className="navbar-brand">
            <span className="navbar-logo">
              <GraduationCap size={25} />
            </span>
            <span>Learn<span>Hub</span></span>
          </Link>

          <p>
            Your learning journey starts here.
            Discover courses, develop skills and achieve your goals.
          </p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/my-learning">My Learning</Link>
        </div>

        <div className="footer-column">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LearnHub. All rights reserved.</p>
        <p>Learn. Practice. Achieve.</p>
      </div>

    </footer>
  );
}

export default Footer;
