// src/components/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import "./OrderDetails.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const OrderDetails = () => {
  const { id } = useParams(); // /orders/:id
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("userToken") || localStorage.getItem("token");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          err.response?.data?.message || "Failed to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrder();
    else {
      setError("You must be logged in to view order details.");
      setLoading(false);
    }
  }, [id, token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-card">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="order-details-card">
          <p className="order-error">{error || "Order not found."}</p>
          <button
            className="od-btn od-secondary"
            onClick={() => navigate("/profile?section=orders")}
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const itemCount =
    order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;

  const createdAt = new Date(order.createdAt).toLocaleString();

  return (
    <div className="order-details-page">
      <div className="order-details-card">
        {/* Header */}
        <div className="od-header">
          <div>
            <h1>Order details</h1>
            <p className="od-sub">
              Order <span className="od-strong">#{order._id}</span>
            </p>
          </div>
          <div className="od-header-meta">
            <p>
              <span className="od-label">Order placed: </span>
              <span>{createdAt}</span>
            </p>
            <p>
              <span className="od-label">Order total: </span>
              <span className="od-total">
                ₹{(order.totalPrice || 0).toFixed(2)}
              </span>
            </p>
            <p>
              <span className="od-label">Status: </span>
              <span>{order.status}</span>
            </p>
          </div>
        </div>

        {/* Two columns: shipping + items */}
        <div className="od-main">
          {/* Left: Shipping */}
          <div className="od-column od-left">
            <h3>Shipping address</h3>
            <p className="od-ship-name">
              {order.shippingDetails?.name || order.user?.name}
            </p>
            <p className="od-ship-address">
              {order.shippingDetails?.address || "-"}
            </p>
            <p className="od-ship-phone">
              Phone: {order.shippingDetails?.phone || "-"}
            </p>

            <h3 className="od-subtitle">Summary</h3>
            <p>
              <span className="od-label">Items:</span> {itemCount}
            </p>
            <p>
              <span className="od-label">Order total:</span>{" "}
              <span className="od-total">
                ₹{(order.totalPrice || 0).toFixed(2)}
              </span>
            </p>

            <div className="od-actions">
              <button className="od-btn od-primary" onClick={handlePrint}>
                🖨 Print / Save as PDF
              </button>
              <button
                className="od-btn od-secondary"
                onClick={() => navigate("/profile?section=orders")}
              >
                ⬅ Back to My Orders
              </button>
            </div>
          </div>

          {/* Right: Items */}
          <div className="od-column od-right">
            <h3>Items in this order</h3>
            <div className="od-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="od-item-row">
                  <div className="od-item-info">
                    {item.product?.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="od-item-image"
                      />
                    )}
                    <div>
                      <p className="od-item-name">
                        {item.product?.name || "Product"}
                      </p>
                      <p className="od-item-meta">
                        Qty: {item.quantity} · ₹
                        {(item.product?.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="od-item-subtotal">
                    ₹
                    {(
                      (item.product?.price || 0) * item.quantity
                    ).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
