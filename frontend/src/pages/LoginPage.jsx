import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setToken, setUser } from '../auth/token';

const LoginPage = () => {
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
        email:    form.email,
        password: form.password,
      });

      // Lưu token và thông tin user vào localStorage
      setToken(result.access_token);
      setUser(result.user);

      // Chuyển về trang sản phẩm
      navigate('/products');
    } catch {
      setError('Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '24px', maxWidth: '400px', margin: '60px auto' }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Email</label>
          <input type="email" name="email" value={form.email}
            onChange={handleChange} required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>Mật khẩu</label>
          <input type="password" name="password" value={form.password}
            onChange={handleChange} required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
        </div>
        <button type="submit" disabled={loading}
          style={{ padding: '10px 20px', width: '100%', cursor: 'pointer' }}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}

      <p style={{ marginTop: '16px' }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </section>
  );
};

export default LoginPage;