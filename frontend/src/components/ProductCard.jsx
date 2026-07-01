import { Link } from 'react-router-dom';

const ProductCard = ({ id, name, price, category, imageUrl, description }) => {
  // Tính năng nâng cao: Hiện badge Premium nếu giá > 50
  const isPremium = price > 50;

  // Tính năng nâng cao: Cắt ngắn mô tả nếu quá dài
  const shortenedDescription = description.length > 80 
    ? description.substring(0, 80) + '...' 
    : description;

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        width: '240px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        backgroundColor: '#fff',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {isPremium && (
        <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#d32f2f', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          Premium
        </span>
      )}

      {/* Đã sửa thành imageUrl và name ở đây nè! */}
      <img
        src={imageUrl}
        alt={name}
        style={{ width: '100%', height: '160px', objectFit: 'contain', borderRadius: '4px', marginBottom: '8px' }}
      />
      
      <span style={{ backgroundColor: '#e0e0e0', color: '#555', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', width: 'fit-content' }}>
        {category}
      </span>

      {/* Đã sửa thành name ở đây nè! */}
      <h3 style={{ margin: '4px 0', fontSize: '1rem', height: '42px', overflow: 'hidden' }}>{name}</h3>
      <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#1976d2', fontSize: '1.2rem' }}>${price}</p>
      <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#666', flexGrow: 1 }}>{shortenedDescription}</p>
      
      {/* Button Link */}
      <Link
        to={`/products/${id}`}
        style={{ 
          marginTop: 'auto', 
          padding: '10px 12px', 
          backgroundColor: '#1976d2', 
          color: '#fff', 
          borderRadius: '4px', 
          textAlign: 'center', 
          textDecoration: 'none', 
          fontWeight: 'bold' }}
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;