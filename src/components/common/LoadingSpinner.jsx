
import "./LoadingSpinner.css";

function LoadingSpinner({
  message = "Loading...",
}) {
  return (
    <div
      className="common-loading-container"
      role="status"
      aria-live="polite"
    >
      <div
        className="common-loading-spinner"
        aria-hidden="true"
      />

      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
