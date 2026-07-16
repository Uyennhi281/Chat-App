import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box } from '@mui/material';

const PayPalCancelPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={1} sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: 72 }}>❌</Typography>
        <Typography variant="h4" fontWeight="bold" color="error.main" mt={2}>
          PayPal bị hủy
        </Typography>
        <Box mt={4} display="flex" gap={2} justifyContent="center">
          <Button variant="contained" onClick={() => navigate(`/orders/${orderId}/payment`)}>Thử lại</Button>
          <Button variant="outlined" onClick={() => navigate(`/orders/${orderId}`)}>Xem đơn hàng</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PayPalCancelPage;