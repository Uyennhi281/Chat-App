import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Divider, Alert, Chip, CircularProgress,
  RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import {
  Add as PlusIcon, Remove as MinusIcon,
  Delete as DeleteIcon, ShoppingCartCheckout as CheckoutIcon,
  DeleteSweep as ClearIcon, ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/ordersApi';
import { getToken } from '../auth/token';
import { PLACEHOLDER_SMALL } from '../utils/placeholder';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalQuantity, totalPrice } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [shippingProvider, setShippingProvider] = useState('IN_HOUSE');
  const [shippingFee, setShippingFee] = useState(0);
  const [feeLoading, setFeeLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchFee = async () => {
      setFeeLoading(true);
      try {
        const data = await ordersApi.calculateShippingFee(shippingProvider);
        if (!cancelled) setShippingFee(data.fee);
      } catch {
        if (!cancelled) setShippingFee(0);
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    };
    fetchFee();
    return () => { cancelled = true; };
  }, [shippingProvider]);

  const finalTotal = Number(totalPrice) + Number(shippingFee || 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Kiểm tra đã login chưa
    if (!getToken()) {
      navigate('/login');
      return;
    }

    setPlacingOrder(true);
    setError('');
    try {
      const order = await ordersApi.checkout(items, shippingProvider, shippingFee);
      clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Giỏ hàng trống
  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: 80 }}>🛒</Typography>
        <Typography variant="h5" fontWeight="bold" mt={2} mb={1}>Giỏ hàng trống</Typography>
        <Typography color="text.secondary" mb={4}>Bạn chưa có sản phẩm nào trong giỏ hàng</Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/products')} startIcon={<BackIcon />}>
          Tiếp tục mua sắm
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={1}>Giỏ hàng</Typography>
      <Typography color="text.secondary" mb={3}>{totalQuantity} sản phẩm</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>

        {/* Danh sách sản phẩm */}
        <Box flex={1}>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Đơn giá</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số lượng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tổng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Xóa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          component="img"
                          src={item.imageUrl ? `http://localhost:8000${item.imageUrl}` : PLACEHOLDER_SMALL}
                          onError={(e) => { e.target.src = PLACEHOLDER_SMALL; }}
                          sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, bgcolor: '#f5f5f5' }}
                        />
                        <Typography fontWeight={500}>{item.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography color="primary" fontWeight={600}>
                        {Number(item.price).toLocaleString('vi-VN')} ₫
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center"
                        border="1px solid #ddd" borderRadius={1} width="fit-content" mx="auto">
                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <MinusIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ px: 2, minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <PlusIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold">
                        {(Number(item.price) * item.quantity).toLocaleString('vi-VN')} ₫
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="outlined" color="inherit" startIcon={<BackIcon />}
              onClick={() => navigate('/products')}>
              Tiếp tục mua sắm
            </Button>
            <Button variant="outlined" color="error" startIcon={<ClearIcon />}
              onClick={() => { if (window.confirm('Xóa toàn bộ giỏ hàng?')) clearCart(); }}>
              Xóa tất cả
            </Button>
          </Box>
        </Box>

        {/* Order Summary */}
        <Box width={{ xs: '100%', md: 320 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 80 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Tóm tắt đơn hàng</Typography>
            <Divider sx={{ mb: 2 }} />

            {items.map(item => (
              <Box key={item.id} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary"
                  sx={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name} × {item.quantity}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {(Number(item.price) * item.quantity).toLocaleString('vi-VN')} ₫
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Đơn vị vận chuyển</Typography>
            <RadioGroup
              value={shippingProvider}
              onChange={(e) => setShippingProvider(e.target.value)}
              sx={{ mb: 1 }}
            >
              <FormControlLabel
                value="IN_HOUSE"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Giao hàng hỏa tốc (Cửa hàng tự giao)</Typography>}
              />
              <FormControlLabel
                value="GHN"
                control={<Radio size="small" />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">Giao hàng tiết kiệm (GHN)</Typography>
                    <Chip label="Chưa khả dụng" size="small" color="default" />
                  </Box>
                }
              />
            </RadioGroup>

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography color="text.secondary">Phí vận chuyển:</Typography>
              {feeLoading ? (
                <CircularProgress size={16} />
              ) : (
                <Typography fontWeight={500}>{Number(shippingFee).toLocaleString('vi-VN')} ₫</Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight="bold">Tổng cộng:</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {finalTotal.toLocaleString('vi-VN')} ₫
              </Typography>
            </Box>

            <Button variant="contained" fullWidth size="large"
              startIcon={placingOrder ? <CircularProgress size={20} color="inherit" /> : <CheckoutIcon />}
              onClick={handleCheckout}
              disabled={placingOrder}
              sx={{ py: 1.5 }}
            >
              {placingOrder ? 'Đang xử lý...' : 'Thanh toán'}
            </Button>

            {!getToken() && (
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                Bạn cần đăng nhập để thanh toán
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;