import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log("No token found");
      return;
    }

    // ---- FETCH USER ----
    axios
      .get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });

    // ---- FETCH FEATURED PRODUCTS ----
    axios
      .get("http://localhost:5000/api/products/featured")
      .then((res) => {
        setFeaturedProducts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="landing-page">
      <h1>Welcome back, {user.name}!</h1>
      <p>Explore the latest sports equipment.</p>

      <div className="featured-products">
        {featuredProducts.length === 0 ? (
          <p>No featured products available.</p>
        ) : (
          featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image || "https://via.placeholder.com/150"}
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <button>Add to Cart</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LandingPage;
