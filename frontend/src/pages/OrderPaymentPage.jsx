import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, RadioGroup,
  FormControlLabel, Radio, Divider, Alert, CircularProgress, Chip,
} from '@mui/material';
import {
  CreditCard as StripeIcon,
  AccountBalance as PayPalIcon,
  Payment as VNPayIcon,
} from '@mui/icons-material';
import { ordersApi } from '../api/ordersApi';
import { paymentsApi } from '../api/paymentsApi';

const PAYMENT_METHODS = [
  {
    value: 'stripe',
    label: 'Stripe (Thẻ tín dụng / Debit)',
    icon: '💳',
    color: '#6772e5',
    description: 'Thanh toán bằng thẻ Visa, Mastercard',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    icon: '🅿️',
    color: '#003087',
    description: 'Thanh toán qua tài khoản PayPal',
  },
  {
    value: 'vnpay',
    label: 'VNPay',
    icon: '🏦',
    color: '#e31837',
    description: 'Thanh toán qua cổng VNPay',
  },
];

const statusColors = {
  PLACED: 'primary', PROCESSING: 'warning',
  SHIPPED: 'info', COMPLETED: 'success',
  CANCELED: 'error', PAID: 'success',
};

const OrderPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(false);
  const [method, setMethod]   = useState('stripe');
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await ordersApi.getOrderById(id);
        setOrder(data);
      } catch {
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    setError('');
    try {
      let redirectUrl = '';

      if (method === 'stripe') {
        const data = await paymentsApi.createStripeSession(order.id);
        redirectUrl = data.url;
      } else if (method === 'paypal') {
        const data = await paymentsApi.createPayPalOrder(order.id);
        redirectUrl = data.approve_url;
      } else if (method === 'vnpay') {
        const data = await paymentsApi.createVNPayUrl(order.id);
        redirectUrl = data.url;
      }

      // Redirect sang cổng thanh toán
      window.location.href = redirectUrl;

    } catch (err) {
      setError(err.response?.data?.detail || 'Tạo phiên thanh toán thất bại. Thử lại.');
    } finally {
      setPaying(false);
    }
  };

 if (loading) return (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <CircularProgress />
  </Box>
);

  if (!order) return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Thanh toán đơn hàng</Typography>

      {/* Order Summary */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">Đơn hàng #{order.id}</Typography>
            <Typography color="text.secondary" fontSize={14} mt={0.5}>
              {new Date(order.created_at).toLocaleString('vi-VN')}
            </Typography>
          </Box>
          <Chip label={order.status} color={statusColors[order.status] || 'default'} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {order.items.map(item => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>{item.product_name} × {item.quantity}</Typography>
            <Typography fontWeight={500}>
              {Number(item.line_total).toLocaleString('vi-VN')} ₫
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">Tổng cộng:</Typography>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {Number(order.total_amount).toLocaleString('vi-VN')} ₫
          </Typography>
        </Box>
      </Paper>

      {/* Already Paid */}
      {order.status === 'PAID' ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h1" sx={{ fontSize: 64 }}>✅</Typography>
          <Typography variant="h5" fontWeight="bold" mt={2} color="success.main">
            Đơn hàng đã được thanh toán
          </Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(`/orders/${order.id}`)}>
            Xem chi tiết đơn hàng
          </Button>
        </Paper>
      ) : (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Chọn phương thức thanh toán
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)}>
            {PAYMENT_METHODS.map((pm) => (
              <Paper
                key={pm.value}
                variant="outlined"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  border: method === pm.value ? `2px solid ${pm.color}` : '1px solid #e0e0e0',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': { borderColor: pm.color },
                }}
                onClick={() => setMethod(pm.value)}
              >
                <FormControlLabel
                  value={pm.value}
                  control={<Radio sx={{ color: pm.color, '&.Mui-checked': { color: pm.color } }} />}
                  label={
                    <Box py={1} pr={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontSize={24}>{pm.icon}</Typography>
                        <Typography fontWeight={600}>{pm.label}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" ml={4}>
                        {pm.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0, px: 2 }}
                />
              </Paper>
            ))}
          </RadioGroup>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePay}
            disabled={paying}
            sx={{ mt: 1, py: 1.5, fontSize: 16 }}
          >
            {paying ? 'Đang xử lý...' : `Thanh toán với ${PAYMENT_METHODS.find(m => m.value === method)?.label}`}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            🔒 Thanh toán được bảo mật và mã hóa
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default OrderPaymentPage;