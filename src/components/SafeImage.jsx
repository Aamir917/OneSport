import React from 'react';

const SafeImage = ({ src, alt, ...props }) => {
  const fallback = 'https://via.placeholder.com/150'; // fallback image

  return (
    <img
      src={src || fallback}
      alt={alt || 'image'}
      onError={(e) => { e.target.onerror = null; e.target.src = fallback; }}
      {...props}
    />
  );
};

export default SafeImage;
