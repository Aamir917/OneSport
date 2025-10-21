// src/HomePage.js
import React from 'react';
import './homepage.css';
import '../LogoOS.png';

const products = [
  { id: 1, name: 'Adidas Tiro Club Football', price: '19.99', image: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/53f0b635a65a4d078360af2b00bd10f2_9366/Tiro_Club_Ball_Weiss_HT2430_01_standard.jpg' },
  { id: 2, name: 'Germany Home Tshirt 2022 Mens', price: '$29.99', image: 'https://www.sportsdirect.com/images/imgzoom/37/37280001_xxl.jpg' },
  { id: 3, name: 'Adidas Goletto VIII Firm Ground Football Boots', price: '$39.99', image: 'https://www.sportsdirect.com/images/imgzoom/20/20304103_xxl.jpg' },
  { id: 4, name: 'Nike Match Goalkeeper Gloves', price: '$49.99', image: 'https://www.sportsdirect.com/images/imgzoom/83/83800740_xxl.jpg' },
  { id: 5, name: 'TF-X1 275 Lawn Tennis', price: '$9.99', image: 'https://www.sportsdirect.com/images/imgzoom/76/76586301_xxl.jpg' },
  { id: 6, name: 'Slazenger Tournament Tri PackTennis Balls', price: '$119.99', image: 'https://www.sportsdirect.com/images/imgzoom/74/74507313_xxl.jpg' },
  { id: 7, name: 'Wilson NBA DRV Series Outdoor Basketball', price: '$191.99', image: 'https://m.media-amazon.com/images/I/61td9ls-1iL._AC_SL1200_.jpg' },
];

function HomePage() {
  return (
    <div className="homepage">
    <h1 className="title">Welcome to OneSport</h1>
      
      <div className="product-list">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-price">{product.price}</p>
            <button className="add-to-cart">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
