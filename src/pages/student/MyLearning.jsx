
import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { getDemoPurchases } from "../../services/marketplaceService";
import "./student.css";

function MyLearning() {
  const purchases = getDemoPurchases();

  return (
    <section className="student-page">

      <div className="student-page-heading">
        <div>
          <span className="student-eyebrow">
            YOUR CLASSROOM
          </span>

          <h1>My Learning</h1>

          <p>
            All your successfully purchased courses are listed here.
          </p>
        </div>

        <GraduationCap size={36} />
      </div>

      <div className="my-learning-count">
        <BookOpen size={19} />

        <span>Enrolled courses</span>

        <strong>{purchases.length}</strong>
      </div>

      {purchases.length === 0 ? (
        <div className="student-empty">

          <BookOpen size={42} />

          <h2>Your learning journey starts here</h2>

          <p>
            You haven't purchased any courses yet.
            Explore the marketplace, choose a course,
            and confirm your payment to add it here.
          </p>

          <Link
            to="/courses"
            className="student-action-link"
          >
            Explore Courses
            <ArrowRight size={16} />
          </Link>

        </div>
      ) : (
        <div className="student-course-grid">

          {purchases.map((course) => (
            <article
              className="student-course-card"
              key={course.courseId}
            >

              {course.thumbnail?.url ? (
                <img
                  src={course.thumbnail.url}
                  alt={course.name || "Course"}
                />
              ) : (
                <div className="student-course-image-placeholder">
                  <GraduationCap size={42} />
                </div>
              )}

              <div className="student-course-card-body">

                <span className="purchased-course-label">
                  <CheckCircle2 size={14} />
                  ENROLLED
                </span>

                <h2>
                  {course.name || "Untitled course"}
                </h2>

                <p>
                  {course.description ||
                    "Continue learning and build your skills with this course."}
                </p>

                <div className="student-course-card-actions">

                  <strong>
                    ₹{Number(course.price ?? 0).toLocaleString("en-IN")}
                  </strong>

                  <Link to={`/courses/${course.courseId}`}>
                    View course
                    <ArrowRight size={15} />
                  </Link>

                </div>

              </div>
            </article>
          ))}

        </div>
      )}

    </section>
  );
}

export default MyLearning;
