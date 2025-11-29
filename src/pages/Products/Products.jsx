import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SafeImage from '../../components/SafeImage';
import './products.css';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (!token) {
      alert('Please login first!');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart.');
    }
  };

  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Extract unique categories from products
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filter products by selected categories AND search term
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="products-page">
      <h1 className="section-title">All Products</h1>

      {/* Search Bar Centered */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="products-container">
        {/* Sidebar with checkboxes */}
        <aside className="sidebar">
          <h3>Categories</h3>
          {categories.length === 0 && <p>No categories available</p>}
          {categories.map((cat, index) => (
            <div key={index} className="category-checkbox">
              <input
                type="checkbox"
                id={`cat-${index}`}
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
              />
              <label htmlFor={`cat-${index}`}>{cat}</label>
            </div>
          ))}
        </aside>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="product-image-container">
                <SafeImage src={product.imageUrl} alt={product.name} className="product-image" />
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price">${product.price.toFixed(2)}</p>
                <button
                  className="add-to-cart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="product-modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedProduct(null)}>
              &times;
            </span>
            <h2>{selectedProduct.name}</h2>
            <SafeImage src={selectedProduct.imageUrl} alt={selectedProduct.name} />
            <p>{selectedProduct.description}</p>
            <p className="price">${selectedProduct.price.toFixed(2)}</p>
            <button onClick={() => handleAddToCart(selectedProduct)}>Add to Cart</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
