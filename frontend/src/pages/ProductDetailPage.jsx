import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Grid, Paper,
  IconButton, Divider, TextField, Rating,
  Tabs, Tab, Avatar, Stack, CircularProgress, Alert,
} from '@mui/material';
import {
  Add as PlusIcon, 
  Remove as MinusIcon,
  AddShoppingCart as CartIcon, 
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as ShieldIcon
} from '@mui/icons-material';
import { productsApi } from '../api/productsApi';
import { reviewsApi } from '../api/reviewsApi';
import { useCart } from '../context/CartContext';
import { getToken } from '../auth/token';
import { useAuth } from '../auth/useAuth';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const image = product?.imageUrl
    ? `http://localhost:8000${product.imageUrl}`
    : PLACEHOLDER;

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
    const fetchReviews = async () => {
      try {
        const data = await reviewsApi.getByProduct(id);
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmitting(true);
    try {
      const created = await reviewsApi.create(id, { rating: newRating, comment: newComment });
      setReviews((prev) => [created, ...prev]);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    try {
      await reviewsApi.remove(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      alert('Không thể xóa đánh giá');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#ee4d2d' }} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Không tìm thấy sản phẩm</Typography>
        <Button variant="contained" sx={{ mt: 2, bgcolor: '#ee4d2d', '&:hover': { bgcolor: '#d73d1f' } }} onClick={() => navigate('/products')}>
          Quay lại
        </Button>
      </Container>
    );
  }

  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  const alreadyReviewed = user && reviews.some((r) => r.user_id === user.id);
  const canReview = isAuthenticated && !isAdmin && !alreadyReviewed;

  // Lấy dữ liệu thật từ Database (gán mặc định bằng 0 nếu chưa có)
  const currentStock = product.stock !== undefined ? product.stock : 0;
  const currentSold = product.sold !== undefined ? product.sold : 0;

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', pb: 6, pt: 3 }}>
      <Container maxWidth="lg">
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Trang chủ &nbsp;{'>'}&nbsp; {product.category || 'Sản phẩm'} &nbsp;{'>'}&nbsp; {product.name}
        </Typography>

        <Paper elevation={0} sx={{ p: 3, borderRadius: '2px', mb: 3 }}>
          <Grid container spacing={4}>
            
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{
                width: '100%', 
                aspectRatio: '1 / 1', 
                minHeight: { xs: 350, sm: 400 }, 
                backgroundColor: '#fafafa', 
                border: '1px solid #eee',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                <Box
                  component="img"
                  src={image}
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                  alt={product.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>

              <Typography variant="h5" sx={{ fontWeight: 500, color: '#222', mb: 1, lineHeight: 1.4 }}>
                <Box component="span" sx={{ backgroundColor: '#ee4d2d', color: '#fff', fontSize: '0.75rem', px: 1, py: 0.3, borderRadius: '2px', mr: 1, verticalAlign: 'middle' }}>
                  Yêu thích
                </Box>
                {product.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#ee4d2d', borderRight: '1px solid #eee', pr: 2 }}>
                  <Typography sx={{ borderBottom: '1px solid #ee4d2d', mr: 0.5, fontWeight: 'bold' }}>
                    {avgRating > 0 ? avgRating.toFixed(1) : '0'}
                  </Typography>
                  <Rating value={avgRating} precision={0.5} readOnly size="small" sx={{ color: '#ee4d2d' }} />
                </Box>
                <Typography variant="body2" sx={{ borderRight: '1px solid #eee', pr: 2 }}>
                  <Typography component="span" sx={{ borderBottom: '1px solid #222', fontWeight: 'bold' }}>{reviewCount}</Typography> Đánh Giá
                </Typography>
                <Typography variant="body2">
                  {/* Hiển thị số lượng Đã bán từ API */}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>{currentSold.toLocaleString('vi-VN')}</Typography> Đã Bán
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: '#fafafa', p: 2.5, mb: 3, display: 'flex', alignItems: 'flex-end', gap: 2, borderRadius: '2px' }}>
                <Typography sx={{ color: '#ee4d2d', fontSize: '2rem', fontWeight: 500 }}>
                  ₫{Number(product.price).toLocaleString('vi-VN')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 4, alignItems: 'flex-start' }}>
                <Typography sx={{ width: '110px', color: '#757575', fontSize: '0.9rem' }}>Vận chuyển</Typography>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ShippingIcon sx={{ color: '#00bfa5' }} />
                    <Typography sx={{ fontSize: '0.9rem' }}>Miễn phí vận chuyển</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.85rem', color: '#757575', ml: 4 }}>Miễn phí vận chuyển cho đơn hàng trên ₫50.000</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Typography sx={{ width: '110px', color: '#757575', fontSize: '0.9rem' }}>Số lượng</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e8e8e8', borderRadius: '2px' }}>
                  <IconButton onClick={() => setQuantity((q) => Math.max(1, q - 1))} size="small" sx={{ borderRadius: 0, width: 32, height: 32 }}>
                    <MinusIcon fontSize="small" />
                  </IconButton>
                  <Divider orientation="vertical" flexItem />
                  
                  {/* Chặn người dùng gõ số vượt quá kho */}
                  <TextField 
                    value={quantity} 
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 1;
                      if (val > currentStock) val = currentStock; // Không cho nhập vượt tồn kho
                      if (val < 1) val = 1;
                      setQuantity(val);
                    }}
                    inputProps={{ style: { textAlign: 'center', width: '40px', padding: '4px 0', fontSize: '0.9rem' } }}
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                  />
                  <Divider orientation="vertical" flexItem />
                  
                  {/* Nút cộng bị giới hạn bởi tồn kho */}
                  <IconButton onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))} size="small" sx={{ borderRadius: 0, width: 32, height: 32 }}>
                    <PlusIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography sx={{ ml: 2, fontSize: '0.85rem', color: '#757575' }}>
                  {/* Hiển thị số lượng hàng có sẵn từ API */}
                  {currentStock.toLocaleString('vi-VN')} sản phẩm có sẵn
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<CartIcon />}
                  onClick={handleAddToCart}
                  disabled={currentStock === 0} // Hết hàng thì mờ nút
                  sx={{ 
                    px: 3, py: 1.5, 
                    color: '#ee4d2d', borderColor: '#ee4d2d', backgroundColor: '#ffeedb',
                    '&:hover': { backgroundColor: '#ffeedb', borderColor: '#ee4d2d', opacity: 0.9 },
                    textTransform: 'none', fontSize: '1rem',
                    '&.Mui-disabled': { borderColor: '#ddd', backgroundColor: '#f5f5f5' }
                  }}
                >
                  Thêm Vào Giỏ Hàng
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleBuyNow}
                  disabled={currentStock === 0} // Hết hàng thì mờ nút
                  sx={{ 
                    px: 4, py: 1.5, 
                    backgroundColor: '#ee4d2d', color: '#fff',
                    '&:hover': { backgroundColor: '#d73d1f' },
                    textTransform: 'none', fontSize: '1rem', minWidth: '150px'
                  }}
                >
                  Mua Ngay
                </Button>
              </Box>

              <Box sx={{ mt: 4, pt: 3, borderTop: '1px dashed #eee', display: 'flex', alignItems: 'center', gap: 1, color: '#222' }}>
                <ShieldIcon sx={{ color: '#ee4d2d' }} fontSize="small" />
                <Typography sx={{ fontSize: '0.9rem' }}>ShopHub Đảm Bảo</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#757575', ml: 1 }}>3 Ngày Trả Hàng / Hoàn Tiền</Typography>
              </Box>

            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: '2px' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#fafafa', px: 2 }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)} TabIndicatorProps={{ style: { backgroundColor: '#ee4d2d' } }}>
              <Tab label="MÔ TẢ SẢN PHẨM" sx={{ fontSize: '1rem', fontWeight: 500, '&.Mui-selected': { color: '#ee4d2d' } }} />
              <Tab label={`ĐÁNH GIÁ (${reviewCount})`} sx={{ fontSize: '1rem', fontWeight: 500, '&.Mui-selected': { color: '#ee4d2d' } }} />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 4 }}>
            {tab === 0 ? (
              <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#333', whiteSpace: 'pre-line' }}>
                {product.description || 'Chưa có mô tả cho sản phẩm này.'}
              </Typography>
            ) : (
              <Box>
                {canReview && (
                  <Box component="form" onSubmit={handleSubmitReview} sx={{ mb: 4, pb: 4, borderBottom: '1px solid #eee' }}>
                    <Typography fontWeight={600} mb={1}>Viết đánh giá của bạn</Typography>
                    <Rating
                      value={newRating}
                      onChange={(e, v) => setNewRating(v || 1)}
                      sx={{ mb: 1.5, color: '#ee4d2d' }}
                    />
                    <TextField
                      fullWidth multiline minRows={3}
                      placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                      sx={{ mb: 2, bgcolor: '#fafafa', '& fieldset': { borderColor: '#ddd' } }}
                    />
                    {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
                    <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: '#ee4d2d', '&:hover': { bgcolor: '#d73d1f' } }}>
                      {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                  </Box>
                )}

                {!isAuthenticated && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Vui lòng <a href="/login" style={{ color: '#ee4d2d' }}>đăng nhập</a> để đánh giá sản phẩm này.
                  </Alert>
                )}
                {isAdmin && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Tài khoản quản trị viên không thể đánh giá sản phẩm.
                  </Alert>
                )}
                {alreadyReviewed && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Bạn đã đánh giá sản phẩm này. Cảm ơn bạn!
                  </Alert>
                )}

                {reviewsLoading ? (
                  <Box display="flex" justifyContent="center" py={4}><CircularProgress size={28} sx={{ color: '#ee4d2d' }} /></Box>
                ) : reviews.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Chưa có đánh giá nào cho sản phẩm này.
                  </Typography>
                ) : (
                  <Stack spacing={3}>
                    {reviews.map((r) => (
                      <Box key={r.id} sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#f0f0f0', color: '#555' }}>
                          {r.user_name?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={500} fontSize={14}>{r.user_name}</Typography>
                          <Rating value={r.rating} readOnly size="small" sx={{ color: '#ee4d2d', my: 0.5 }} />
                          <Typography fontSize={12} color="text.secondary" mb={1}>
                            {new Date(r.created_at).toLocaleDateString('vi-VN')}
                          </Typography>
                          <Typography fontSize={14} color="#333">{r.comment}</Typography>
                        </Box>
                        {(user?.id === r.user_id || isAdmin) && (
                          <IconButton size="small" onClick={() => handleDeleteReview(r.id)} sx={{ height: 'fit-content' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Box>
        </Paper>

      </Container>
    </Box>
  );
};

export default ProductDetailPage;