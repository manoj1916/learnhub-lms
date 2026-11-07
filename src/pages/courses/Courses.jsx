import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  BookOpen,
  Star,
  ArrowRight,
  X,
  Heart,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

import {
  getWishlist,
  toggleWishlist,
} from "../../services/marketplaceService";

import "./Courses.css";

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function getWishlistCourseId(item) {
  const course = item?.course || item;

  const id =
    course?._id ||
    item?.courseId ||
    item?.course?._id;

  return id ? String(id) : null;
}

function Courses() {
  const { isAuthenticated } = useAuth();

  const [courses, setCourses] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlistBusy, setWishlistBusy] = useState([]);

  // Fetch public courses from the existing endpoint.
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/v1/course/get-courses"
      );

      console.log(
        "Public Courses API Response:",
        response.data
      );

      if (!Array.isArray(response.data?.courses)) {
        throw new Error(
          "The courses array was not found in the API response."
        );
      }

      setCourses(response.data.courses);
    } catch (err) {
      console.error(
        "Courses API error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch the logged-in user's wishlist.
  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistIds([]);
      return;
    }

    try {
      const response = await getWishlist();

      console.log("Wishlist API Response:", response);

      const data = response?.data ?? response;

      const items = Array.isArray(data?.wishlist)
        ? data.wishlist
        : [];

      const ids = items
        .map(getWishlistCourseId)
        .filter(Boolean);

      setWishlistIds(ids);
    } catch (err) {
      console.error(
        "Wishlist API error:",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to load wishlist."
      );
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  // Add or remove a course from the real backend wishlist.
  const handleWishlist = async (courseId) => {
    if (!isAuthenticated) {
      toast("Please log in to use your wishlist.");
      return;
    }

    if (wishlistBusy.includes(courseId)) {
      return;
    }

    try {
      setWishlistBusy((previous) => [
        ...previous,
        courseId,
      ]);

      const response = await toggleWishlist(courseId);

      console.log("Wishlist Toggle Response:", response);

      // The exact response property has not yet been confirmed.
      // Re-fetch the wishlist instead of guessing the result.
      await fetchWishlist();

      toast.success(
        response?.message || "Wishlist updated."
      );
    } catch (err) {
      console.error(
        "Wishlist toggle error:",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to update wishlist."
      );
    } finally {
      setWishlistBusy((previous) =>
        previous.filter((id) => id !== courseId)
      );
    }
  };

  // Derive available categories from real course records.
  const categories = useMemo(() => {
    return [
      ...new Set(
        courses
          .map((course) => course.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [courses]);

  // Search and category filtering.
  const filteredCourses = useMemo(() => {
    const searchWords = normalizeText(search);

    return courses.filter((course) => {
      const searchableWords = normalizeText(
        [
          course.name,
          course.description,
          course.category,
          course.level,
          course.tags,
        ].join(" ")
      );

      const matchesSearch = searchWords.every((word) =>
        searchableWords.includes(word)
      );

      const matchesCategory =
        selectedCategory === "all" ||
        course.category?.toLowerCase() ===
          selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [courses, search, selectedCategory]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
  };

  if (loading) {
    return (
      <div className="courses-message">
        <div className="loader" />
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-message error-message">
        <h2>Something went wrong</h2>
        <p>{error}</p>

        <button onClick={fetchCourses}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="courses-page">
      <div className="courses-header">
        <div>
          <span className="courses-label">
            LEARN SOMETHING NEW
          </span>

          <h1>Explore Courses</h1>

          <p>
            Discover courses and develop skills at your own pace.
          </p>
        </div>
      </div>

      <div className="courses-toolbar">
        <div>
          <h2>All Courses</h2>

          <p>
            Browse our available learning programs.
          </p>
        </div>

        <div className="courses-search">
          <Search size={20} />

          <input
            type="search"
            placeholder="Search courses..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="courses-filter-row">
        <div className="category-filter">
          <label htmlFor="category">
            Filter by Category
          </label>

          <select
            id="category"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="clear-filters"
          onClick={clearFilters}
        >
          Clear filters
        </button>
      </div>

      <div className="courses-count">
        Showing {filteredCourses.length} of {courses.length} courses
      </div>

      {filteredCourses.length === 0 ? (
        <div className="courses-message">
          <BookOpen size={42} />

          <h3>No courses found</h3>

          <p>
            Try changing your search or category filter.
          </p>

          <button
            type="button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => {
            const courseId = String(course._id);

            const wishlisted =
              wishlistIds.includes(courseId);

            const busy =
              wishlistBusy.includes(courseId);

            return (
              <article
                className="course-card"
                key={courseId}
              >
                <div className="course-image">
                  {course.thumbnail?.url ? (
                    <img
                      src={course.thumbnail.url}
                      alt={course.name || "Course"}
                    />
                  ) : (
                    <div className="course-image-placeholder">
                      <BookOpen size={45} />
                    </div>
                  )}

                  {course.level && (
                    <span className="course-level">
                      {course.level}
                    </span>
                  )}

                  <button
                    type="button"
                    className={`course-wishlist-button ${
                      wishlisted ? "wishlisted" : ""
                    }`}
                    onClick={() => handleWishlist(courseId)}
                    disabled={busy}
                    aria-label={
                      wishlisted
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                    title={
                      wishlisted
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    <Heart
                      size={21}
                      fill={
                        wishlisted
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>

                <div className="course-card-content">
                  <div className="course-category">
                    {course.category || "General"}
                  </div>

                  <h3>{course.name}</h3>

                  <p className="course-description">
                    {course.description ||
                      "No description available."}
                  </p>

                  <div className="course-meta">
                    <span>
                      <Star size={16} />
                      {course.ratings ?? 0}
                    </span>

                    <span>
                      <BookOpen size={16} />
                      {course.courseData?.length ?? 0} lessons
                    </span>
                  </div>

                  <div className="course-card-footer">
                    <div className="course-price">
                      <strong>₹{course.price ?? 0}</strong>

                      {course.estimatedPrice >
                        course.price && (
                        <del>
                          ₹{course.estimatedPrice}
                        </del>
                      )}
                    </div>

                    <Link
                      to={`/courses/${courseId}`}
                      className="view-course-button"
                    >
                      View Course
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Courses;