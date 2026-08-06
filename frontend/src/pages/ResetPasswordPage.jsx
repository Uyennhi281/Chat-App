import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.resetPassword(token, form.password);
      setSuccess('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.detail || 'Liên kết không hợp lệ hoặc đã hết hạn.');
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
            Đặt lại mật khẩu
          </span>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '25px', color: '#222' }}>Đặt lại mật khẩu</div>

          {!token ? (
            <p style={{ color: 'red', fontSize: '0.9rem' }}>
              Thiếu mã đặt lại mật khẩu. Vui lòng dùng lại liên kết từ trang{' '}
              <Link to="/forgot-password" style={{ color: '#0d6efd' }}>quên mật khẩu</Link>.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Mật khẩu mới"
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
                  placeholder="Xác nhận mật khẩu mới"
                  style={{ width: '100%', padding: '14px', border: '1px solid #dbdbdb', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

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
                  fontWeight: 'bold',
                }}>
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐẶT LẠI MẬT KHẨU'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#222', marginTop: '20px' }}>
            <Link to="/login" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 'bold' }}>← Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
