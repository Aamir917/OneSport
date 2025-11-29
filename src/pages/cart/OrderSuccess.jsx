import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import './orderSuccess.css';

const OrderSuccess = ({ cart, totalPrice, shipping, onBack, orderId }) => {
  const receiptRef = useRef();

  const handlePrintReceipt = () => {
    const receipt = receiptRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Order Receipt</title></head><body>');
    printWindow.document.write(receipt.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="order-success-page">
      <div className="success-container">

        <div ref={receiptRef} className="receipt-card">
          <h2>OneSport Order Receipt</h2>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Date:</strong> {new Date().toLocaleString()}</p>

          <div className="shipping-info">
            <h3>Shipping Information</h3>
            <p>Name: {shipping.name}</p>
            <p>Address: {shipping.address}</p>
            <p>Phone: {shipping.phone}</p>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.product.price.toFixed(2)}</td>
                    <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="4"><strong>Total:</strong></td>
                  <td><strong>${totalPrice.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="buttons">
          <button onClick={handlePrintReceipt} className="print-btn">🖨 Print Receipt</button>
          <button onClick={onBack} className="back-btn">⬅ See More Products</button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
