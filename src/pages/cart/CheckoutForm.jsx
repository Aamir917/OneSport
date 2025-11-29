import React, { useState } from 'react';
import './checkoutform.css';

const CheckoutForm = ({ cart, totalPrice, onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(formData.phone))
      newErrors.phone = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onComplete(formData);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2>Shipping Details</h2>
        <p className="checkout-total">Order Total: ${totalPrice.toFixed(2)}</p>
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className={`form-group ${formData.name ? 'filled' : ''}`}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <label>Name</label>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className={`form-group ${formData.address ? 'filled' : ''}`}>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            <label>Address</label>
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className={`form-group ${formData.phone ? 'filled' : ''}`}>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <label>Phone Number</label>
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <button type="submit" className="place-order-btn">
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
