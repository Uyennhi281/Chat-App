import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Button,  // ← Thêm TextField
  Box, MenuItem, Paper, Alert, Grid,
} from '@mui/material';
import { productsApi } from '../../api/productsApi';
import ImageUploader from '../../components/ImageUploader';

const categories = ['phone', 'laptop', 'tablet', 'accessories'];

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    imageUrl: '',
    stock: 0,
    sold: 0,
  });
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
    try {
      await productsApi.create({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        sold:  parseInt(form.sold, 10) || 0,
      });
      setSuccess('Tạo sản phẩm thành công!');
      setTimeout(() => navigate('/admin/products'), 1500);
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
          Tạo sản phẩm mới
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Tên sản phẩm"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Giá (VNĐ)"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Category"
                name="category"
                select
                value={form.category}
                onChange={handleChange}
                required
                fullWidth
              >
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Mô tả"
                name="description"
                multiline
                rows={3}
                value={form.description}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Tồn kho"
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
                fullWidth
                helperText="Số lượng sản phẩm có sẵn"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Đã bán"
                name="sold"
                type="number"
                value={form.sold}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
                fullWidth
                helperText="Thường để 0 với sản phẩm mới"
              />
            </Grid>

            {/* Upload ảnh thay vì nhập URL */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Hình ảnh sản phẩm
              </Typography>
              <ImageUploader
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/products')}
                  fullWidth
                >
                  Hủy
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductCreatePage;