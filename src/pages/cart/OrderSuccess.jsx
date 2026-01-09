// src/components/OrderSuccess.jsx
import React from "react";
import "./orderSuccess.css";

const OrderSuccess = ({ cart, totalPrice, shipping, onBack, orderId }) => {
  const formattedDate = new Date().toLocaleDateString();
  const formattedDateTime = new Date().toLocaleString();
  const itemCount =
    cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;

  const handlePrintReceipt = () => {
    const popup = window.open("", "_blank");
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Order Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin-bottom: 12px; }
            .section { margin-top: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h2>Order Receipt - OneSport</h2>
          <div class="section">
            <strong>Order ID:</strong> ${orderId || "-"}<br/>
            <strong>Order Date:</strong> ${formattedDateTime}<br/>
            <strong>Name:</strong> ${shipping?.name || ""}<br/>
            <strong>Address:</strong> ${shipping?.address || ""}<br/>
            <strong>Phone:</strong> ${shipping?.phone || ""}<br/>
          </div>
          <div class="section">
            <h3>Items</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${
                  cart?.items
                    ?.map(
                      (item, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${item.product?.name || ""}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.product?.price || 0).toFixed(2)}</td>
                    <td>$${(
                      (item.product?.price || 0) * item.quantity
                    ).toFixed(2)}</td>
                  </tr>`
                    )
                    .join("") || ""
                }
                <tr>
                  <td colspan="4" style="text-align:right;"><strong>Total:</strong></td>
                  <td><strong>$${totalPrice.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <div className="order-success-page">
      <div className="order-success-container">
        {/* Success banner */}
        <div className="success-banner">
          <div className="success-icon-amz">✓</div>
          <div>
            <h1>Order placed, thank you!</h1>
            <p>
              Confirmation has been sent. Your order will be processed shortly.
            </p>
          </div>
        </div>

        {/* Meta info */}
        <div className="success-meta">
          <div>
            <span className="meta-label">Order ID</span>
            <span className="meta-value">{orderId || "-"}</span>
          </div>
          <div>
            <span className="meta-label">Order date</span>
            <span className="meta-value">{formattedDateTime}</span>
          </div>
          <div>
            <span className="meta-label">Items</span>
            <span className="meta-value">{itemCount}</span>
          </div>
          <div>
            <span className="meta-label">Order total</span>
            <span className="meta-value total">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Main two-column area */}
        <div className="order-main">
          {/* Left: items list */}
          <div className="order-left">
            <h2>Items in this order</h2>
            <div className="items-list">
              {cart?.items?.map((item, index) => (
                <div className="item-row" key={index}>
                  <div className="item-info">
                    <div className="item-name">
                      {item.product?.name || "Product"}
                    </div>
                    <div className="item-meta">
                      Qty: {item.quantity} · Price: $
                      {(item.product?.price || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="item-subtotal">
                    $
                    {(
                      (item.product?.price || 0) * item.quantity
                    ).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="items-total-row">
                <span>Order total:</span>
                <span className="items-total-value">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: shipping + summary */}
          <div className="order-right">
            <div className="summary-section">
              <h3>Shipping to</h3>
              <p className="ship-name">{shipping?.name}</p>
              <p className="ship-address">{shipping?.address}</p>
              <p className="ship-phone">Phone: {shipping?.phone}</p>
            </div>

            <div className="summary-section">
              <h3>Order summary</h3>
              <div className="summary-line">
                <span>Items ({itemCount})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-line total-line">
                <span>Order total</span>
                <span className="summary-total">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="summary-date">Order placed on {formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="order-actions">
          <button
            onClick={handlePrintReceipt}
            className="amz-btn amz-primary"
          >
            🖨 Print receipt
          </button>
          <button onClick={onBack} className="amz-btn amz-secondary">
            ⬅ Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
