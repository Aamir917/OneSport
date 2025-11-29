import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SafeImage from '../../components/SafeImage';
import { useNavigate } from 'react-router-dom';
import './homepage.css';
import '../../pages/Products/products.css'; // shared styling for grid

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setFeatured(res.data.slice(0, 4)); // Only first 4 products
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="homepage">

      <section className="hero">
        <h1>Welcome to Our Store</h1>
        <p>Best products delivered to your door.</p>
        <button onClick={() => navigate("/products")}>Shop Now</button>
      </section>

      <h2 className="section-title">Featured Products</h2>

      <div className="products-grid">
        {featured.map((product) => (
          <div key={product._id} className="product-card">
            <SafeImage src={product.imageUrl} alt={product.name} className="product-image" />

            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">${product.price.toFixed(2)}</p>
              <button onClick={() => navigate("/products")} className="add-to-cart-btn">
                View Product
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default HomePage;
