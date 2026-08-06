import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setToken, setUser } from '../auth/token';

const LoginPage = () => {
  // --- PHẦN LOGIC ĐÃ ĐƯỢC LẮP RÁP TỪ CODE CŨ ---
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authApi.login({
        email: form.email,
        password: form.password,
      });

      // Lưu token và thông tin user vào localStorage
      setToken(result.access_token);
      setUser(result.user);

      // Shipper chỉ có quyền vào trang quản lý đơn giao hàng
      navigate(result.user.role === 'SHIPPER' ? '/shipper' : '/products');
    } catch {
      setError('Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };
  // ---------------------------------------------

  return (
    <div style={{ backgroundColor: '#0d6efd', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER TỐI GIẢN */}
      <header style={{ backgroundColor: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" style={{ color: '#0d6efd', margin: 0, fontSize: '1.8rem', fontWeight: 'bold', textDecoration: 'none' }}>
            ShopHub
          </Link>
          <span style={{ fontSize: '1.2rem', color: '#222', borderLeft: '1px solid #0d6efd', paddingLeft: '15px' }}>
            Đăng nhập
          </span>
        </div>
        <a href="#" style={{ color: '#0d6efd', textDecoration: 'none', fontSize: '0.9rem' }}>Bạn cần giúp đỡ?</a>
      </header>

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '1000px', gap: '50px', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* BÊN TRÁI: Banner / Hình ảnh */}
          <div style={{ flex: 1, textAlign: 'center', color: '#fff' }}>
            <img 
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80" 
              alt="Khuyến mãi" 
              style={{ width: '100%', maxWidth: '450px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }} 
            />
            <h2 style={{ fontSize: '2.2rem', marginTop: '25px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              Mua Sắm Thả Ga
            </h2>
            <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>
              Cùng ShopHub khám phá hàng ngàn ưu đãi mỗi ngày!
            </p>
          </div>

          {/* BÊN PHẢI: Form Đăng Nhập */}
          <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#222' }}>Đăng nhập</div>

            {/* Gắn sự kiện onSubmit vào form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="text" 
                  name="email" // Bắt buộc phải có name để map với form.email
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Email/Số điện thoại/Tên đăng nhập" 
                  style={{ width: '100%', padding: '14px', border: '1px solid #dbdbdb', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="password" 
                  name="password" // Bắt buộc phải có name để map với form.password
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Mật khẩu" 
                  style={{ width: '100%', padding: '14px', border: '1px solid #dbdbdb', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Hiển thị lỗi màu đỏ nếu đăng nhập sai */}
              {error && <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center', fontWeight: '500' }}>{error}</p>}

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  backgroundColor: loading ? '#f9a89b' : '#0d6efd', // Nhạt màu đi khi đang load
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontSize: '1rem', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  marginBottom: '15px', 
                  fontWeight: 'bold' 
                }}>
                {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '25px' }}>
              <Link to="/forgot-password" style={{ color: '#05a', textDecoration: 'none' }}>Quên mật khẩu?</Link>
              <a href="#" style={{ color: '#05a', textDecoration: 'none' }}>Đăng nhập với SMS</a>
            </div>

            {/* Dấu gạch chia cắt HOẶC */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#dbdbdb' }}></div>
              <span style={{ padding: '0 15px', color: '#ccc', fontSize: '0.85rem' }}>HOẶC</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#dbdbdb' }}></div>
            </div>

            {/* Mạng xã hội */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              <button type="button" style={{ flex: 1, padding: '10px', backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <span style={{ color: '#1877f2', fontWeight: 'bold', fontSize: '1.2rem' }}>f</span> Facebook
              </button>
              <button type="button" style={{ flex: 1, padding: '10px', backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <span style={{ color: '#ea4335', fontWeight: 'bold', fontSize: '1.2rem' }}>G</span> Google
              </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#222' }}>
              Bạn mới biết đến ShopHub? <Link to="/register" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 'bold' }}>Đăng ký</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;