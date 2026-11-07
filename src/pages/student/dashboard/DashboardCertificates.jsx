import { Award, RefreshCw } from "lucide-react";

function DashboardCertificates({
  certificates,
  featureLoading,
  loadCertificates,
}) {
  return (
    <section className="student-settings-section">
      <div className="student-page-heading">
        <div>
          <span className="student-eyebrow">
            YOUR ACHIEVEMENTS
          </span>

          <h1>My Certificates</h1>

          <p>
            Certificates returned by your LearnHub account.
          </p>
        </div>

        <button
          type="button"
          className="student-refresh-button"
          onClick={loadCertificates}
          disabled={featureLoading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {featureLoading ? (
        <p>Loading certificates...</p>
      ) : certificates.length === 0 ? (
        <div className="student-empty">
          <Award size={42} />

          <h2>No certificates available yet</h2>

          <p>
            Complete an eligible course to earn a certificate.
          </p>
        </div>
      ) : (
        <div className="student-record-list">
          {certificates.map((certificate, index) => (
            <article
              key={
                certificate._id ||
                certificate.id ||
                index
              }
              className="student-record-card"
            >
              <Award size={25} />

              <div>
                <h3>
                  {certificate.courseName ||
                    certificate.title ||
                    certificate.name ||
                    "Course Certificate"}
                </h3>

                <p>
                  {certificate.issuedAt
                    ? new Date(
                        certificate.issuedAt
                      ).toLocaleDateString()
                    : "Certificate issued"}
                </p>
              </div>

              {certificate._id && (
                <a
                  href={`/api/v1/lms/certificates/${certificate._id}/download`}
                >
                  View / Download
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardCertificates;