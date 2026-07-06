import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/productsApi';
import {
  Container, Typography, TextField, Button,
  Box, MenuItem, Paper, Alert
} from '@mui/material';

const categories = ['phone', 'laptop', 'tablet', 'accessories'];

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', price: '', category: '', description: '', imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await productsApi.create({
        ...form,
        price: parseFloat(form.price),
      });
      setSuccess('Tạo sản phẩm thành công!');
      setTimeout(() => navigate('/products'), 1500);
    } catch {
      setError('Tạo sản phẩm thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          ➕ Tạo sản phẩm mới
        </Typography>

        {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField label="Tên sản phẩm" name="name"
            value={form.name} onChange={handleChange} required />

          <TextField label="Giá (VNĐ)" name="price" type="number"
            value={form.price} onChange={handleChange} required inputProps={{ min: 0 }} />

          <TextField label="Category" name="category" select
            value={form.category} onChange={handleChange} required>
            {categories.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>

          <TextField label="Mô tả" name="description" multiline rows={3}
            value={form.description} onChange={handleChange} required />

          <TextField label="URL hình ảnh" name="imageUrl"
            value={form.imageUrl} onChange={handleChange}
            placeholder="/static/product.jpg" />

          <Box display="flex" gap={2} mt={1}>
            <Button type="submit" variant="contained" disabled={loading} fullWidth>
              {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/products')} fullWidth>
              Hủy
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductCreatePage;