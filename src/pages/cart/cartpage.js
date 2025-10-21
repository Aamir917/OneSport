// src/CartPage.js
import React from 'react';
import './cartpage.css';

const CartPage = () => {
  // Sample cart data
  const cartItems = [
    { id: 1, name: 'Item 1', price: 29.99, quantity: 2 },
    { id: 2, name: 'Item 2', price: 49.99, quantity: 1 },
    { id: 3, name: 'Item 3', price: 19.99, quantity: 3 },
  ];

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td>${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-summary">
        <h2>Cart Total: ${calculateTotal()}</h2>
        <button className="checkout-button">Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default CartPage;
