import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  getAdminOrders,
  refundAdminOrder,
} from "../../services/adminService";

import "../../styles/admin-orders.css";

function extractOrders(response) {
  const candidates = [
    response?.data?.data?.orders,
    response?.data?.orders,
    response?.data?.data,
    response?.data,
    response?.orders,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getOrderId(order) {
  return (
    order?._id ||
    order?.id ||
    order?.orderId ||
    order?.paymentIntentId ||
    ""
  );
}

function getCustomerName(order) {
  const customer =
    order?.user ||
    order?.customer ||
    order?.userId ||
    order?.buyer;

  if (typeof customer === "string") {
    return customer;
  }

  return (
    customer?.name ||
    customer?.fullName ||
    order?.customerName ||
    order?.name ||
    "Customer information unavailable"
  );
}

function getCustomerEmail(order) {
  const customer =
    order?.user ||
    order?.customer ||
    order?.userId ||
    order?.buyer;

  if (typeof customer === "object" && customer !== null) {
    return customer.email || "—";
  }

  return order?.email || order?.customerEmail || "—";
}

function getCourseName(order) {
  const course = order?.course || order?.courseId;

  if (typeof course === "string") {
    return course;
  }

  return (
    course?.name ||
    order?.courseName ||
    order?.productName ||
    "Course information unavailable"
  );
}

function getOrderAmount(order) {
  const amount =
    order?.amount ??
    order?.totalAmount ??
    order?.price ??
    order?.paymentInfo?.amount ??
    order?.amountPaid;

  if (amount === undefined || amount === null || amount === "") {
    return null;
  }

  const number = Number(amount);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function getOrderStatus(order) {
  return (
    order?.status ||
    order?.paymentStatus ||
    order?.paymentInfo?.status ||
    order?.orderStatus ||
    "UNKNOWN"
  )
    .toString()
    .toUpperCase();
}

function getOrderDate(order) {
  const value =
    order?.createdAt ||
    order?.date ||
    order?.orderDate ||
    order?.paidAt;

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

function formatAmount(amount) {
  if (amount === null) {
    return "—";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refundingOrderId, setRefundingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminOrders();

      console.log("ADMIN ORDERS API RESPONSE:", response);

      setOrders(extractOrders(response));
    } catch (error) {
      console.error(
        "FETCH ORDERS ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const availableStatuses = useMemo(() => {
    return [
      ...new Set(orders.map((order) => getOrderStatus(order))),
    ].sort();
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderId = getOrderId(order).toString().toLowerCase();
      const customerName = getCustomerName(order).toLowerCase();
      const email = getCustomerEmail(order).toLowerCase();
      const courseName = getCourseName(order).toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        orderId.includes(searchValue) ||
        customerName.includes(searchValue) ||
        email.includes(searchValue) ||
        courseName.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        getOrderStatus(order) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((total, order) => {
      const amount = getOrderAmount(order);
      const status = getOrderStatus(order);

      if (
        amount !== null &&
        !["REFUNDED", "CANCELLED", "FAILED"].includes(status)
      ) {
        return total + amount;
      }

      return total;
    }, 0);
  }, [orders]);

  const paidOrders = useMemo(() => {
    return orders.filter((order) => {
      return ["PAID", "SUCCESS", "SUCCEEDED", "COMPLETED"].includes(
        getOrderStatus(order)
      );
    }).length;
  }, [orders]);

  const refundedOrders = useMemo(() => {
    return orders.filter(
      (order) => getOrderStatus(order) === "REFUNDED"
    ).length;
  }, [orders]);

  const handleRefund = async (order) => {
    const orderId = getOrderId(order);

    if (!orderId) {
      toast.error("This order does not have an identifiable order ID.");
      return;
    }

    const status = getOrderStatus(order);

    if (["REFUNDED", "CANCELLED", "FAILED"].includes(status)) {
      toast.error("This order cannot be refunded in its current status.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to refund order ${orderId}?\n\nThis action may refund the payment and remove the student's enrollment.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRefundingOrderId(orderId);

      const response = await refundAdminOrder(orderId);

      console.log("REFUND API RESPONSE:", response);

      toast.success("Refund request processed successfully.");

      await fetchOrders();
    } catch (error) {
      console.error(
        "REFUND ORDER ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to process refund."
      );
    } finally {
      setRefundingOrderId(null);
    }
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-heading">
        <div>
          <h1>Orders Management</h1>
          <p>View course purchases and manage payment refunds.</p>
        </div>

        <button
          className="orders-refresh-btn"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="orders-summary-grid">
        <div className="orders-summary-card">
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="orders-summary-card">
          <span>Successful Orders</span>
          <h2>{paidOrders}</h2>
        </div>

        <div className="orders-summary-card">
          <span>Refunded Orders</span>
          <h2>{refundedOrders}</h2>
        </div>

        <div className="orders-summary-card">
          <span>Order Amount Total*</span>
          <h2>{formatAmount(totalRevenue)}</h2>
        </div>
      </div>

      <p className="orders-revenue-note">
        *Calculated from available order amount fields, excluding
        refunded, cancelled, and failed orders. This is not an
        accounting or settlement report.
      </p>

      {/* SEARCH AND FILTER */}

      <div className="orders-toolbar">
        <input
          type="search"
          placeholder="Search by order ID, customer, email or course..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Statuses</option>

          {availableStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* ORDERS TABLE */}

      <div className="orders-table-container">
        {loading ? (
          <div className="orders-message">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-message">
            No orders found.
          </div>
        ) : (
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order, index) => {
                const orderId = getOrderId(order);
                const status = getOrderStatus(order);

                const cannotRefund = [
                  "REFUNDED",
                  "CANCELLED",
                  "FAILED",
                ].includes(status);

                return (
                  <tr key={orderId || index}>
                    <td>
                      <span className="order-id-text">
                        {orderId || "ID unavailable"}
                      </span>
                    </td>

                    <td>
                      <div className="order-customer">
                        <strong>{getCustomerName(order)}</strong>
                        <small>{getCustomerEmail(order)}</small>
                      </div>
                    </td>

                    <td>{getCourseName(order)}</td>

                    <td>
                      {formatAmount(getOrderAmount(order))}
                    </td>

                    <td>{getOrderDate(order)}</td>

                    <td>
                      <span
                        className={`order-status-badge order-status-${status.toLowerCase()}`}
                      >
                        {status.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>
                      <button
                        className="order-refund-btn"
                        disabled={
                          cannotRefund ||
                          !orderId ||
                          refundingOrderId === orderId
                        }
                        onClick={() => handleRefund(order)}
                      >
                        {refundingOrderId === orderId
                          ? "Processing..."
                          : status === "REFUNDED"
                            ? "Refunded"
                            : "Refund"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="orders-results-count">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>
    </div>
  );
}

export default AdminOrders;