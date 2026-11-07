import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  getAdminEnrollments,
  exportAdminEnrollments,
} from "../../services/adminService";

import "../../styles/admin-enrollments.css";

function extractEnrollments(response) {
  const candidates = [
    response?.data?.data?.enrollments,
    response?.data?.enrollments,
    response?.data?.data,
    response?.data,
    response?.enrollments,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getEnrollmentId(enrollment) {
  return (
    enrollment?._id ||
    enrollment?.id ||
    enrollment?.enrollmentId ||
    ""
  );
}

function getStudent(enrollment) {
  return (
    enrollment?.user ||
    enrollment?.student ||
    enrollment?.userId ||
    enrollment?.studentId ||
    enrollment?.learner ||
    null
  );
}

function getStudentName(enrollment) {
  const student = getStudent(enrollment);

  if (typeof student === "string") {
    return student;
  }

  return (
    student?.name ||
    student?.fullName ||
    enrollment?.studentName ||
    enrollment?.userName ||
    "Student information unavailable"
  );
}

function getStudentEmail(enrollment) {
  const student = getStudent(enrollment);

  if (typeof student === "object" && student !== null) {
    return student.email || "—";
  }

  return enrollment?.email || enrollment?.studentEmail || "—";
}

function getCourse(enrollment) {
  return enrollment?.course || enrollment?.courseId || null;
}

function getCourseName(enrollment) {
  const course = getCourse(enrollment);

  if (typeof course === "string") {
    return course;
  }

  return (
    course?.name ||
    enrollment?.courseName ||
    "Course information unavailable"
  );
}

function getProgress(enrollment) {
  const value =
    enrollment?.progress ??
    enrollment?.progressPercentage ??
    enrollment?.completionPercentage ??
    enrollment?.completion ??
    null;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.min(100, Math.max(0, number));
}

function getEnrollmentDate(enrollment) {
  const value =
    enrollment?.createdAt ||
    enrollment?.enrolledAt ||
    enrollment?.enrollmentDate ||
    enrollment?.date;

  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getEnrollmentStatus(enrollment) {
  if (enrollment?.completed === true || enrollment?.isCompleted === true) {
    return "COMPLETED";
  }

  if (enrollment?.completed === false || enrollment?.isCompleted === false) {
    return "IN PROGRESS";
  }

  const status =
    enrollment?.status ||
    enrollment?.enrollmentStatus ||
    enrollment?.progressStatus;

  if (status) {
    return String(status).toUpperCase().replaceAll("_", " ");
  }

  const progress = getProgress(enrollment);

  if (progress === 100) {
    return "COMPLETED";
  }

  if (progress !== null && progress > 0) {
    return "IN PROGRESS";
  }

  return "ACTIVE";
}

function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminEnrollments();

      console.log("ADMIN ENROLLMENTS API RESPONSE:", response);

      setEnrollments(extractEnrollments(response));
    } catch (error) {
      console.error(
        "FETCH ENROLLMENTS ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load enrollments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const studentName = getStudentName(enrollment).toLowerCase();
      const studentEmail = getStudentEmail(enrollment).toLowerCase();
      const courseName = getCourseName(enrollment).toLowerCase();
      const enrollmentId = getEnrollmentId(enrollment)
        .toString()
        .toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        studentName.includes(searchValue) ||
        studentEmail.includes(searchValue) ||
        courseName.includes(searchValue) ||
        enrollmentId.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        getEnrollmentStatus(enrollment) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, search, statusFilter]);

  const completedCount = useMemo(() => {
    return enrollments.filter(
      (enrollment) =>
        getEnrollmentStatus(enrollment) === "COMPLETED"
    ).length;
  }, [enrollments]);

  const inProgressCount = useMemo(() => {
    return enrollments.filter(
      (enrollment) =>
        getEnrollmentStatus(enrollment) === "IN PROGRESS"
    ).length;
  }, [enrollments]);

  const activeCount = useMemo(() => {
    return enrollments.filter(
      (enrollment) =>
        getEnrollmentStatus(enrollment) === "ACTIVE"
    ).length;
  }, [enrollments]);

  const handleExport = async () => {
    try {
      setExporting(true);

      const blob = await exportAdminEnrollments();

      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error("The export returned an empty file.");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "admin-enrollments.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Enrollment CSV downloaded.");
    } catch (error) {
      console.error(
        "EXPORT ENROLLMENTS ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        "Unable to export enrollments. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  const statuses = useMemo(() => {
    return [
      ...new Set(
        enrollments.map((enrollment) =>
          getEnrollmentStatus(enrollment)
        )
      ),
    ].sort();
  }, [enrollments]);

  return (
    <div className="admin-enrollments-page">
      <div className="admin-enrollments-heading">
        <div>
          <h1>Enrollments Management</h1>
          <p>Monitor students enrolled in your courses.</p>
        </div>

        <div className="enrollment-heading-actions">
          <button
            className="enrollment-refresh-btn"
            onClick={fetchEnrollments}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <button
            className="enrollment-export-btn"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "↓ Export CSV"}
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="enrollment-summary-grid">
        <div className="enrollment-summary-card">
          <span>Total Enrollments</span>
          <h2>{enrollments.length}</h2>
        </div>

        <div className="enrollment-summary-card">
          <span>Completed</span>
          <h2>{completedCount}</h2>
        </div>

        <div className="enrollment-summary-card">
          <span>In Progress</span>
          <h2>{inProgressCount}</h2>
        </div>

        <div className="enrollment-summary-card">
          <span>Active / Not Started</span>
          <h2>{activeCount}</h2>
        </div>
      </div>

      {/* SEARCH AND FILTER */}

      <div className="enrollment-toolbar">
        <input
          type="search"
          placeholder="Search student, email, course or enrollment ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* ENROLLMENTS TABLE */}

      <div className="enrollments-table-container">
        {loading ? (
          <div className="enrollments-message">
            Loading enrollments...
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="enrollments-message">
            No enrollments found.
          </div>
        ) : (
          <table className="admin-enrollments-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Enrollment Date</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Enrollment ID</th>
              </tr>
            </thead>

            <tbody>
              {filteredEnrollments.map((enrollment, index) => {
                const enrollmentId = getEnrollmentId(enrollment);
                const progress = getProgress(enrollment);
                const status = getEnrollmentStatus(enrollment);

                return (
                  <tr key={enrollmentId || index}>
                    <td>
                      <div className="enrollment-student">
                        <strong>
                          {getStudentName(enrollment)}
                        </strong>

                        <small>
                          {getStudentEmail(enrollment)}
                        </small>
                      </div>
                    </td>

                    <td>{getCourseName(enrollment)}</td>

                    <td>{getEnrollmentDate(enrollment)}</td>

                    <td>
                      {progress === null ? (
                        <span className="enrollment-no-progress">
                          Not provided
                        </span>
                      ) : (
                        <div className="enrollment-progress">
                          <div className="enrollment-progress-track">
                            <div
                              className="enrollment-progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <span>{progress}%</span>
                        </div>
                      )}
                    </td>

                    <td>
                      <span
                        className={`enrollment-status-badge enrollment-status-${status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>
                      <span className="enrollment-id-text">
                        {enrollmentId || "Not available"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="enrollment-results-count">
        Showing {filteredEnrollments.length} of {enrollments.length} enrollments
      </p>
    </div>
  );
}

export default AdminEnrollments;