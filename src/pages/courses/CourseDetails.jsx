
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  GraduationCap,
  PlayCircle,
  Star,
  User,
  CreditCard,
  X,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

// import api from "../../api/axios";
import {
  addDemoPurchase,
  getDemoPurchases,
  getCourseById,
  getCourseContent,
} from "../../services/marketplaceService";
import "./CourseDetails.css";

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

 useEffect(() => {
  async function fetchCourseDetails() {
    try {
      setLoading(true);
      setError("");

      // Fetch course details through the service.
      const courseData = await getCourseById(courseId);

      if (!courseData) {
        throw new Error("Course details not found.");
      }

      setCourse(courseData);

      // Fetch course content through the service.
      try {
        const courseSections = await getCourseContent(courseId);
        setSections(courseSections);
      } catch (contentError) {
        console.error(
          "Course content error:",
          contentError.response?.data || contentError
        );

        setSections([]);
      }
    } catch (err) {
      console.error("Course details error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load course details."
      );
    } finally {
      setLoading(false);
    }
  }

  if (courseId) {
    fetchCourseDetails();
  }
}, [courseId]);
  const title = course?.name || "Course Details";
  const description =
    course?.description || "No description available.";

  const image = course?.thumbnail?.url || "";
  const price = Number(course?.price ?? 0);

  const level = course?.level || "All Levels";
  const rating = course?.rating ?? "New";

  const instructor =
    course?.instructor?.name ||
    course?.instructorName ||
    course?.createdBy?.name ||
    "Course Instructor";

  const tags =
    typeof course?.tags === "string"
      ? course.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : Array.isArray(course?.tags)
        ? course.tags
        : [];

  const benefits = Array.isArray(course?.benefits)
    ? course.benefits
    : [];

  const prerequisites = Array.isArray(course?.prerequisites)
    ? course.prerequisites
    : [];

  const alreadyPurchased = getDemoPurchases().some(
    (item) => item.courseId === courseId
  );

  function handleBuyNow() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error("Please log in before purchasing.");
      navigate("/login", {
        state: { from: `/courses/${courseId}` },
      });
      return;
    }

    if (alreadyPurchased) {
      toast.success("This course is already in My Learning.");
      navigate("/my-learning");
      return;
    }

    setShowPayment(true);
  }

  async function handleConfirmPayment() {
    if (processingPayment || !course) return;

    try {
      setProcessingPayment(true);

      // Simulated confirmation until a real payment gateway
      // and backend enrollment endpoint are connected.
      await new Promise((resolve) => setTimeout(resolve, 700));

      addDemoPurchase(course);

      setShowPayment(false);
      setPurchaseComplete(true);

      toast.success("Payment confirmed! Course added to My Learning.");
    } catch (err) {
      toast.error(err.message || "Payment confirmation failed.");
    } finally {
      setProcessingPayment(false);
    }
  }

  if (loading) {
    return (
      <div className="course-details-message">
        <div className="loader" />
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-details-message">
        <h2>Course unavailable</h2>
        <p>{error || "Course not found."}</p>

        <Link to="/courses" className="back-courses-link">
          <ArrowLeft size={17} />
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="course-details-page">

      <Link to="/courses" className="back-courses-link">
        <ArrowLeft size={17} />
        Back to Courses
      </Link>

      <section className="course-details-hero">

        <div className="course-details-info">

          <span className="course-details-label">
            {tags[0] || "ONLINE COURSE"}
          </span>

          <h1>{title}</h1>

          <p className="course-details-description">
            {description}
          </p>

          <div className="course-details-meta">
            <span>
              <Star size={17} />
              {rating}
            </span>

            <span>
              <GraduationCap size={18} />
              {level}
            </span>

            <span>
              <BookOpen size={17} />
              {sections.length > 0
                ? `${sections.length} Sections`
                : "Self-paced"}
            </span>
          </div>

          <div className="course-instructor">
            <User size={19} />
            <span>Instructor: {instructor}</span>
          </div>

        </div>

        <div className="course-details-card">

          {image ? (
            <img
              src={image}
              alt={title}
              className="course-details-image"
            />
          ) : (
            <div className="course-details-image-placeholder">
              <BookOpen size={65} />
            </div>
          )}

          <div className="course-details-card-content">

            <div className="details-price">
              ₹{price.toLocaleString("en-IN")}
            </div>

            <button
              className="enroll-button"
              onClick={handleBuyNow}
            >
              {alreadyPurchased
                ? "Go to My Learning"
                : "Buy Now"}
            </button>

            {alreadyPurchased && (
              <p className="already-purchased-note">
                You already own this course.
              </p>
            )}

          </div>
        </div>

      </section>

      {purchaseComplete && (
        <div className="purchase-success-banner">
          <CheckCircle2 size={21} />

          <div>
            <strong>Payment confirmed!</strong>
            <span>
              {title} is now available in My Learning.
            </span>
          </div>

          <Link to="/my-learning">
            Open My Learning
          </Link>
        </div>
      )}

      <section className="course-about-section">

        <h2>About This Course</h2>

        <p>{description}</p>

        {tags.length > 0 && (
          <>
            <h3>Course Tags</h3>

            <div className="course-tags">
              {tags.map((tag, index) => (
                <span key={`${tag}-${index}`}>
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        {benefits.length > 0 && (
          <>
            <h3>What You Will Learn</h3>

            <ul>
              {benefits.map((benefit, index) => (
                <li key={benefit._id || index}>
                  {benefit.title || benefit.name || "Course benefit"}
                </li>
              ))}
            </ul>
          </>
        )}

        {prerequisites.length > 0 && (
          <>
            <h3>Prerequisites</h3>

            <ul>
              {prerequisites.map((item, index) => (
                <li key={item._id || index}>
                  {item.title || item.name || "No details available"}
                </li>
              ))}
            </ul>
          </>
        )}

      </section>

      <section className="course-curriculum-section">

        <div className="curriculum-heading">
          <div>
            <h2>Course Content</h2>
            <p>
              Explore the available course sections and lectures.
            </p>
          </div>

          <span>
            <BookOpen size={17} />
            {sections.length} Sections
          </span>
        </div>

        {sections.length === 0 ? (
          <div className="curriculum-empty">
            <BookOpen size={35} />
            <p>Course content is not available yet.</p>
          </div>
        ) : (
          <div className="curriculum-list">

            {sections.map((section, index) => {
              const lectures =
                section.lectures ||
                section.lessons ||
                section.contents ||
                [];

              return (
                <article
                  className="curriculum-section"
                  key={section._id || section.id || index}
                >

                  <div className="curriculum-section-heading">
                    <div>
                      <h3>
                        {section.title ||
                          section.name ||
                          `Section ${index + 1}`}
                      </h3>

                      {section.description && (
                        <p>{section.description}</p>
                      )}
                    </div>

                    <span>{lectures.length} Lectures</span>
                  </div>

                  {lectures.length > 0 && (
                    <div className="lecture-list">

                      {lectures.map((lecture, lectureIndex) => (
                        <div
                          className="lecture-item"
                          key={lecture._id || lecture.id || lectureIndex}
                        >
                          <span className="lecture-icon">
                            <PlayCircle size={18} />
                          </span>

                          <span className="lecture-title">
                            {lecture.title ||
                              lecture.name ||
                              `Lecture ${lectureIndex + 1}`}
                          </span>

                          <span className="lecture-duration">
                            {lecture.duration && (
                              <>
                                <Clock size={14} />
                                {lecture.duration}
                              </>
                            )}
                          </span>
                        </div>
                      ))}

                    </div>
                  )}

                </article>
              );
            })}

          </div>
        )}

      </section>

      {showPayment && (
        <div
          className="payment-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !processingPayment
            ) {
              setShowPayment(false);
            }
          }}
        >
          <section
            className="payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
          >

            <button
              className="payment-modal-close"
              type="button"
              aria-label="Close payment confirmation"
              onClick={() => setShowPayment(false)}
              disabled={processingPayment}
            >
              <X size={20} />
            </button>

            <div className="payment-modal-icon">
              <CreditCard size={27} />
            </div>

            <span className="payment-modal-eyebrow">
              ORDER SUMMARY
            </span>

            <h2 id="payment-title">
              Confirm your payment
            </h2>

            <p className="payment-modal-description">
              Please review your course and payment amount.
            </p>

            <div className="payment-course-row">

              {image ? (
                <img src={image} alt="" />
              ) : (
                <div className="payment-course-placeholder">
                  <BookOpen size={25} />
                </div>
              )}

              <div>
                <strong>{title}</strong>
                <span>Lifetime course access</span>
              </div>

            </div>

            <div className="payment-total-row">
              <span>Total amount</span>
              <strong>
                ₹{price.toLocaleString("en-IN")}
              </strong>
            </div>

            <button
              className="payment-confirm-button"
              type="button"
              onClick={handleConfirmPayment}
              disabled={processingPayment}
            >
              {processingPayment
                ? "Confirming..."
                : `Confirm Payment · ₹${price.toLocaleString("en-IN")}`}
            </button>

            <button
              className="payment-cancel-button"
              type="button"
              onClick={() => setShowPayment(false)}
              disabled={processingPayment}
            >
              Cancel
            </button>

          </section>
        </div>
      )}

    </div>
  );
}

export default CourseDetails;
