import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  createAdminCourse,
  getAdminCourses,
  updateAdminCourseStatus,
} from "../../services/adminService";

import "../../styles/admin-courses.css";

const COURSE_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
];

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "",
  estimatedPrice: "",
  tags: "",
  level: "Beginner",
  demoUrl: "",
  thumbnail: "",
  benefits: "",
  prerequisites: "",
};

function extractCourses(response) {
  const possibleData = [
    response?.data?.data?.courses,
    response?.data?.courses,
    response?.data?.data,
    response?.data,
    response?.courses,
    response,
  ];

  for (const item of possibleData) {
    if (Array.isArray(item)) {
      return item;
    }
  }

  return [];
}

function getCourseId(course) {
  return course?._id || course?.id;
}

function formatPrice(price) {
  if (price === undefined || price === null || price === "") {
    return "—";
  }

  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingCourseId, setUpdatingCourseId] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminCourses();

      console.log("ADMIN COURSES API RESPONSE:", response);

      const coursesData = extractCourses(response);

      setCourses(coursesData);
    } catch (error) {
      console.error(
        "FETCH COURSES ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const courseName = course?.name || "";
      const courseStatus = course?.status || "DRAFT";

      const matchesSearch = courseName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        courseStatus.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [courses, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      total: courses.length,
      published: courses.filter(
        (course) => course.status?.toUpperCase() === "PUBLISHED"
      ).length,
      draft: courses.filter(
        (course) => course.status?.toUpperCase() === "DRAFT"
      ).length,
      review: courses.filter((course) =>
        ["SUBMITTED", "UNDER_REVIEW"].includes(
          course.status?.toUpperCase()
        )
      ).length,
    };
  }, [courses]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const convertToArray = (value) => {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.demoUrl.trim()
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    const price = Number(formData.price);
    const estimatedPrice = Number(formData.estimatedPrice);

    if (
      formData.price === "" ||
      formData.estimatedPrice === "" ||
      !Number.isFinite(price) ||
      !Number.isFinite(estimatedPrice) ||
      price < 0 ||
      estimatedPrice < 0
    ) {
      toast.error("Enter valid course prices.");
      return;
    }

    const courseData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      estimatedPrice,
      tags: convertToArray(formData.tags),
      level: formData.level,
      demoUrl: formData.demoUrl.trim(),
      benefits: convertToArray(formData.benefits),
      prerequisites: convertToArray(formData.prerequisites),
    };

    if (formData.thumbnail.trim()) {
      courseData.thumbnail = formData.thumbnail.trim();
    }

    try {
      setCreating(true);

      const response = await createAdminCourse(courseData);

      console.log("CREATE COURSE API RESPONSE:", response);

      toast.success("Course created successfully!");

      setFormData(INITIAL_FORM);
      setShowCreateForm(false);

      await fetchCourses();
    } catch (error) {
      console.error(
        "CREATE COURSE ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to create course."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (courseId, status) => {
    if (!courseId) {
      toast.error("Course ID is missing.");
      return;
    }

    try {
      setUpdatingCourseId(courseId);

      const response = await updateAdminCourseStatus(
        courseId,
        status
      );

      console.log("UPDATE COURSE STATUS RESPONSE:", response);

      toast.success("Course status updated.");

      await fetchCourses();
    } catch (error) {
      console.error(
        "UPDATE COURSE STATUS ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to update course status."
      );
    } finally {
      setUpdatingCourseId(null);
    }
  };

  return (
    <div className="admin-courses-page">
      <div className="admin-courses-heading">
        <div>
          <h1>Courses Management</h1>
          <p>Manage your LMS courses and publishing status.</p>
        </div>

        <button
          className="admin-primary-btn"
          onClick={() => setShowCreateForm((previous) => !previous)}
        >
          {showCreateForm ? "Close Form" : "+ Create Course"}
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="course-summary-grid">
        <div className="course-summary-card">
          <span>Total Courses</span>
          <h2>{statusCounts.total}</h2>
        </div>

        <div className="course-summary-card">
          <span>Published</span>
          <h2>{statusCounts.published}</h2>
        </div>

        <div className="course-summary-card">
          <span>Drafts</span>
          <h2>{statusCounts.draft}</h2>
        </div>

        <div className="course-summary-card">
          <span>Awaiting Review</span>
          <h2>{statusCounts.review}</h2>
        </div>
      </div>

      {/* CREATE COURSE FORM */}

      {showCreateForm && (
        <form
          className="create-course-form"
          onSubmit={handleCreateCourse}
        >
          <div className="create-course-title">
            <h2>Create New Course</h2>
            <p>Enter the course information below.</p>
          </div>

          <div className="course-form-grid">
            <div className="course-form-group">
              <label>Course Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Example: Complete React JS Course"
                required
              />
            </div>

            <div className="course-form-group">
              <label>Course Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="course-form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="999"
                required
              />
            </div>

            <div className="course-form-group">
              <label>Estimated Price (₹) *</label>
              <input
                type="number"
                name="estimatedPrice"
                min="0"
                value={formData.estimatedPrice}
                onChange={handleInputChange}
                placeholder="1999"
                required
              />
            </div>

            <div className="course-form-group course-form-full">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what students will learn..."
                rows="4"
                required
              />
            </div>

            <div className="course-form-group course-form-full">
              <label>Demo Video URL *</label>
              <input
                type="url"
                name="demoUrl"
                value={formData.demoUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/demo"
                required
              />
            </div>

            <div className="course-form-group course-form-full">
              <label>Thumbnail URL</label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="course-form-group">
              <label>Tags</label>
              <textarea
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="React, JavaScript, Frontend"
                rows="3"
              />
              <small>Separate multiple tags with commas.</small>
            </div>

            <div className="course-form-group">
              <label>Benefits</label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                placeholder="Build projects, Learn React..."
                rows="3"
              />
              <small>Separate multiple benefits with commas.</small>
            </div>

            <div className="course-form-group course-form-full">
              <label>Prerequisites</label>
              <textarea
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleInputChange}
                placeholder="Basic HTML, Basic JavaScript..."
                rows="3"
              />
              <small>Separate multiple prerequisites with commas.</small>
            </div>
          </div>

          <div className="course-form-actions">
            <button
              type="button"
              className="course-cancel-btn"
              onClick={() => {
                setShowCreateForm(false);
                setFormData(INITIAL_FORM);
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-primary-btn"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      )}

      {/* SEARCH AND FILTER */}

      <div className="course-toolbar">
        <input
          type="search"
          placeholder="Search courses by name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Statuses</option>

          {COURSE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <button
          className="course-refresh-btn"
          onClick={fetchCourses}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* COURSES TABLE */}

      <div className="courses-table-container">
        {loading ? (
          <div className="courses-message">
            Loading courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="courses-message">
            No courses found.
          </div>
        ) : (
          <table className="admin-courses-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Level</th>
                <th>Price</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredCourses.map((course, index) => {
                const courseId = getCourseId(course);
                const status = (
                  course.status || "DRAFT"
                ).toUpperCase();

                return (
                  <tr key={courseId || index}>
                    <td>
                      <div className="admin-course-name">
                        <strong>
                          {course.name || "Untitled Course"}
                        </strong>

                        <small>
                          ID: {courseId || "Not available"}
                        </small>
                      </div>
                    </td>

                    <td>{course.level || "—"}</td>

                    <td>{formatPrice(course.price)}</td>

                    <td>
                      <span
                        className={`course-status-badge status-${status.toLowerCase()}`}
                      >
                        {status.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>
                      <select
                        className="course-status-select"
                        value={status}
                        disabled={
                          updatingCourseId === courseId ||
                          !courseId
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            courseId,
                            event.target.value
                          )
                        }
                      >
                        {COURSE_STATUSES.map((courseStatus) => (
                          <option
                            key={courseStatus}
                            value={courseStatus}
                          >
                            {courseStatus.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>

                      {updatingCourseId === courseId && (
                        <small className="course-updating-text">
                          Updating...
                        </small>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="course-results-count">
        Showing {filteredCourses.length} of {courses.length} courses
      </p>
    </div>
  );
}

export default AdminCourses;