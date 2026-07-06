import { useState, useEffect } from 'react';
import {
  Grid, Container, Typography, Box,
  CircularProgress, Button
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { useAuth } from '../auth/useAuth';
import ProductCard from '../components/ProductCard';
import CategoryNav from '../components/CategoryNav';

const ProductPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
    } catch {
      setError('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Xóa thất bại. Kiểm tra lại quyền của bạn.');
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <CategoryNav />
      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* Header + nút Create (chỉ ADMIN thấy) */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Sản phẩm
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/products/new')}
              sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
            >
              Tạo sản phẩm
            </Button>
          )}
        </Box>

        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ProductPage;