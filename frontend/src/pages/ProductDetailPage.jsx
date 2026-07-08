import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Grid,
  Chip, CircularProgress, Alert, Divider,
  Paper, Snackbar,
} from '@mui/material';
import {
  AddShoppingCart as AddCartIcon,
  ArrowBack as BackIcon,
  Add as PlusIcon,
  Remove as MinusIcon,
} from '@mui/icons-material';
import { productsApi } from '../api/productsApi';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const { addToCart }  = useCart();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getById(id);
        setProduct(data);
      } catch {
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setSnackbar(true);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
  );

  if (error) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  if (!product) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3, color: '#666' }}
      >
        Quay lại
      </Button>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Grid container>
          {/* Product Image */}
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src={product.imageUrl || 'https://via.placeholder.com/500x400'}
              alt={product.name}
              sx={{
                width: '100%',
                height: { xs: 280, md: 420 },
                objectFit: 'contain',
                backgroundColor: '#f5f5f5',
                p: 3,
              }}
              onError={e => { e.target.src = 'https://via.placeholder.com/500x400'; }}
            />
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={7}>
            <Box sx={{ p: 4 }}>
              <Chip
                label={product.category}
                size="small"
                color="primary"
                sx={{ mb: 2 }}
              />

              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {product.name}
              </Typography>

              <Typography variant="h3" color="primary" fontWeight="bold" sx={{ mb: 3 }}>
                {Number(product.price).toLocaleString('vi-VN')} ₫
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                {product.description}
              </Typography>

              {/* Quantity Selector */}
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Typography fontWeight={600}>Số lượng:</Typography>
                <Box
                  display="flex"
                  alignItems="center"
                  border="1px solid #ddd"
                  borderRadius={1}
                >
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <MinusIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    <PlusIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Add to Cart Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<AddCartIcon />}
                onClick={handleAddToCart}
                sx={{
                  py: 1.5,
                  backgroundColor: '#ff6b00',
                  '&:hover': { backgroundColor: '#e65100' },
                  fontSize: '1.1rem',
                }}
              >
                Thêm vào giỏ hàng
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar}
        autoHideDuration={2000}
        onClose={() => setSnackbar(false)}
        message={`✅ Đã thêm ${product.name} vào giỏ hàng!`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ProductDetailPage;