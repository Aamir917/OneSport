import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CheckoutForm from './CheckoutForm';
import './cartpage.css';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cart, setCart] = useState({ items: [] });
  const [checkout, setCheckout] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Ensure cart always has items array
        setCart(res.data.cart || { items: [] });
      } catch (err) {
        console.error('Error fetching cart:', err);
        setCart({ items: [] }); // fallback
      }
    };
    fetchCart();
  }, [token]);

  // Remove item
  const handleRemove = async (productId) => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/cart/remove',
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data.cart || { items: [] });
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  // Update quantity
  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await axios.post(
        'http://localhost:5000/api/cart/update',
        { productId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data.cart || { items: [] });
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const totalPrice = cart?.items?.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0
  ) || 0;

  const handleCheckoutComplete = async (shippingData) => {
    setShippingInfo(shippingData);
    try {
      await axios.post(
        'http://localhost:5000/api/cart/checkout',
        { shippingDetails: shippingData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart({ items: [] }); // clear cart locally
      setOrderCompleted(true);
      setCheckout(false);
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  if (checkout) {
    return (
      <CheckoutForm
        cart={cart}
        totalPrice={totalPrice}
        onComplete={handleCheckoutComplete}
      />
    );
  }

  if (orderCompleted) {
    return (
      <div className="order-success">
        <h2>Order Placed Successfully!</h2>
        <p>Thank you, {shippingInfo?.name}</p>
        <p>Shipping to: {shippingInfo?.address}</p>
        <p>Phone: {shippingInfo?.phone}</p>
        <p>Total Paid: ${totalPrice.toFixed(2)}</p>
        <button onClick={() => window.print()}>Print Receipt</button>
        <button onClick={() => navigate('/')}>See More Products</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cart?.items?.length > 0 ? (
        <>
          <div className="cart-items-grid">
            {cart.items?.map((item) => (
              <div key={item.product?._id} className="cart-item-card">
                <img
                  src={item.product?.imageUrl || ''}
                  alt={item.product?.name || 'Product'}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <h3>{item.product?.name}</h3>
                  <p>Price: ${item.product?.price?.toFixed(2) || '0.00'}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.product._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.product._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h2 className="cart-total">Total: ${totalPrice.toFixed(2)}</h2>
          <button className="checkout-btn" onClick={() => setCheckout(true)}>
            Proceed to Checkout
          </button>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

export default CartPage;
