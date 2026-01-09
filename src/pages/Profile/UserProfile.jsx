import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./UserProfile.css";
import { useNavigate, useSearchParams } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeSection, setActiveSection] = useState("details");

  const [user, setUser] = useState(null);

  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ Review permissions cache
  // { [productId]: { canReview, alreadyReviewed, delivered } }
  const [reviewStatusMap, setReviewStatusMap] = useState({});

  // ✅ Review modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const token = localStorage.getItem("token") || localStorage.getItem("userToken");

  // ⭐ Read section from URL: /profile?section=orders, /profile?section=wishlist
  useEffect(() => {
    const sectionFromURL = searchParams.get("section");
    if (sectionFromURL) setActiveSection(sectionFromURL);
  }, [searchParams]);

  // ============================
  // Fetch user info
  // ============================
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data;
        setUser(u);

        setDetails({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
        });

        const addr = u.address || {};
        setAddress({
          street: addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          pincode: addr.pincode || "",
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [token]);

  // ============================
  // Fetch orders
  // ============================
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(res.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, [token]);

  // ============================
  // Fetch wishlist
  // ============================
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWishlist(res.data.items || []);
      } catch (err) {
        console.error("Error loading wishlist:", err);
      }
    };

    fetchWishlist();
  }, [token]);

  // ============================
  // Load review status for all products in orders
  // ============================
  const loadReviewStatus = async (productId) => {
    if (!token || !productId) return;

    // cached
    if (reviewStatusMap[productId]) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/products/${productId}/reviews/can-review`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviewStatusMap((prev) => ({
        ...prev,
        [productId]: res.data,
      }));
    } catch (err) {
      console.error("Error checking review status:", err);
    }
  };

  // ✅ after orders load, prefetch review status for all ordered products
  useEffect(() => {
    const ids = new Set();
    (orders || []).forEach((o) => {
      (o.items || []).forEach((it) => {
        if (it.product?._id) ids.add(it.product._id);
      });
    });

    ids.forEach((id) => loadReviewStatus(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  // ============================
  // Update details
  // ============================
  const updateDetails = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/profile", details, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated!");
    } catch (err) {
      console.error("Error updating details:", err);
      alert("Failed to update profile.");
    }
  };

  // ============================
  // Update address
  // ============================
  const updateAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/profile/address", address, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Address updated!");
    } catch (err) {
      console.error("Error updating address:", err);
      alert("Failed to update address.");
    }
  };

  // ============================
  // Change password
  // ============================
  const changePassword = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      await axios.put("http://localhost:5000/api/profile/change-password", passwords, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      alert(err.response?.data?.message || "Failed to update password.");
    }
  };

  // ============================
  // Wishlist actions
  // ============================
  const removeWishlist = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/wishlist/remove",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist((prev) => prev.filter((i) => i.product._id !== productId));
    } catch (err) {
      console.error("Error removing wishlist item:", err);
    }
  };

  const moveToCart = async (product) => {
    const productId = product?._id;
    if (!productId) return;

    // ✅ disable if out of stock
    if (Number(product.stock) <= 0) {
      alert("This product is out of stock. You cannot add it to cart.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/wishlist/move-to-cart",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlist((prev) => prev.filter((i) => i.product._id !== productId));
      alert("Moved to cart!");
    } catch (err) {
      console.error("Error moving item to cart:", err);
      alert("Failed to move item to cart.");
    }
  };

  // ============================
  // Review modal
  // ============================
  const openReviewModal = async (orderId, product) => {
    if (!product?._id) return;

    // refresh review status before opening (so user cannot cheat)
    try {
      const res = await axios.get(
        `http://localhost:5000/api/products/${product._id}/reviews/can-review`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviewStatusMap((prev) => ({
        ...prev,
        [product._id]: res.data,
      }));

      if (!res.data?.canReview) {
        alert(res.data?.alreadyReviewed ? "You already reviewed this product." : "Review allowed only after delivery.");
        return;
      }
    } catch (err) {
      console.error("Error checking review status:", err);
      alert("Could not verify review permission.");
      return;
    }

    setReviewMsg("");
    setReviewSubmitting(false);
    setReviewOrderId(orderId);
    setReviewProduct(product);
    setReviewRating(5);
    setReviewComment("");
    setReviewOpen(true);
  };

  const closeReviewModal = () => {
    if (reviewSubmitting) return;
    setReviewOpen(false);
    setReviewOrderId("");
    setReviewProduct(null);
    setReviewRating(5);
    setReviewComment("");
    setReviewMsg("");
  };

  const submitReview = async () => {
    if (!token || !reviewProduct?._id) return;

    setReviewSubmitting(true);
    setReviewMsg("");

    try {
      await axios.post(
        `http://localhost:5000/api/products/${reviewProduct._id}/reviews`,
        { rating: Number(reviewRating), comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ update local review status so button becomes "Reviewed"
      setReviewStatusMap((prev) => ({
        ...prev,
        [reviewProduct._id]: { ...prev[reviewProduct._id], canReview: false, alreadyReviewed: true },
      }));

      setReviewMsg("✅ Review submitted successfully!");
      setTimeout(() => closeReviewModal(), 700);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit review.";
      setReviewMsg(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ============================
  // Phone validity warning
  // ============================
  const phoneInvalid = useMemo(() => {
    const p = String(details.phone || "").trim();
    if (!p) return false;
    return !/^\d{10,15}$/.test(p);
  }, [details.phone]);

  const statusClass = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "delivered") return "status delivered";
    if (s === "shipped") return "status shipped";
    return "status pending";
  };

  return (
    <div className="user-profile-page">
      <aside className="profile-sidebar">
        <h2>My Profile</h2>
        <ul>
          <li className={activeSection === "details" ? "active" : ""} onClick={() => setActiveSection("details")}>
            My Details
          </li>
          <li className={activeSection === "address" ? "active" : ""} onClick={() => setActiveSection("address")}>
            My Address
          </li>
          <li className={activeSection === "wishlist" ? "active" : ""} onClick={() => setActiveSection("wishlist")}>
            My Wishlist
          </li>
          <li className={activeSection === "orders" ? "active" : ""} onClick={() => setActiveSection("orders")}>
            My Orders
          </li>
          <li className={activeSection === "password" ? "active" : ""} onClick={() => setActiveSection("password")}>
            Change Password
          </li>
        </ul>
      </aside>

      <div className="profile-content">
        {/* ---------------- MY DETAILS ---------------- */}
        {activeSection === "details" && (
          <div className="content-box fade">
            <h2>My Details</h2>

            {phoneInvalid && (
              <div className="profile-error">
                Phone number in your profile is invalid. Please update it in My Profile.
              </div>
            )}

            <form onSubmit={updateDetails}>
              <input
                type="text"
                placeholder="Full Name"
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                value={details.email}
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
              />

              <button type="submit">Save Details</button>
            </form>
          </div>
        )}

        {/* ---------------- ADDRESS ---------------- */}
        {activeSection === "address" && (
          <div className="content-box fade">
            <h2>My Address</h2>
            <form onSubmit={updateAddress} className="address-form">
              <input
                type="text"
                placeholder="Street"
                value={address.street || ""}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <input
                type="text"
                placeholder="City"
                value={address.city || ""}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="State"
                value={address.state || ""}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
              <input
                type="text"
                placeholder="Pincode"
                value={address.pincode || ""}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              />
              <button type="submit">Save Address</button>
            </form>
          </div>
        )}

        {/* ---------------- WISHLIST ---------------- */}
        {activeSection === "wishlist" && (
          <div className="content-box fade">
            <h2>My Wishlist</h2>

            {wishlist.length === 0 ? (
              <p>No items in wishlist.</p>
            ) : (
              <div className="wishlist-items">
                {wishlist.map((item) => {
                  const p = item.product;
                  const outOfStock = Number(p?.stock) <= 0;

                  return (
                    <div className="wishlist-card" key={p._id}>
                      <img src={p.imageUrl} alt={p.name} className="wishlist-img" />

                      <div className="wishlist-info">
                        <h3 className="wishlist-title">{p.name}</h3>
                        <p className="wishlist-price">₹{p.price}</p>
                        <p className={`wishlist-stock ${outOfStock ? "oos" : "ok"}`}>
                          {outOfStock ? "Out of stock" : "In stock"}
                        </p>
                      </div>

                      <div className="wishlist-actions">
                        <button
                          className="move-btn"
                          disabled={outOfStock}
                          onClick={() => moveToCart(p)}
                          title={outOfStock ? "Out of stock" : "Move to cart"}
                        >
                          Move to Cart
                        </button>

                        <button className="remove-btn" onClick={() => removeWishlist(p._id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------- ORDERS ---------------- */}
        {activeSection === "orders" && (
          <div className="content-box fade">
            <div className="orders-header">
              <h2>My Orders</h2>
              <p className="orders-sub">Track your orders and review delivered products.</p>
            </div>

            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const status = order.status || "Pending";
                  const isDelivered = String(status).toLowerCase() === "delivered";

                  return (
                    <div className="order-card modern" key={order._id}>
                      <div className="order-top">
                        <div className="order-top-left">
                          <div className="order-id">
                            <span>ORDER</span>
                            <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                          </div>
                          <div className="order-date">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                          </div>
                        </div>

                        <div className="order-top-right">
                          <span className={statusClass(status)}>{status}</span>
                          <div className="order-total">
                            Total: <strong>₹{order.totalPrice ?? order.total ?? 0}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="order-items-grid">
                        {(order.items || []).map((it, idx) => {
                          const p = it.product;
                          if (!p?._id) return null;

                          const rs = reviewStatusMap[p._id];
                          const alreadyReviewed = !!rs?.alreadyReviewed;
                          const canReview = !!rs?.canReview;

                          return (
                            <div className="order-item-row" key={p._id || idx}>
                              <img src={p.imageUrl} alt={p.name} className="order-item-img" />

                              <div className="order-item-info">
                                <div className="order-item-name">{p.name}</div>

                                <div className="order-item-meta">
                                  <span>
                                    Qty: <strong>{it.quantity}</strong>
                                  </span>
                                  <span>
                                    Price: <strong>₹{p.price}</strong>
                                  </span>
                                </div>

                                {isDelivered ? (
                                  <div className="order-item-actions">
                                    <button
                                      className="review-btn"
                                      disabled={!canReview}
                                      onClick={() => openReviewModal(order._id, p)}
                                      title={alreadyReviewed ? "Already reviewed" : "Write review"}
                                    >
                                      {alreadyReviewed ? "Reviewed" : "Write Review"}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="order-item-actions">
                                    <span className="review-lock">Review available after delivery</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="order-bottom">
                        <button className="view-order-btn modern" onClick={() => navigate(`/orders/${order._id}`)}>
                          View Order Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------- CHANGE PASSWORD ---------------- */}
        {activeSection === "password" && (
          <div className="content-box fade">
            <h2>Change Password</h2>
            <form onSubmit={changePassword}>
              <input
                type="password"
                placeholder="Current Password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              />
              <button type="submit">Update Password</button>
            </form>
          </div>
        )}
      </div>

      {/* ✅ REVIEW MODAL */}
      {reviewOpen && (
        <div className="review-modal-overlay" onClick={closeReviewModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-head">
              <h3>Write a Review</h3>
              <button className="review-close" onClick={closeReviewModal} disabled={reviewSubmitting}>
                ×
              </button>
            </div>

            <div className="review-product">
              {reviewProduct?.imageUrl && <img src={reviewProduct.imageUrl} alt={reviewProduct.name} />}
              <div>
                <div className="review-product-name">{reviewProduct?.name}</div>
                <div className="review-product-sub">Order: #{reviewOrderId.slice(-8).toUpperCase()}</div>
              </div>
            </div>

            {reviewMsg && <div className="review-msg">{reviewMsg}</div>}

            <div className="review-stars-picker">
              <span className="label">Rating:</span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`star ${reviewRating >= n ? "on" : ""}`}
                    onClick={() => setReviewRating(n)}
                    disabled={reviewSubmitting}
                    aria-label={`${n} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="review-textarea"
              rows={4}
              placeholder="Write your review..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              disabled={reviewSubmitting}
            />

            <button className="review-submit" onClick={submitReview} disabled={reviewSubmitting}>
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>

            <p className="review-note">
              Reviews can be submitted only after the order is <b>Delivered</b>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
