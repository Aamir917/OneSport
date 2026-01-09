import React, { useState, useEffect } from "react";
import "./checkoutform.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CheckoutForm = ({ cart, totalPrice, onComplete }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  const token =
    localStorage.getItem("token") || localStorage.getItem("userToken");

  // Load user details automatically
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        if (!token) {
          setLoadingProfile(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data;

        const fullAddress = `${u.address?.street || ""}, ${
          u.address?.city || ""
        }, ${u.address?.state || ""} - ${u.address?.pincode || ""}`;

        setFormData({
          name: u.name || "",
          phone: u.phone || "",
          address: fullAddress.trim().replace(/^,|,$/g, ""),
        });
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUserDetails();
  }, [token]);

  // We no longer let user change fields here, but we still validate
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.profile = "Name is missing in your profile.";
    if (!formData.address.trim())
      newErrors.profile = "Address is missing in your profile.";
    if (!formData.phone.trim())
      newErrors.profile = "Phone number is missing in your profile.";
    else if (!/^\d{10,15}$/.test(formData.phone))
      newErrors.profile = "Phone number in your profile is invalid.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onComplete(formData);
    }
  };

  const handleChangeAddress = () => {
    navigate("/profile?section=details");
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2>Shipping Details</h2>
        <p className="checkout-total">
          Order Total: ${totalPrice.toFixed(2)}
        </p>

        {loadingProfile ? (
          <p className="checkout-loading">Loading your saved details...</p>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-form">
            {/* Global profile error (if something missing) */}
            {errors.profile && (
              <p className="profile-error">
                {errors.profile} Please update it in <strong>My Profile</strong>.
              </p>
            )}

            {/* Name (read-only) */}
            <div className={`form-group ${formData.name ? "filled" : ""}`}>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
              />
              <label>Name</label>
            </div>

            {/* Address (read-only) */}
            <div className={`form-group ${formData.address ? "filled" : ""}`}>
              <textarea
                name="address"
                value={formData.address}
                readOnly
              />
              <label>Address</label>
            </div>

            {/* Phone (read-only) */}
            <div className={`form-group ${formData.phone ? "filled" : ""}`}>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                readOnly
              />
              <label>Phone Number</label>
            </div>

            {/* Change Address Button */}
            <button
              type="button"
              className="change-address-btn"
              onClick={handleChangeAddress}
            >
              Change Details in My Profile
            </button>

            {/* Place Order */}
            <button type="submit" className="place-order-btn">
              Place Order
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
