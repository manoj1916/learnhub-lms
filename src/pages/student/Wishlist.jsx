
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Trash2,
  BookOpen,
  ShoppingCart,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getWishlistCourses,
  removeWishlistCourse,
} from "../../services/marketplaceService";

import "./Wishlist.css";

function Wishlist() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // Fetch wishlist courses through the service layer.
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);

      const wishlistCourses = await getWishlistCourses();

      setCourses(wishlistCourses);
    } catch (error) {
      console.error("Wishlist error:", error.response?.data || error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        toast.error("Please log in to view your wishlist.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Unable to load your wishlist."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Remove a course through the service layer.
  async function handleRemove(courseId) {
    try {
      setRemovingId(courseId);

      await removeWishlistCourse(courseId);

      setCourses((previous) =>
        previous.filter((course) => course._id !== courseId)
      );

      toast.success("Course removed from wishlist.");
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to remove course from wishlist."
      );
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="wishlist-spinner" />
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-heading">
          <div>
            <span className="wishlist-eyebrow">
              YOUR PERSONAL COLLECTION
            </span>

            <h1>
              My Wishlist <Heart size={27} />
            </h1>

            <p>
              Keep track of the courses you want to learn.
            </p>
          </div>

          <div className="wishlist-count">
            <Heart size={19} />
            <span>{courses.length} Saved Courses</span>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <Heart size={38} />
            </div>

            <h2>Your wishlist is empty</h2>

            <p>
              You haven't saved any courses yet. Explore our courses
              and click the heart icon to save the ones you like.
            </p>

            <Link
              to="/courses"
              className="wishlist-explore-button"
            >
              <BookOpen size={18} />
              Explore Courses
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            <div className="wishlist-toolbar">
              <h2>Saved Courses</h2>

              <button
                type="button"
                onClick={fetchWishlist}
                className="wishlist-refresh-button"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="wishlist-grid">
              {courses.map((course) => (
                <article
                  className="wishlist-card"
                  key={course._id}
                >
                  <div className="wishlist-image-wrapper">
                    <img
                      src={
                        course.thumbnail?.url ||
                        "https://placehold.co/600x400?text=LearnHub+Course"
                      }
                      alt={course.name || "Course"}
                    />

                    <button
                      type="button"
                      className="wishlist-remove-icon"
                      onClick={() => handleRemove(course._id)}
                      disabled={removingId === course._id}
                      title="Remove from wishlist"
                      aria-label={`Remove ${course.name} from wishlist`}
                    >
                      <Heart size={19} fill="currentColor" />
                    </button>

                    {course.level && (
                      <span className="wishlist-level">
                        {course.level}
                      </span>
                    )}
                  </div>

                  <div className="wishlist-card-content">
                    <span className="wishlist-category">
                      {course.category || "Course"}
                    </span>

                    <h3>{course.name}</h3>

                    <p className="wishlist-description">
                      {course.description ||
                        "Explore this course and develop your skills."}
                    </p>

                    <div className="wishlist-card-meta">
                      <span>
                        <BookOpen size={15} />
                        {course.courseData?.length || 0} Lessons
                      </span>
                    </div>

                    <div className="wishlist-card-bottom">
                      <div className="wishlist-price">
                        {course.estimatedPrice &&
                        Number(course.estimatedPrice) >
                          Number(course.price) ? (
                          <>
                            <strong>₹{course.price}</strong>
                            <del>₹{course.estimatedPrice}</del>
                          </>
                        ) : (
                          <strong>
                            ₹{course.price ?? "N/A"}
                          </strong>
                        )}
                      </div>

                      <Link
                        to={`/courses/${course._id}`}
                        className="wishlist-view-button"
                      >
                        View Course
                        <ArrowRight size={15} />
                      </Link>
                    </div>

                    <button
                      type="button"
                      className="wishlist-remove-button"
                      onClick={() => handleRemove(course._id)}
                      disabled={removingId === course._id}
                    >
                      <Trash2 size={15} />
                      {removingId === course._id
                        ? "Removing..."
                        : "Remove from Wishlist"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="wishlist-bottom-banner">
          <div>
            <h2>Ready to start learning?</h2>
            <p>
              Discover more courses and take the next step in your
              learning journey.
            </p>
          </div>

          <Link to="/courses">
            Browse Courses
            <ShoppingCart size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
