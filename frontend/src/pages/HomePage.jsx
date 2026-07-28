import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import ProductCard from '../components/ProductCard';


const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

// Gọi API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productsApi.getAll();
        
        // Bóc tách dữ liệu từ Backend
        const itemsList = data.items || data || [];
        
        // Lấy ra 4 sản phẩm đầu tiên từ Database để làm "Sản Phẩm Nổi Bật" cho Banner dưới trang
        const mapped = itemsList.slice(0, 4).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          description: p.description,
          imageUrl: p.imageUrl,
        }));
        setFeaturedProducts(mapped);
      } catch (err) {
        setError('Không thể tải sản phẩm nổi bật từ hệ thống.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '80vh', paddingBottom: '60px' }}>
      
      {/* 1. HERO BANNER CHÍNH - Thu hút khách hàng ngay từ Trang Chủ */}
      <section style={{
        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
        color: '#fff',
        padding: '80px 20px',
        textAlign: 'center',
        marginBottom: '50px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            padding: '6px 16px', 
            borderRadius: '20px', 
            fontSize: '0.85rem', 
            textTransform: 'uppercase', 
            letterSpacing: '1px' 
          }}>
            Chào mừng đến với ShopHub
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '20px 0 15px' }}>
            Shop Mua Sắm Trực Tuyến
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#e0ecff', marginBottom: '30px', lineHeight: '1.6' }}>
            Khám phá hàng ngàn sản phẩm công nghệ với giá cực kỳ ưu đãi. Tất cả dữ liệu đều được cập nhật theo thời gian thực!
          </p>
          <Link to="/products" style={{
            display: 'inline-block',
            backgroundColor: '#ffc107',
            color: '#000',
            fontWeight: 'bold',
            padding: '14px 36px',
            borderRadius: '30px',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)',
            transition: 'transform 0.2s',
          }}>
            🛒 Khám Phá Ngay
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* 2. THREE FEATURE BOXES - Hộp niềm tin (hoặc cậu có thể thay bằng <FeatureSection /> của cậu) */}
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px', 
          marginBottom: '60px' 
        }}>
          {[
            { icon: '🚀', title: 'Giao Hàng Siêu Tốc', desc: 'Miễn phí vận chuyển cho đơn từ $50' },
            { icon: '🛡️', title: 'Bảo Hành Chính Hãng', desc: 'Cam kết đổi trả 1-1 trong 30 ngày' },
            { icon: '🎧', title: 'Hỗ Trợ 24/7', desc: 'Luôn sẵn sàng giải đáp mọi thắc mắc' }
          ].map((box, index) => (
            <div key={index} style={{
              backgroundColor: '#fff',
              padding: '25px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '2.5rem' }}>{box.icon}</span>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#212529' }}>{box.title}</h4>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>{box.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* 3. BANNER SẢN PHẨM NỔI BẬT Ở DƯỚI TRANG CHỦ (Lấy trực tiếp từ Database) */}
        <section>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginBottom: '25px',
            borderBottom: '2px solid #e9ecef',
            paddingBottom: '12px'
          }}>
            <div>
              <span style={{ color: '#0d6efd', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                ✦ Đừng Bỏ Lỡ
              </span>
              <h2 style={{ fontSize: '1.8rem', margin: '5px 0 0', color: '#212529' }}>
                Sản Phẩm Nổi Bật Tuần Này
              </h2>
            </div>
            <Link to="/products" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>
              Xem tất cả sản phẩm ({featuredProducts.length}+) →
            </Link>
          </div>

          {/* Render danh sách sản phẩm nổi bật bằng ProductCard sẵn có của cậu */}
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', fontSize: '1.1rem' }}>⏳ Đang tải sản phẩm nổi bật từ Database...</p>
          ) : error ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'red', fontWeight: 'bold' }}>❌ {error}</p>
          ) : featuredProducts.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '24px' 
            }}>
              {featuredProducts.map((prod) => (
                <div key={prod.id} style={{ position: 'relative' }}>
                  {/* Badge dán đè lên góc card cho đúng chất Banner Nổi Bật */}
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    zIndex: 2,
                    boxShadow: '0 2px 6px rgba(220, 53, 69, 0.4)'
                  }}>
                    Hot Deal 🔥
                  </span>
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px' }}>
              <p style={{ color: '#6c757d', margin: 0 }}>📦 Kho dữ liệu hiện chưa có sản phẩm nào. Cậu hãy thêm sản phẩm ở trang quản lý để hiển thị tại đây nhé!</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default HomePage;