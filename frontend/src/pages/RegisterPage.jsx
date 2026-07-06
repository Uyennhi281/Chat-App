import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', fullName: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.register({
        email:     form.email,
        full_name: form.fullName,
        password:  form.password,
      });
      setSuccess('Đăng ký thành công! Chuyển đến trang đăng nhập...');
      setForm({ email: '', fullName: '', password: '' });
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '24px', maxWidth: '400px', margin: '60px auto' }}>
      <h2>Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Email</label>
          <input type="email" name="email" value={form.email}
            onChange={handleChange} required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label>Họ tên</label>
          <input type="text" name="fullName" value={form.fullName}
            onChange={handleChange} required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>Mật khẩu</label>
          <input type="password" name="password" value={form.password}
            onChange={handleChange} required minLength={6}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
        </div>
        <button type="submit" disabled={loading}
          style={{ padding: '10px 20px', width: '100%', cursor: 'pointer' }}>
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
      </form>

      {error   && <p style={{ color: 'red',   marginTop: '12px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '12px' }}>{success}</p>}

      <p style={{ marginTop: '16px' }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </section>
  );
};

export default RegisterPage;