import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getAdminCoupons,
  createAdminCoupon,
} from "../../services/adminService";

import "../../styles/admin-coupons.css";

function getCouponsFromResponse(response) {
  const candidates = [
    response?.coupons,
    response?.data?.coupons,
    response?.data?.data?.coupons,
    response?.data,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCouponCode(coupon) {
  return coupon?.code || coupon?.couponCode || "Unnamed";
}

function getDiscountLabel(coupon) {
  const type = String(
    coupon?.discountType || coupon?.type || ""
  ).toLowerCase();

  const value = coupon?.discountValue ?? coupon?.value;

  if (value === undefined || value === null) {
    return "Not provided";
  }

  if (type === "percentage" || type === "percent") {
    return `${value}% OFF`;
  }

  if (type === "fixed") {
    return `₹${value} OFF`;
  }

  return `${value} (${type || "discount"})`;
}

function getCouponExpiry(coupon) {
  return coupon?.endDate || coupon?.expiryDate || coupon?.expiresAt;
}

function getCouponId(coupon) {
  return coupon?._id || coupon?.id || coupon?.couponId;
}

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    endDate: "",
    maxDiscount: "",
    minPurchaseAmount: "",
    courseId: "",
    usageLimit: "",
  });

  // ===============================
  // FETCH COUPONS
  // ===============================

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCoupons();

      console.log("ADMIN COUPONS API RESPONSE:", response);

      setCoupons(getCouponsFromResponse(response));
    } catch (err) {
      console.error("ADMIN COUPONS ERROR:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ===============================
  // FORM HANDLING
  // ===============================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      endDate: "",
      maxDiscount: "",
      minPurchaseAmount: "",
      courseId: "",
      usageLimit: "",
    });
  };

  // ===============================
  // CREATE COUPON
  // ===============================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    const code = formData.code.trim().toUpperCase();
    const discountValue = Number(formData.discountValue);

    if (!code) {
      setMessage("Please enter a coupon code.");
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setMessage("Discount value must be greater than zero.");
      return;
    }

    if (
      formData.discountType === "percentage" &&
      discountValue > 100
    ) {
      setMessage("Percentage discount cannot be greater than 100.");
      return;
    }

    if (!formData.endDate) {
      setMessage("Please select the coupon expiry date.");
      return;
    }

    const endDate = new Date(formData.endDate);

    if (Number.isNaN(endDate.getTime())) {
      setMessage("Please enter a valid expiry date.");
      return;
    }

    const couponData = {
      code,
      discountType: formData.discountType,
      discountValue,
      endDate: endDate.toISOString(),
    };

    // Optional fields are sent only when entered.
    if (formData.maxDiscount !== "") {
      couponData.maxDiscount = Number(formData.maxDiscount);
    }

    if (formData.minPurchaseAmount !== "") {
      couponData.minPurchaseAmount = Number(
        formData.minPurchaseAmount
      );
    }

    if (formData.courseId.trim()) {
      couponData.courseId = formData.courseId.trim();
    }

    if (formData.usageLimit !== "") {
      couponData.usageLimit = Number(formData.usageLimit);
    }

    try {
      setSubmitting(true);

      console.log("CREATING COUPON:", couponData);

      await createAdminCoupon(couponData);

      setMessage("Coupon created successfully!");

      resetForm();

      await fetchCoupons();
    } catch (err) {
      console.error("CREATE COUPON ERROR:", err);
      setMessage(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================
  // SEARCH COUPONS
  // ===============================

  const filteredCoupons = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return coupons;

    return coupons.filter((coupon) => {
      const code = getCouponCode(coupon).toLowerCase();

      const type = String(
        coupon?.discountType || coupon?.type || ""
      ).toLowerCase();

      return code.includes(search) || type.includes(search);
    });
  }, [coupons, searchTerm]);

  // ===============================
  // SUMMARY
  // ===============================

  const activeCoupons = coupons.filter((coupon) => {
    const expiry = getCouponExpiry(coupon);

    if (!expiry) return true;

    const expiryDate = new Date(expiry);

    return (
      !Number.isNaN(expiryDate.getTime()) &&
      expiryDate.getTime() >= Date.now()
    );
  }).length;

  const expiredCoupons = coupons.length - activeCoupons;

  // ===============================
  // UI
  // ===============================

  return (
    <div className="admin-coupons-page">
      {/* HEADER */}

      <div className="admin-coupons-header">
        <div>
          <span className="admin-coupons-eyebrow">
            MARKETING MANAGEMENT
          </span>

          <h1>Coupons</h1>

          <p>
            Create and manage discount coupons for your course marketplace.
          </p>
        </div>

        <button
          type="button"
          className="coupon-refresh-btn"
          onClick={fetchCoupons}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* SUMMARY */}

      <div className="coupon-stats">
        <div className="coupon-stat-card">
          <div className="coupon-stat-icon coupon-total-icon">
            %
          </div>

          <div>
            <p>Total Coupons</p>
            <h2>{coupons.length}</h2>
          </div>
        </div>

        <div className="coupon-stat-card">
          <div className="coupon-stat-icon coupon-active-icon">
            ✓
          </div>

          <div>
            <p>Not Expired</p>
            <h2>{activeCoupons}</h2>
          </div>
        </div>

        <div className="coupon-stat-card">
          <div className="coupon-stat-icon coupon-expired-icon">
            ◷
          </div>

          <div>
            <p>Expired</p>
            <h2>{expiredCoupons}</h2>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="coupon-message coupon-error">
          <span>{error}</span>

          <button type="button" onClick={fetchCoupons}>
            Retry
          </button>
        </div>
      )}

      {message && (
        <div className="coupon-message">
          {message}
        </div>
      )}

      {/* CREATE COUPON FORM */}

      <section className="coupon-form-card">
        <div className="coupon-section-heading">
          <div>
            <h2>Create New Coupon</h2>
            <p>Configure a discount code for your customers.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="coupon-form-grid">
            <div className="coupon-field">
              <label htmlFor="coupon-code">
                Coupon Code <span>*</span>
              </label>

              <input
                id="coupon-code"
                type="text"
                name="code"
                placeholder="Example: WELCOME20"
                value={formData.code}
                onChange={handleChange}
                required
                maxLength={50}
              />

              <small>
                Customers will enter this code when purchasing a course.
              </small>
            </div>

            <div className="coupon-field">
              <label htmlFor="discount-type">
                Discount Type <span>*</span>
              </label>

              <select
                id="discount-type"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                required
              >
                <option value="percentage">
                  Percentage (%)
                </option>

                <option value="fixed">
                  Fixed Amount (₹)
                </option>
              </select>
            </div>

            <div className="coupon-field">
              <label htmlFor="discount-value">
                Discount Value <span>*</span>
              </label>

              <input
                id="discount-value"
                type="number"
                name="discountValue"
                placeholder={
                  formData.discountType === "percentage"
                    ? "Example: 20"
                    : "Example: 500"
                }
                value={formData.discountValue}
                onChange={handleChange}
                min="0.01"
                max={
                  formData.discountType === "percentage"
                    ? "100"
                    : undefined
                }
                step="any"
                required
              />
            </div>

            <div className="coupon-field">
              <label htmlFor="coupon-end-date">
                Expiry Date <span>*</span>
              </label>

              <input
                id="coupon-end-date"
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)}
                required
              />
            </div>

            <div className="coupon-field">
              <label htmlFor="max-discount">
                Maximum Discount Amount
              </label>

              <input
                id="max-discount"
                type="number"
                name="maxDiscount"
                placeholder="Example: 1000"
                value={formData.maxDiscount}
                onChange={handleChange}
                min="0"
                step="any"
              />
            </div>

            <div className="coupon-field">
              <label htmlFor="min-purchase">
                Minimum Purchase Amount
              </label>

              <input
                id="min-purchase"
                type="number"
                name="minPurchaseAmount"
                placeholder="Example: 2000"
                value={formData.minPurchaseAmount}
                onChange={handleChange}
                min="0"
                step="any"
              />
            </div>

            <div className="coupon-field">
              <label htmlFor="usage-limit">
                Usage Limit
              </label>

              <input
                id="usage-limit"
                type="number"
                name="usageLimit"
                placeholder="Example: 100"
                value={formData.usageLimit}
                onChange={handleChange}
                min="1"
                step="1"
              />

              <small>
                Maximum number of times this coupon can be used.
              </small>
            </div>

            <div className="coupon-field">
              <label htmlFor="course-id">
                Course ID
              </label>

              <input
                id="course-id"
                type="text"
                name="courseId"
                placeholder="Optional course ID"
                value={formData.courseId}
                onChange={handleChange}
              />

              <small>
                Leave empty if the coupon is not restricted to a course.
              </small>
            </div>
          </div>

          {/* DISCOUNT PREVIEW */}

          <div className="coupon-preview">
            <div className="coupon-preview-icon">
              <span>%</span>
            </div>

            <div>
              <span>DISCOUNT PREVIEW</span>

              <h3>
                {formData.discountValue
                  ? formData.discountType === "percentage"
                    ? `${formData.discountValue}% OFF`
                    : `₹${formData.discountValue} OFF`
                  : "Your discount will appear here"}
              </h3>

              <p>
                {formData.code
                  ? `Coupon code: ${formData.code.toUpperCase()}`
                  : "Enter a coupon code above"}
              </p>
            </div>
          </div>

          <div className="coupon-form-actions">
            <button
              type="submit"
              className="coupon-create-btn"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Coupon"}
            </button>

            <button
              type="button"
              className="coupon-clear-btn"
              onClick={resetForm}
            >
              Clear Form
            </button>
          </div>
        </form>
      </section>

      {/* COUPON LIST */}

      <section className="coupon-list-card">
        <div className="coupon-section-heading coupon-list-heading">
          <div>
            <h2>All Coupons</h2>
            <p>View the discount coupons available in your marketplace.</p>
          </div>

          <div className="coupon-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search coupon code..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="coupon-empty-state">
            Loading coupons...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="coupon-empty-state">
            <div className="coupon-empty-icon">%</div>

            <h3>No coupons found</h3>

            <p>
              {searchTerm
                ? "Try another coupon code."
                : "Create your first coupon using the form above."}
            </p>
          </div>
        ) : (
          <div className="coupon-table-wrapper">
            <table className="coupon-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Discount</th>
                  <th>Minimum Purchase</th>
                  <th>Usage Limit</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredCoupons.map((coupon, index) => {
                  const expiry = getCouponExpiry(coupon);
                  const expiryDate = expiry ? new Date(expiry) : null;

                  const isExpired =
                    expiryDate &&
                    !Number.isNaN(expiryDate.getTime()) &&
                    expiryDate.getTime() < Date.now();

                  return (
                    <tr key={getCouponId(coupon) || index}>
                      <td>
                        <div className="coupon-code-cell">
                          <div className="coupon-code-icon">%</div>

                          <strong>{getCouponCode(coupon)}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="coupon-discount">
                          {getDiscountLabel(coupon)}
                        </span>
                      </td>

                      <td>
                        {coupon?.minPurchaseAmount != null
                          ? `₹${coupon.minPurchaseAmount}`
                          : "No minimum"}
                      </td>

                      <td>
                        {coupon?.usageLimit ?? "Unlimited"}
                      </td>

                      <td>{formatDate(expiry)}</td>

                      <td>
                        <span
                          className={`coupon-status ${
                            isExpired
                              ? "coupon-status-expired"
                              : "coupon-status-active"
                          }`}
                        >
                          {isExpired ? "Expired" : "Not expired"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="coupon-table-footer">
          Showing {filteredCoupons.length} of {coupons.length} coupons
        </div>
      </section>
    </div>
  );
}

export default AdminCoupons;