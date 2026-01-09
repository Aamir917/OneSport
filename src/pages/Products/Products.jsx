import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SafeImage from "../../components/SafeImage";
import "./products.css";

const ITEMS_PER_PAGE = 8;

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [activePrice, setActivePrice] = useState({ min: 0, max: 0 });

  const [sortOption, setSortOption] = useState("relevance");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Reviews (READ-ONLY) for modal
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    rating: 0,
    numReviews: 0,
    reviews: [],
  });

  const navigate = useNavigate();
  const token =
    localStorage.getItem("token") || localStorage.getItem("userToken");

  // ✅ Stock label rule:
  // - stock <= 0: Out of stock
  // - stock <= 10: Only X left
  // - else: In stock
  const getStockLabel = (stock) => {
    const s = Number(stock || 0);
    if (s <= 0) return "Out of stock";
    if (s <= 10) return `Only ${s} left`;
    return "In stock";
  };

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        const data = response.data || [];

        const normalized = data.map((p) => ({
          ...p,
          stock: typeof p.stock === "number" ? p.stock : Number(p.stock || 0),
          rating: typeof p.rating === "number" ? p.rating : 0,
          numReviews: typeof p.numReviews === "number" ? p.numReviews : 0,
          brand: p.brand || "", // safe even if not in schema
        }));

        setProducts(normalized);

        if (normalized.length > 0) {
          const prices = normalized.map((p) => Number(p.price || 0));
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceRange({ min, max });
          setActivePrice({ min, max });
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  const requireLogin = () => {
    alert("Please login first!");
    navigate("/login");
  };

  const handleAddToCart = async (product) => {
    if (!token) return requireLogin();

    if (Number(product.stock) <= 0) {
      alert("This product is out of stock.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart.");
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!token) return requireLogin();

    try {
      await axios.post(
        "http://localhost:5000/api/wishlist/add",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to wishlist!");
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      alert("Failed to add to wishlist.");
    }
  };

  // Category filter
  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
    setCurrentPage(1);
  };

  // Brand filter
  const handleBrandChange = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName]
    );
    setCurrentPage(1);
  };

  // Price inputs
  const handleMinPriceChange = (e) => {
    const value = Number(e.target.value);
    setActivePrice((prev) => ({
      ...prev,
      min: Math.min(value, prev.max),
    }));
    setCurrentPage(1);
  };

  const handleMaxPriceChange = (e) => {
    const value = Number(e.target.value);
    setActivePrice((prev) => ({
      ...prev,
      max: Math.max(value, prev.min),
    }));
    setCurrentPage(1);
  };

  // Rating filter
  const handleRatingChange = (value) => {
    setRatingFilter(value);
    setCurrentPage(1);
  };

  // In-stock filter
  const handleInStockChange = () => {
    setInStockOnly((prev) => !prev);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => setSortOption(e.target.value);

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchTerm("");
    setActivePrice({ ...priceRange });
    setRatingFilter(0);
    setInStockOnly(false);
    setSortOption("relevance");
    setCurrentPage(1);
  };

  // Unique categories & brands
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  // Filtering
  let filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    const matchesBrand =
      selectedBrands.length === 0 ||
      (product.brand && selectedBrands.includes(product.brand));

    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const price = Number(product.price || 0);
    const matchesPrice = price >= activePrice.min && price <= activePrice.max;

    const rating = Number(product.rating || 0);
    const matchesRating = ratingFilter === 0 || rating >= ratingFilter;

    const matchesStock = !inStockOnly || Number(product.stock) > 0;

    return (
      matchesCategory &&
      matchesBrand &&
      matchesSearch &&
      matchesPrice &&
      matchesRating &&
      matchesStock
    );
  });

  // Sorting
  if (sortOption === "price-asc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => Number(a.price || 0) - Number(b.price || 0)
    );
  } else if (sortOption === "price-desc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => Number(b.price || 0) - Number(a.price || 0)
    );
  } else if (sortOption === "name-asc") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  } else if (sortOption === "rating-desc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
    );
  }

  // Pagination
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePrevPage = () =>
    setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  const showingFrom = totalProducts === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + ITEMS_PER_PAGE, totalProducts);

  // ✅ Load reviews when modal opens (READ-ONLY)
 useEffect(() => {
  const loadReviews = async () => {
    if (!selectedProduct?._id) return;

    setReviewsLoading(true);
    setReviewsData({ rating: 0, numReviews: 0, reviews: [] });

    try {
      const res = await axios.get(
        `http://localhost:5000/api/products/${selectedProduct._id}/reviews`
      );

      // 🔴 res.data IS THE ARRAY
      const reviewsArray = Array.isArray(res.data) ? res.data : [];

      setReviewsData({
        rating: Number(selectedProduct.rating || 0),
        numReviews: Number(selectedProduct.numReviews || 0),
        reviews: reviewsArray,
      });
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  loadReviews();
}, [selectedProduct]);

  const closeModal = () => {
    setSelectedProduct(null);
    setReviewsData({ rating: 0, numReviews: 0, reviews: [] });
    setReviewsLoading(false);
  };

  return (
    <div className="products-page">
      <h1 className="section-title">All Products</h1>

      {/* Top toolbar: search + sort + clear */}
      <div className="products-toolbar">
        <div className="search-bar-container toolbar-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="sort-container">
          <label>Sort by:</label>
          <select value={sortOption} onChange={handleSortChange}>
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="rating-desc">Top Rated</option>
          </select>
        </div>

        <button className="clear-filters-btn" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="products-container">
        {/* Sidebar with filters */}
        <aside className="sidebar">
          {/* Categories */}
          <div className="filter-block">
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
          </div>

          {/* Brands */}
          {brands.length > 0 && (
            <div className="filter-block">
              <h3>Brands</h3>
              {brands.map((brand, index) => (
                <div key={index} className="category-checkbox">
                  <input
                    type="checkbox"
                    id={`brand-${index}`}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <label htmlFor={`brand-${index}`}>{brand}</label>
                </div>
              ))}
            </div>
          )}

          {/* Price Range */}
          <div className="filter-block">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <div>
                <label>Min</label>
                <input
                  type="number"
                  value={activePrice.min}
                  min={priceRange.min}
                  max={activePrice.max}
                  onChange={handleMinPriceChange}
                />
              </div>
              <div>
                <label>Max</label>
                <input
                  type="number"
                  value={activePrice.max}
                  min={activePrice.min}
                  max={priceRange.max || undefined}
                  onChange={handleMaxPriceChange}
                />
              </div>
            </div>

            {priceRange.max > 0 && (
              <p className="price-hint">
                From ${priceRange.min.toFixed(2)} to $
                {priceRange.max.toFixed(2)}
              </p>
            )}
          </div>

          {/* Rating Filter */}
          <div className="filter-block">
            <h3>Customer Rating</h3>
            <div className="rating-filter">
              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={ratingFilter === 0}
                  onChange={() => handleRatingChange(0)}
                />
                All ratings
              </label>
              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={ratingFilter === 4}
                  onChange={() => handleRatingChange(4)}
                />
                4★ & up
              </label>
              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={ratingFilter === 3}
                  onChange={() => handleRatingChange(3)}
                />
                3★ & up
              </label>
            </div>
          </div>

          {/* Availability */}
          <div className="filter-block">
            <h3>Availability</h3>
            <label className="category-checkbox">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={handleInStockChange}
              />
              In stock only
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <p>No products match your filters.</p>
          ) : (
            paginatedProducts.map((product) => {
              const isOutOfStock = Number(product.stock) <= 0;

              return (
                <div
                  key={product._id}
                  className="product-card"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="product-image-container">
                    <SafeImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>

                    {product.brand && (
                      <p className="brand-label">{product.brand}</p>
                    )}

                    <div className="product-meta">
                      <span className="rating-badge">
                        <span className="rating-stars">
                          {"★".repeat(Math.round(product.rating || 0))}
                          {"☆".repeat(5 - Math.round(product.rating || 0))}
                        </span>
                        <span className="rating-number">
                          {Number(product.rating || 0).toFixed(1)}
                        </span>
                        <span className="rating-count">
                          ({Number(product.numReviews || 0)})
                        </span>
                      </span>

                      <span
                        className={
                          "stock-badge " +
                          (Number(product.stock) > 0 ? "in-stock" : "out-of-stock")
                        }
                      >
                        {getStockLabel(product.stock)}
                      </span>
                    </div>

                    <p className="price">${Number(product.price).toFixed(2)}</p>

                    <div className="product-actions">
                      <button
                        className="add-to-cart-btn"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) handleAddToCart(product);
                        }}
                      >
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>

                      <button
                        className="wishlist-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWishlist(product);
                        }}
                      >
                        ♥ Add to Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {showingFrom}–{showingTo} of {totalProducts} products
              </div>
              <div className="pagination-controls">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                  ‹ Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="product-modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>

            <h2>{selectedProduct.name}</h2>
            <SafeImage
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
            />

            {selectedProduct.brand && (
              <p className="brand-label">{selectedProduct.brand}</p>
            )}

            <div className="product-meta modal-meta">
              <span className="rating-badge">
                <span className="rating-stars">
                  {"★".repeat(Math.round(selectedProduct.rating || 0))}
                  {"☆".repeat(5 - Math.round(selectedProduct.rating || 0))}
                </span>
                <span className="rating-number">
                  {Number(selectedProduct.rating || 0).toFixed(1)}
                </span>
                <span className="rating-count">
                  ({Number(selectedProduct.numReviews || 0)})
                </span>
              </span>

              <span
                className={
                  "stock-badge " +
                  (Number(selectedProduct.stock) > 0 ? "in-stock" : "out-of-stock")
                }
              >
                {getStockLabel(selectedProduct.stock)}
              </span>
            </div>

            <p>{selectedProduct.description}</p>
            <p className="price">${Number(selectedProduct.price).toFixed(2)}</p>

            <div className="modal-actions">
              <button
                disabled={Number(selectedProduct.stock) <= 0}
                onClick={() => handleAddToCart(selectedProduct)}
              >
                {Number(selectedProduct.stock) <= 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <button onClick={() => handleAddToWishlist(selectedProduct)}>
                ♥ Add to Wishlist
              </button>
            </div>

            {/* ✅ READ-ONLY REVIEWS (NO FORM HERE) */}
            <div className="reviews-section">
              <h3>Customer Reviews</h3>

              {reviewsLoading ? (
                <p>Loading reviews...</p>
              ) : reviewsData.reviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                <div className="reviews-list">
                  {reviewsData.reviews.map((r) => (
                    <div className="review-card" key={r._id}>
                      <div className="review-top">
                        <strong>{r.name || "User"}</strong>
                        <span className="review-stars">
                          {"★".repeat(Number(r.rating || 0))}
                          {"☆".repeat(5 - Number(r.rating || 0))}
                        </span>
                      </div>

                      {r.comment && <p className="review-text">{r.comment}</p>}

                      <p className="review-date">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
