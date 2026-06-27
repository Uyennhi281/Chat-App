import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`https://fakestoreapi.com/products/${id}`);
        const item = res.data;
        const mapped = { id: item.id, name: item.title, price: item.price, category: item.category, imageUrl: item.image, description: item.description };
        setProduct(mapped);
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p style={{ 
    padding: '40px', 
    textAlign: 'center' }}>🔄 Loading product details...</p>;
    
    if (error) return <p style={{ 
        padding: '40px', 
        color: 'red', 
        textAlign: 'center' }}>{error}</p>;
    
        if (!product) return <p style={{ 
            padding: '40px', 
            textAlign: 'center' }}> Product not found.</p>;

  return (
    <section style={{ 
        padding: '40px', 
        maxWidth: '900px', 
        margin: '0 auto', 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        marginTop: '20px' 
        }}>

      <Link to="/products" style={{ 
        display: 'inline-block', 
        marginBottom: '24px', 
        textDecoration: 'none', 
        color: '#1976d2', 
        fontWeight: 'bold' 
        }}
            >← Back to Products
        </Link>

      <div style={{ 
        display: 'flex', 
        gap: '40px', 
        alignItems: 'flex-start', 
        flexWrap: 'wrap' 
        }}>

        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', maxWidth: '350px', height: '350px', objectFit: 'contain', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }} />
        <div style={{ flex: 1, minWidth: '300px' }}>
          
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '8px' }}>{product.name}
            </h2>

          <span style={{ 
            backgroundColor: '#e0e0e0', 
            color: '#555', 
            padding: '4px 12px', 
            borderRadius: '16px', 
            fontSize: '0.85rem' 
            }}
            >{product.category}
            </span>

          <p style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#1976d2', 
            marginTop: '16px' 
            }}
            >${product.price}
            </p>

          <p style={{ 
            marginTop: '16px', 
            lineHeight: '1.6', 
            color: '#444' 
            }}
            >{product.description}
            </p>

          <button style={{ 
            marginTop: '24px', 
            padding: '12px 24px', 
            backgroundColor: '#28a745', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontSize: '1.1rem', 
            fontWeight: 'bold' 
            }}
            
            >Add to Cart
            
            </button>
        </div>
      </div>
    </section>
  );
};
export default ProductDetailPage;