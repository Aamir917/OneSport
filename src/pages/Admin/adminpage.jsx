import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./adminpage.css";

const AdminPage = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("add-product");

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    brand: "",
    stock: "",
    imageUrl: "",
  });

  const [message, setMessage] = useState("");
  const [editProduct, setEditProduct] = useState(null);

  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSort, setOrderSort] = useState("newest");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const token = localStorage.getItem("adminToken");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/admin-login");
  }, [token, navigate]);

  // ============================
  // Fetch products
  // ============================
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // ============================
  // Fetch users
  // ============================
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 403)
        alert("Access denied. Invalid admin token.");
    }
  };

  // ============================
  // Fetch all orders (admin)
  // ============================
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchProducts();
    fetchUsers();
    fetchOrders();
  }, [token]);

  // ============================
  // Add product
  // ============================
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      const res = await axios.post(
        "http://localhost:5000/api/products/add",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setMessage("Product added successfully!");
        setFormData({
          name: "",
          price: "",
          description: "",
          category: "",
          brand: "",
          stock: "",
          imageUrl: "",
        });
        fetchProducts();
      } else setMessage("Failed to add product.");
    } catch (err) {
      console.error(err);
      setMessage("Error adding product.");
    }
  };

  // ============================
  // Delete product
  // ============================
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ============================
  // Delete user
  // ============================
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      alert("Admin not authenticated.");
      navigate("/admin-login");
      return;
    }

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/admin/users/${id}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      if (res.data.success) {
        alert("User deleted successfully.");
        fetchUsers();
      } else {
        alert("Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      if (err.response?.status === 404) {
        alert("User not found.");
      } else if (err.response?.status === 403) {
        alert("Access denied. Invalid admin token.");
      } else {
        alert("Failed to delete user.");
      }
    }
  };

  // ============================
  // Edit product
  // ============================
  const handleEditProduct = (product) => setEditProduct(product);
  const handleCloseModal = () => setEditProduct(null);

  const handleModalChange = (e) =>
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editProduct,
        price: Number(editProduct.price),
        stock: Number(editProduct.stock),
      };

      const res = await axios.put(
        `http://localhost:5000/api/products/${editProduct._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.product) {
        setProducts(
          products.map((p) =>
            p._id === editProduct._id ? res.data.product : p
          )
        );
        setEditProduct(null);
      } else {
        alert(res.data.message || "Failed to update product.");
      }
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Error saving product.");
    }
  };

  // ============================
  // Order status change
  // ============================
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.order : o))
        );
      } else {
        alert(res.data.message || "Failed to update order status.");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status.");
    }
  };

  // Toggle order details expand/collapse
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Status pill class
  const getStatusPillClass = (status) => {
    if (status === "Pending") return "order-status-pill pending";
    if (status === "Shipped") return "order-status-pill shipped";
    if (status === "Delivered") return "order-status-pill delivered";
    return "order-status-pill";
  };

  // ============================
  // Derived data for UI
  // ============================

  const productCategories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === "all" ||
      p.category === productCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  let filteredOrders = orders.filter((o) => {
    return orderStatusFilter === "all" || o.status === orderStatusFilter;
  });

  if (orderSort === "newest") {
    filteredOrders = [...filteredOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (orderSort === "oldest") {
    filteredOrders = [...filteredOrders].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  } else if (orderSort === "status") {
    const orderPriority = { Pending: 1, Shipped: 2, Delivered: 3 };
    filteredOrders = [...filteredOrders].sort(
      (a, b) =>
        (orderPriority[a.status] || 99) - (orderPriority[b.status] || 99)
    );
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li
            className={activeSection === "add-product" ? "active" : ""}
            onClick={() => setActiveSection("add-product")}
          >
            Add Product
          </li>
          <li
            className={activeSection === "manage-products" ? "active" : ""}
            onClick={() => setActiveSection("manage-products")}
          >
            Manage Products
          </li>
          <li
            className={activeSection === "users" ? "active" : ""}
            onClick={() => setActiveSection("users")}
          >
            Users
          </li>
          <li
            className={activeSection === "orders" ? "active" : ""}
            onClick={() => setActiveSection("orders")}
          >
            All Orders
          </li>
        </ul>
      </aside>

      <div className="admin-content">
        {/* ====================== ADD PRODUCT ====================== */}
        {activeSection === "add-product" && (
          <div className="section add-product">
            <h2>Add New Product</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit} className="admin-form">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="brand"
                placeholder="Brand"
                value={formData.brand}
                onChange={handleChange}
              />
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleChange}
              />
              <input
                type="text"
                name="imageUrl"
                placeholder="Image URL"
                value={formData.imageUrl}
                onChange={handleChange}
              />
              <button type="submit">Add Product</button>
            </form>
          </div>
        )}

        {/* ====================== MANAGE PRODUCTS ====================== */}
        {activeSection === "manage-products" && (
          <div className="section manage-products">
            <div className="section-header">
              <h2>Manage Products</h2>
              <div className="manage-toolbar">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                >
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="product-cards-grid">
                {filteredProducts.map((p) => (
                  <div className="admin-product-card" key={p._id}>
                    <div className="admin-product-image">
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
                    </div>
                    <div className="admin-product-info">
                      <h3>{p.name}</h3>
                      <p className="admin-product-meta">
                        <span>{p.category}</span>
                        {p.brand && <span> • {p.brand}</span>}
                      </p>
                      <p className="admin-product-price">
                        ₹{p.price} · Stock: {p.stock}
                      </p>
                      <div className="admin-product-actions">
                        <button
                          className="action-btn"
                          onClick={() => handleEditProduct(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(p._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================== USERS ====================== */}
        {activeSection === "users" && (
          <div className="section users">
            <h2>Users</h2>
            <p className="user-count">Total Users: {users.length}</p>
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ====================== ALL ORDERS ====================== */}
        {activeSection === "orders" && (
          <div className="section orders">
            <div className="section-header">
              <h2>All Orders</h2>
              <div className="orders-toolbar">
                <div className="orders-status-tabs">
                  {["all", "Pending", "Shipped", "Delivered"].map((status) => (
                    <button
                      key={status}
                      className={`orders-status-tab ${
                        orderStatusFilter === status ? "active" : ""
                      }`}
                      onClick={() => setOrderStatusFilter(status)}
                    >
                      {status === "all" ? "All" : status}
                    </button>
                  ))}
                </div>
                <select
                  value={orderSort}
                  onChange={(e) => setOrderSort(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <div className="orders-grid">
                {filteredOrders.map((order) => {
                  const dateStr = new Date(
                    order.createdAt
                  ).toLocaleString();

                  const firstItem = order.items?.[0];
                  const firstProduct = firstItem?.product;

                  return (
                    <div className="order-card-admin" key={order._id}>
                      <div className="order-main-info">
                        <div className="order-thumb">
                          {firstProduct?.imageUrl && (
                            <img
                              src={firstProduct.imageUrl}
                              alt={firstProduct.name}
                            />
                          )}
                        </div>
                        <div className="order-text">
                          <p className="order-id">
                            <strong>Order:</strong> {order._id}
                          </p>
                          <p className="order-user">
                            <strong>User:</strong>{" "}
                            {order.user?.name || "Unknown"} (
                            {order.user?.email || "no email"})
                          </p>
                          <p className="order-date">
                            <strong>Placed:</strong> {dateStr}
                          </p>
                          <p className="order-total">
                            <strong>Total:</strong> ₹
                            {(order.totalPrice || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="order-status-row">
                        <div className="order-status">
                          <span>Status:</span>
                          <span className={getStatusPillClass(order.status)}>
                            {order.status}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleOrderStatusChange(
                                order._id,
                                e.target.value
                              )
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>

                        <div className="order-items-preview">
                          {order.items?.slice(0, 2).map((item) => (
                            <span
                              key={item._id}
                              className="order-item-name"
                            >
                              {item.product?.name || "Product"} ×{" "}
                              {item.quantity}
                            </span>
                          ))}
                          {order.items?.length > 2 && (
                            <span className="order-more">
                              +{order.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        className="order-details-toggle"
                        onClick={() => toggleOrderDetails(order._id)}
                      >
                        {expandedOrderId === order._id
                          ? "Hide Details"
                          : "View Details"}
                      </button>

                      {expandedOrderId === order._id && (
                        <div className="order-details">
                          <div className="order-shipping">
                            <h4>Shipping Details</h4>
                            <p>
                              <strong>Name:</strong>{" "}
                              {order.shippingDetails?.name || "N/A"}
                            </p>
                            <p>
                              <strong>Address:</strong>{" "}
                              {order.shippingDetails?.address || "N/A"}
                            </p>
                            <p>
                              <strong>Phone:</strong>{" "}
                              {order.shippingDetails?.phone || "N/A"}
                            </p>
                          </div>

                          <div className="order-items-full">
                            <h4>Items</h4>
                            {order.items?.map((item) => (
                              <div
                                className="order-item-row-admin"
                                key={item._id}
                              >
                                <div className="order-item-thumb">
                                  {item.product?.imageUrl && (
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.product.name}
                                    />
                                  )}
                                </div>
                                <div className="order-item-info">
                                  <p className="order-item-title">
                                    {item.product?.name || "Product"}
                                  </p>
                                  <p className="order-item-sub">
                                    Qty: {item.quantity} · Price: ₹
                                    {(item.product?.price || 0).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================== EDIT PRODUCT MODAL ====================== */}
        {editProduct && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>
                &times;
              </span>
              <h3>Edit Product</h3>
              <form onSubmit={handleSaveProduct} className="admin-form">
                <input
                  type="text"
                  name="name"
                  value={editProduct.name}
                  onChange={handleModalChange}
                  required
                />
                <input
                  type="text"
                  name="category"
                  value={editProduct.category}
                  onChange={handleModalChange}
                  required
                />
                <input
                  type="text"
                  name="brand"
                  value={editProduct.brand || ""}
                  onChange={handleModalChange}
                  placeholder="Brand"
                />
                <input
                  type="number"
                  name="price"
                  value={editProduct.price}
                  onChange={handleModalChange}
                  required
                />
                <input
                  type="number"
                  name="stock"
                  value={editProduct.stock}
                  onChange={handleModalChange}
                  required
                />
                <input
                  type="text"
                  name="description"
                  value={editProduct.description}
                  onChange={handleModalChange}
                />
                <input
                  type="text"
                  name="imageUrl"
                  value={editProduct.imageUrl}
                  onChange={handleModalChange}
                />
                <button type="submit">Save Changes</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
