import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Grid, Paper,
  Chip, IconButton, Divider, TextField, Rating,
  Tabs, Tab, Avatar, Stack, CircularProgress,
} from '@mui/material';
import {
  Add as PlusIcon, Remove as MinusIcon,
  ShoppingCart as CartIcon, FlashOn as FlashIcon,
  FavoriteBorder as HeartIcon, LocalShipping as LocalShippingIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { productsApi } from '../api/productsApi';
import { useCart } from '../context/CartContext';
import { getToken } from '../auth/token';

// ← THÊM DÒNG NÀY (định nghĩa PLACEHOLDER)
const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const COLORS = [
  { name: 'Đen', code: '#000000' },
  { name: 'Nâu', code: '#8B4513' },
  { name: 'Be', code: '#F5F5DC' },
];

const FLASH_SALE_END = new Date(Date.now() + 2 * 60 * 60 * 1000);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 28, seconds: 56 });

  // Sử dụng PLACEHOLDER đã định nghĩa ở trên
  const images = product?.imageUrl
    ? [
        `http://localhost:8000${product.imageUrl}`,
        PLACEHOLDER,
        PLACEHOLDER,
        PLACEHOLDER,
        PLACEHOLDER,
      ]
    : [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = FLASH_SALE_END - new Date();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity });
  };

  const handleBuyNow = async () => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Không tìm thấy sản phẩm</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/products')}>
          Quay lại
        </Button>
      </Container>
    );
  }

  const originalPrice = product.price * 1.5;

  return (
    <Container maxWidth="xl" sx={{ py: 2, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Grid container spacing={2}>
        {/* LEFT: Images */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 2, position: 'sticky', top: 80 }}>
            <Box
              component="img"
              src={images[selectedImage]}
              onError={(e) => { e.target.src = PLACEHOLDER; }}
              sx={{ width: '100%', height: 450, objectFit: 'contain', bgcolor: '#fff', borderRadius: 1 }}
            />
            <Stack direction="row" spacing={1} mt={2} sx={{ justifyContent: 'center' }}>
              {images.map((img, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={img}
                  onClick={() => setSelectedImage(idx)}
                  sx={{
                    width: 80, height: 80, objectFit: 'cover', borderRadius: 1, cursor: 'pointer',
                    border: selectedImage === idx ? '2px solid #ee4d2d' : '1px solid #ddd',
                  }}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={2} mt={3} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary" fontSize={14}>Chia sẻ:</Typography>
              <IconButton size="small"><HeartIcon color="error" /></IconButton>
              <Typography fontSize={14}>Đã thích (1.2k)</Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT: Info */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={500} mb={2}>
              <Chip label="Mall" size="small" color="error" sx={{ mr: 1, fontWeight: 'bold' }} />
              {product.name}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} precision={0.5} readOnly size="small" />
              <Typography color="primary" fontSize={14}>4.9</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography color="text.secondary" fontSize={14}>70 Đánh Giá</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography color="text.secondary" fontSize={14}>500 Đã Bán</Typography>
            </Stack>

            {/* Flash Sale */}
            <Box sx={{
              background: 'linear-gradient(90deg, #2d43ee 0%, #379bff 100%)',
              color: 'white', p: 1.5, borderRadius: '4px 4px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <FlashIcon />
                <Typography fontWeight="bold">FLASH SALE</Typography>
              </Stack>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <Typography fontSize={14}>KẾT THÚC TRONG</Typography>
                <Box sx={{ bgcolor: '#000', color: '#fff', px: 1, borderRadius: 0.5, fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </Box>
                <Typography>:</Typography>
                <Box sx={{ bgcolor: '#000', color: '#fff', px: 1, borderRadius: 0.5, fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </Box>
                <Typography>:</Typography>
                <Box sx={{ bgcolor: '#000', color: '#fff', px: 1, borderRadius: 0.5, fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </Box>
              </Stack>
            </Box>

            {/* Price */}
            <Box sx={{ bgcolor: '#fafafa', p: 2, borderRadius: '0 0 4px 4px', mb: 3 }}>
              <Stack direction="row" sx={{ alignItems: 'baseline', gap: 2 }}>
                <Typography variant="h3" color="#ee4d2d" fontWeight="500">
                  {Number(product.price).toLocaleString('vi-VN')}₫
                </Typography>
                <Typography sx={{ textDecoration: 'line-through', color: '#999', fontSize: 18 }}>
                  {Number(originalPrice).toLocaleString('vi-VN')}₫
                </Typography>
                <Chip label="-33%" size="small" sx={{ bgcolor: '#ee4d2d', color: 'white', fontWeight: 'bold' }} />
              </Stack>
            </Box>

            {/* Vouchers */}
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
              <Typography color="text.secondary" sx={{ width: 100 }}>Mã Giảm Giá</Typography>
              <Stack direction="row" spacing={1}>
                {['Giảm 3k', 'Giảm 5k'].map((v) => (
                  <Chip key={v} label={v} size="small" variant="outlined" color="error" />
                ))}
              </Stack>
            </Stack>

            {/* Shipping */}
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
              <Typography color="text.secondary" sx={{ width: 100 }}>Vận Chuyển</Typography>
              <Stack>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                  <LocalShippingIcon fontSize="small" />
                  <Typography fontSize={14}>Miễn phí vận chuyển</Typography>
                </Stack>
                <Typography fontSize={12} color="text.secondary" sx={{ ml: 3 }}>
                  Miễn phí vận chuyển cho đơn hàng trên ₫99.000
                </Typography>
              </Stack>
            </Stack>

            {/* Color */}
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', mb: 3 }}>
              <Typography color="text.secondary" sx={{ width: 100, pt: 1 }}>Màu Sắc</Typography>
              <Stack direction="row" spacing={1}>
                {COLORS.map((color, idx) => (
                  <Button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    variant={selectedColor === idx ? 'contained' : 'outlined'}
                    sx={{
                      minWidth: 80,
                      borderColor: selectedColor === idx ? '#0b32df' : '#ddd',
                      color: selectedColor === idx ? '#ee4d2d' : '#333',
                      bgcolor: selectedColor === idx ? '#ffeee8' : 'white',
                    }}
                    startIcon={
                      <Box sx={{ width: 16, height: 16, bgcolor: color.code, borderRadius: '50%', border: '1px solid #ddd' }} />
                    }
                  >
                    {color.name}
                  </Button>
                ))}
              </Stack>
            </Stack>

            {/* Quantity */}
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 4 }}>
              <Typography color="text.secondary" sx={{ width: 100 }}>Số Lượng</Typography>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  sx={{ border: '1px solid #ddd', borderRadius: 0.5 }}
                >
                  <MinusIcon fontSize="small" />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, style: { textAlign: 'center', width: 40, padding: '4px' } }}
                  size="small"
                  variant="outlined"
                />
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => q + 1)}
                  sx={{ border: '1px solid #ddd', borderRadius: 0.5 }}
                >
                  <PlusIcon fontSize="small" />
                </IconButton>
                <Typography color="text.secondary" fontSize={14}>
                  {product.stock || 1000} sản phẩm có sẵn
                </Typography>
              </Stack>
            </Stack>

            {/* Buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<CartIcon />}
                onClick={handleAddToCart}
                sx={{ flex: 1, borderColor: '#2d5aee', color: '#0f08c4', '&:hover': { bgcolor: '#ffeee8' }, py: 1.5 }}
              >
                Thêm Vào Giỏ
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleBuyNow}
                sx={{ flex: 1, bgcolor: '#2d5aee', '&:hover': { bgcolor: '#0f08c4' }, py: 1.5 }}
              >
                Mua Ngay
              </Button>
            </Stack>

            {/* Shop Info */}
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ width: 56, height: 56 }}><StoreIcon /></Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>ShopHub Official</Typography>
                <Typography fontSize={12} color="text.secondary">Online 5 phút trước</Typography>
              </Box>
              <Button variant="outlined" size="small">Xem Shop</Button>
            </Stack>
          </Paper>

          {/* Tabs */}
          <Paper elevation={0} sx={{ mt: 2 }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Mô tả" />
              <Tab label="Đánh giá" />
            </Tabs>
            <Box p={3}>
              {tab === 0 ? (
                <Typography sx={{ lineHeight: 1.8 }}>
                  {product.description}
                  <br /><br />
                  <strong>Thông tin:</strong>
                  <br />• Chất liệu: Cao cấp
                  <br />• Bảo hành: 12 tháng
                </Typography>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Chưa có đánh giá
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;