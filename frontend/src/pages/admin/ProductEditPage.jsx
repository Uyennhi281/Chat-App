import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Typography, TextField, Button,
  Box, MenuItem, Paper, Alert, CircularProgress,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { productsApi } from '../../api/productsApi';

const categories = ['phone', 'laptop', 'tablet', 'accessories'];

const ProductEditPage = () => {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const [form, setForm]       = useState({ name: '', price: '', category: '', description: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getById(id);
        setForm({
          name:        data.name,
          price:       data.price,
          category:    data.category,
          description: data.description,
          imageUrl:    data.imageUrl || '',
        });
      } catch {
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await productsApi.update(id, { ...form, price: parseFloat(form.price) });
      setSuccess('Cập nhật thành công!');
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch {
      setError('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
  );

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
          <EditIcon color="warning" /> Sửa sản phẩm
        </Typography>

        {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <Box display="flex" gap={2}>
            <TextField label="Tên sản phẩm" name="name"
              value={form.name} onChange={handleChange} required fullWidth />
            <TextField label="Giá (VNĐ)" name="price" type="number"
              value={form.price} onChange={handleChange} required
              inputProps={{ min: 0 }} sx={{ width: 160 }} />
          </Box>

          <TextField label="Category" name="category" select
            value={form.category} onChange={handleChange} required>
            {categories.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>

          <Box display="flex" gap={2}>
            <TextField label="Mô tả" name="description" multiline rows={3}
              value={form.description} onChange={handleChange} required fullWidth />
            <TextField label="URL hình ảnh" name="imageUrl"
              value={form.imageUrl} onChange={handleChange}
              placeholder="/static/product.jpg" fullWidth />
          </Box>

          <Box display="flex" gap={2} mt={1}>
            <Button type="submit" variant="contained" color="warning"
              disabled={saving} fullWidth>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/products')} fullWidth>
              Hủy
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductEditPage;