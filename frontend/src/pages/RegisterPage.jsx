import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

const RegisterPage = () => {
  // --- PHẦN LOGIC ĐÃ ĐƯỢC LẮP RÁP TỪ CODE CŨ ---
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', fullName: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Thêm bước kiểm tra mật khẩu xác nhận cho an toàn nè
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp nha!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authApi.register({
        email: form.email,
        full_name: form.fullName,
        password: form.password,
      });
      
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setForm({ email: '', fullName: '', password: '', confirmPassword: '' });
      
      // Chuyển về trang login sau 1.5 giây
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
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
            Đăng ký
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
              Trở Thành Thành Viên
            </h2>
            <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>
              Nhận ngay voucher khủng cho đơn hàng đầu tiên của bạn!
            </p>
          </div>

          {/* BÊN PHẢI: Form Đăng Ký */}
          <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#222' }}>Đăng ký</div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <input 
                  type="email" 
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Email của bạn" 
                  style={{ width: '100%', padding: '14px', border: '1px solid #dbdbdb', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <input 
                  type="text" 
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Họ và tên" 
                  style={{ width: '100%', padding: '14px', border: '1px solid #dbdbdb', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <input 
                  type="password" 
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Mật khẩu" 
                  style={{ width: '100%', padding: '14px', border: '1px solid #dbdbdb', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Xác nhận lại mật khẩu" 
                  style={{ width: '100%', padding: '14px', border: '1px solid #dbdbdb', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Khu vực thông báo trạng thái */}
              {error && <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center', fontWeight: '500' }}>{error}</p>}
              {success && <p style={{ color: 'green', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center', fontWeight: '500' }}>{success}</p>}

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  backgroundColor: loading ? '#f9a89b' : '#0d6efd', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontSize: '1rem', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  marginBottom: '20px', 
                  fontWeight: 'bold' 
                }}>
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
              </button>
            </form>

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
              Bạn đã có tài khoản? <Link to="/login" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;