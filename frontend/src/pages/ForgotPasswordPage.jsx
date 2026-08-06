import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetUrl('');
    try {
      const data = await authApi.forgotPassword(email);
      setResetUrl(data.reset_url || '');
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể tạo liên kết đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0d6efd', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" style={{ color: '#0d6efd', margin: 0, fontSize: '1.8rem', fontWeight: 'bold', textDecoration: 'none' }}>
            ShopHub
          </Link>
          <span style={{ fontSize: '1.2rem', color: '#222', borderLeft: '1px solid #0d6efd', paddingLeft: '15px' }}>
            Quên mật khẩu
          </span>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '8px', width: '420px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#222' }}>Quên mật khẩu</div>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '25px' }}>
            Nhập email tài khoản của bạn, chúng tôi sẽ tạo liên kết đặt lại mật khẩu.
          </p>

          {!resetUrl ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email của bạn"
                  style={{ width: '100%', padding: '14px', border: '1px solid #dbdbdb', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {error && <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center', fontWeight: '500' }}>{error}</p>}

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
                  fontWeight: 'bold',
                }}>
                {loading ? 'ĐANG XỬ LÝ...' : 'GỬI YÊU CẦU'}
              </button>
            </form>
          ) : (
            <div>
              <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffe69c', borderRadius: '4px', padding: '12px 14px', marginBottom: '15px' }}>
                <p style={{ fontSize: '0.85rem', color: '#664d03', margin: 0 }}>
                  ⚠️ Dự án chưa cấu hình gửi email thật. Đây là liên kết đặt lại mật khẩu (chỉ hiển thị ở chế độ dev):
                </p>
              </div>
              <div style={{ backgroundColor: '#f5f5f5', borderRadius: '4px', padding: '12px 14px', marginBottom: '20px', wordBreak: 'break-all' }}>
                <a href={resetUrl} style={{ color: '#0d6efd', fontSize: '0.85rem' }}>{resetUrl}</a>
              </div>
              <Link to={resetUrl.replace(/^https?:\/\/[^/]+/, '')} style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  style={{ width: '100%', padding: '14px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  ĐI ĐẾN TRANG ĐẶT LẠI MẬT KHẨU
                </button>
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#222', marginTop: '20px' }}>
            <Link to="/login" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 'bold' }}>← Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
