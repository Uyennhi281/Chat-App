import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const ProductList = () => {
  // Khởi tạo các trạng thái lưu dữ liệu, loading và lỗi
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Gọi API lấy danh sách sản phẩm từ FakeStoreAPI
    axios.get('https://fakestoreapi.com/products')
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Đã xảy ra lỗi khi tải danh sách sản phẩm. Hãy kiểm tra lại kết nối mạng!');
        setLoading(false);
      });
  }, []);

  // Giao diện khi đang tải dữ liệu
  if (loading) return <div style={{ padding: '24px', textAlign: 'center', fontSize: '1.2rem' }}>🔄 Đang tải danh sách sản phẩm...</div>;
  
  // Giao diện khi gặp lỗi kết nối
  if (error) return <div style={{ padding: '24px', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <section style={{ padding: '24px' }}>
      <h2 style={{ borderBottom: '2px solid #1976d2', paddingBottom: '8px' }}>Product Catalog</h2>
      <p style={{ color: '#666' }}>Browse our real-time product catalog from FakeStoreAPI.</p>

      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center'
        }}
      >
        {/* Lặp qua mảng sản phẩm bằng hàm map() */}
        {products.map((product) => (
          <ProductCard
            key={product.id} // Key định danh duy nhất cho mỗi phần tử trong danh sách
            title={product.title}
            price={product.price}
            category={product.category}
            image={product.image}
            description={product.description}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductList;