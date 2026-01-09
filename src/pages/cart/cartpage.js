// src/pages/CartPage.jsx  (or wherever you keep it)
import React, { useEffect, useState } from "react";
import axios from "axios";
import CheckoutForm from "./CheckoutForm";
import OrderSuccess from "./OrderSuccess";
import "./cartpage.css";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cart, setCart] = useState({ items: [] });
  const [checkout, setCheckout] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(null);

  // snapshot of cart & total at order time (so it doesn't become 0 after clear)
  const [orderCart, setOrderCart] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderId, setOrderId] = useState(null);

  const token =
    localStorage.getItem("token") || localStorage.getItem("userToken");
  const navigate = useNavigate();

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data.cart || { items: [] });
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCart({ items: [] });
      }
    };
    fetchCart();
  }, [token]);

  // Remove item
  const handleRemove = async (productId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/cart/remove",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data.cart || { items: [] });
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Update quantity
  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/cart/update",
        { productId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data.cart || { items: [] });
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const totalPrice =
    cart?.items?.reduce(
      (sum, item) =>
        sum + (item.product?.price || 0) * (item.quantity || 0),
      0
    ) || 0;

  // Called by CheckoutForm when validation passes
  const handleCheckoutComplete = async (shippingData) => {
    setShippingInfo(shippingData);

    // snapshot current cart + total for success page
    setOrderCart(cart);
    setOrderTotal(totalPrice);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/cart/checkout",
        { shippingDetails: shippingData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = res.data.order;
      setOrderId(order?._id || null);

      // clear live cart
      setCart({ items: [] });
      setOrderCompleted(true);
      setCheckout(false);
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  // =======================
  // Different screen states
  // =======================

  // 1) Checkout form
  if (checkout) {
    return (
      <CheckoutForm
        cart={cart}
        totalPrice={totalPrice}
        onComplete={handleCheckoutComplete}
      />
    );
  }

  // 2) Order success screen (use NEW OrderSuccess)
  if (orderCompleted) {
    return (
      <OrderSuccess
        cart={orderCart || { items: [] }}
        totalPrice={orderTotal}
        shipping={shippingInfo}
        orderId={orderId}
        onBack={() => navigate("/products")}
      />
    );
  }

  // 3) Default cart view
  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cart?.items?.length > 0 ? (
        <>
          <div className="cart-items-grid">
            {cart.items?.map((item) => (
              <div key={item.product?._id} className="cart-item-card">
                <img
                  src={item.product?.imageUrl || ""}
                  alt={item.product?.name || "Product"}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <h3>{item.product?.name}</h3>
                  <p>
                    Price: $
                    {item.product?.price?.toFixed(2) || "0.00"}
                  </p>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity - 1
                        )
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity + 1
                        )
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
