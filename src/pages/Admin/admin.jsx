import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './admin.css'; // CSS for styling the layout

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [report, setReport] = useState({ totalOrders: 0, totalSales: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('products'); // Default section is 'products'

  // Fetch data for products, orders, and sales report
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [productsRes, ordersRes, reportRes] = await Promise.all([
          axios.get('/admin/products'),
          axios.get('/admin/orders'),
          axios.get('/admin/orders/report'),
        ]);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setReport(reportRes.data);
      } catch (err) {
        console.error('Error fetching data:', err.response ? err.response.data : err.message);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle Delete Product
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/admin/products/${productId}`);
        // Update the product list without the deleted product
        setProducts(products.filter((product) => product._id !== productId));
        alert('Product deleted successfully!');
      } catch (err) {
        console.error('Error deleting the product:', err);
        alert('Failed to delete the product. Please try again.');
      }
    }
  };

  // Render loading state
  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  // Render error state
  if (error) {
    return <div className="container"><p className="error">{error}</p></div>;
  }

  // Main content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return (
          <section className="product-management">
            <h3>Manage Products</h3>
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product._id} className="product">
                  <h4>{product.name}</h4>
                  <p>Price: ${product.price}</p>
                  <p>Stock: {product.stock}</p>
                  <button onClick={() => handleDelete(product._id)}>Delete</button>
                </div>
              ))
            ) : (
              <p>No products available.</p>
            )}
          </section>
        );
      case 'orders':
        return (
          <section className="order-history">
            <h3>Order History</h3>
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order._id} className="order">
                  <h4>Order #{order._id}</h4>
                  <p>Status: {order.status}</p>
                  <p>Total: ${order.totalAmount}</p>
                </div>
              ))
            ) : (
              <p>No orders found.</p>
            )}
          </section>
        );
      case 'report':
        return (
          <section className="sales-report">
            <h3>Sales Report</h3>
            <p>Total Orders: {report.totalOrders}</p>
            <p>Total Sales: ${report.totalSales}</p>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Admin Panel</h3>
        <ul>
          <li className={activeSection === 'products' ? 'active' : ''} onClick={() => setActiveSection('products')}>
            Products
          </li>
          <li className={activeSection === 'orders' ? 'active' : ''} onClick={() => setActiveSection('orders')}>
            Orders
          </li>
          <li className={activeSection === 'report' ? 'active' : ''} onClick={() => setActiveSection('report')}>
            Sales Report
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <h2>Admin Dashboard</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
