import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, Paper } from '@mui/material';
import { paymentsApi } from '../../api/paymentsApi';

const StripeSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const confirm = async () => {
      if (!orderId) { setError('Thiếu thông tin đơn hàng'); setLoading(false); return; }
      try {
        await paymentsApi.confirmPayment(Number(orderId), 'stripe');
      } catch {
        setError('Không thể xác nhận thanh toán');
      } finally {
        setLoading(false);
      }
    };
    confirm();
  }, [orderId]);

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={1} sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
        {error ? (
          <>
            <Typography variant="h1" sx={{ fontSize: 72 }}>❌</Typography>
            <Typography variant="h5" fontWeight="bold" color="error" mt={2}>{error}</Typography>
          </>
        ) : (
          <>
            <Typography variant="h1" sx={{ fontSize: 72 }}>✅</Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main" mt={2}>
              Thanh toán thành công!
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Cảm ơn bạn đã thanh toán qua <strong>Stripe</strong>
            </Typography>
          </>
        )}
        <Box mt={4} display="flex" gap={2} justifyContent="center">
          <Button variant="contained" onClick={() => navigate(`/orders/${orderId}`)}>
            Xem đơn hàng #{orderId}
          </Button>
          <Button variant="outlined" component={Link} to="/products">
            Tiếp tục mua sắm
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default StripeSuccessPage;