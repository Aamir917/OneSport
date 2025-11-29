import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './adminpage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('add-product');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    imageUrl: '',
  });
  const [message, setMessage] = useState('');
  const [editProduct, setEditProduct] = useState(null);

  const token = localStorage.getItem('adminToken');

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate('/admin-login');
  }, [token, navigate]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 403) alert('Access denied. Invalid admin token.');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  // Add product
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/products/add', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessage('Product added successfully!');
        setFormData({ name: '', price: '', description: '', category: '', stock: '', imageUrl: '' });
        fetchProducts();
      } else setMessage('Failed to add product.');
    } catch (err) {
      console.error(err);
      setMessage('Error adding product.');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete user
  // =========================
// Delete User
// =========================
const handleDeleteUser = async (id) => {
  if (!window.confirm('Are you sure you want to delete this user?')) return;

  const adminToken = localStorage.getItem('adminToken'); // Use admin token
  if (!adminToken) {
    alert('Admin not authenticated.');
    navigate('/admin-login');
    return;
  }

  try {
    const res = await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (res.data.success) {
      alert('User deleted successfully.');
      fetchUsers(); // Refresh user list
    } else {
      alert('Failed to delete user.');
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    if (err.response?.status === 404) {
      alert('User not found.');
    } else if (err.response?.status === 403) {
      alert('Access denied. Invalid admin token.');
    } else {
      alert('Failed to delete user.');
    }
  }
};


  // Edit product
  const handleEditProduct = (product) => setEditProduct(product);
  const handleCloseModal = () => setEditProduct(null);
  const handleModalChange = (e) => setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
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
      setProducts(products.map(p => (p._id === editProduct._id ? res.data.product : p)));
      setEditProduct(null);
    } else {
      alert(res.data.message || 'Failed to update product.');
    }
  } catch (err) {
    console.error(err.response?.data || err);
    alert(err.response?.data?.message || 'Error saving product.');
  }
};



  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li className={activeSection === 'add-product' ? 'active' : ''} onClick={() => setActiveSection('add-product')}>Add Products</li>
          <li className={activeSection === 'manage-products' ? 'active' : ''} onClick={() => setActiveSection('manage-products')}>Manage Products</li>
          <li className={activeSection === 'users' ? 'active' : ''} onClick={() => setActiveSection('users')}>Users</li>
        </ul>
      </aside>

      <div className="admin-content">
        {/* Add Product */}
        {activeSection === 'add-product' && (
          <div className="section add-product">
            <h2>Add New Product</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
              <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
              <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
              <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
              <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} />
              <input type="text" name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} />
              <button type="submit">Add Product</button>
            </form>
          </div>
        )}

        {/* Manage Products */}
        {activeSection === 'manage-products' && (
          <div className="section manage-products">
            <h2>Manage Products</h2>
            {products.length === 0 ? <p>No products available</p> : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>${p.price}</td>
                      <td>{p.stock}</td>
                      <td>
                        <button onClick={() => handleEditProduct(p)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Users */}
        {activeSection === 'users' && (
          <div className="section users">
            <h2>Users</h2>
            <p className="user-count">Total Users: {users.length}</p>
            {users.length === 0 ? <p>No users found</p> : (
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
                        <button className="delete-btn" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Edit Product Modal */}
        {editProduct && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>&times;</span>
              <h3>Edit Product</h3>
              <form onSubmit={handleSaveProduct}>
                <input type="text" name="name" value={editProduct.name} onChange={handleModalChange} required />
                <input type="text" name="category" value={editProduct.category} onChange={handleModalChange} required />
                <input type="number" name="price" value={editProduct.price} onChange={handleModalChange} required />
                <input type="number" name="stock" value={editProduct.stock} onChange={handleModalChange} required />
                <input type="text" name="description" value={editProduct.description} onChange={handleModalChange} />
                <input type="text" name="imageUrl" value={editProduct.imageUrl} onChange={handleModalChange} />
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
