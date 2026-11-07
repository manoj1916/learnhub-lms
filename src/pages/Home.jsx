
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="simple-home">

      <div className="home-content">
        <span className="home-tag">WELCOME TO LEARNHUB</span>

        <h1>
          Your Learning Journey
          <span> Starts Here.</span>
        </h1>

        <p>
          Explore courses, develop new skills and achieve your
          learning goals with LearnHub.
        </p>

        <div className="home-actions">
          <Link to="/courses" className="home-primary">
            Explore Courses
          </Link>

          <Link to="/register" className="home-secondary">
            Get Started
          </Link>
        </div>
      </div>

    </div>
  );
}

export default Home;
