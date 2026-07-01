import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const p = await productsApi.getById(id);
        const mapped = {
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          description: p.description,
          imageUrl: p.imageUrl,
        };
        setProduct(mapped);
      } catch (err) {
        setError('Could not load product details from API.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p style={{ padding: '24px' }}>Loading product details...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;
  if (!product) return <p style={{ padding: '24px' }}>Product not found.</p>;

  return (
    <section style={{ padding: '24px' }}>
      <Link to="/products" style={{ display: 'inline-block', marginBottom: '16px' }}>
        ← Back to Products
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: '280px', height: '280px', objectFit: 'cover', borderRadius: '8px' }}
        />
        <div>
          <h2>{product.name}</h2>
          <p style={{ color: '#757575' }}>{product.category}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${product.price}</p>
          <p style={{ marginTop: '12px' }}>{product.description}</p>
          <button
            style={{
              marginTop: '16px',
              padding: '10px 16px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;