import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <div className="image-container">
        <img src={product.imageUrl} alt={product.name} />
        <div className="overlay">
          <button onClick={() => onAddToCart(product)}>Add to Cart</button>
        </div>
      </div>
      <div className="product-details">
        <h3>{product.name}</h3>
        <p>${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
