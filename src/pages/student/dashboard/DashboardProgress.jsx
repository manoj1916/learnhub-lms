import {
  ChartNoAxesCombined,
  RefreshCw,
} from "lucide-react";

function DashboardProgress({
  progress,
  featureLoading,
  loadProgress,
}) {
  return (
    <section className="student-settings-section">
      <div className="student-page-heading">
        <div>
          <span className="student-eyebrow">
            YOUR PERFORMANCE
          </span>

          <h1>Learning Progress</h1>

          <p>
            Your learning analytics from LearnHub.
          </p>
        </div>

        <button
          type="button"
          className="student-refresh-button"
          onClick={loadProgress}
          disabled={featureLoading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {featureLoading ? (
        <p>Loading learning progress...</p>
      ) : Array.isArray(progress) && progress.length > 0 ? (
        <div className="student-record-list">
          {progress.map((item, index) => {
            const course =
              item.course || item.courseId || item;

            const courseName =
              course.title ||
              course.name ||
              course.courseName ||
              item.courseName ||
              "Course";

            const rawProgress =
              item.progressPercentage ??
              item.completionPercentage ??
              item.completedPercentage ??
              item.percentage ??
              (typeof item.progress === "number"
                ? item.progress
                : item.progress?.percentage ??
                  item.progress?.progressPercentage) ??
              item.progress?.completedPercentage ??
              0;

            const percentage = Math.max(
              0,
              Math.min(100, Number(rawProgress) || 0)
            );

            return (
              <article
                key={
                  item._id ||
                  item.id ||
                  course._id ||
                  course.id ||
                  index
                }
                className="student-record-card"
              >
                <ChartNoAxesCombined size={25} />

                <div style={{ flex: 1 }}>
                  <h3>{courseName}</h3>

                  <p>{percentage}% completed</p>

                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#e5e7eb",
                      borderRadius: "999px",
                      overflow: "hidden",
                      marginTop: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "#6d5dfc",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="student-empty">
          <ChartNoAxesCombined size={42} />

          <h2>No learning progress available yet</h2>

          <p>
            Your enrolled courses will appear here as progress is recorded.
          </p>
        </div>
      )}
    </section>
  );
}

export default DashboardProgress;