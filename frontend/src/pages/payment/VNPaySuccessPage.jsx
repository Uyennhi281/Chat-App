import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box, CircularProgress } from '@mui/material';
import { paymentsApi } from '../../api/paymentsApi';

const VNPaySuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 1. Lấy mã giao dịch từ URL (Ghi nhận cả vnp_TxnRef hoặc order_id)
  const orderId = searchParams.get('order_id') || searchParams.get('vnp_TxnRef');
  const responseCode = searchParams.get('vnp_ResponseCode');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Thêm state lưu ID đơn hàng thật (số nguyên) do Backend trả về để gắn vào link Xem đơn hàng
  const [realOrderId, setRealOrderId] = useState(null); 
  
  const isSuccess = responseCode === '00';

  useEffect(() => {
    const confirm = async () => {
      if (!orderId) { 
        setError('Thiếu thông tin đơn hàng trên URL'); 
        setLoading(false); 
        return; 
      }
      if (!isSuccess) { 
        setError('Thanh toán thất bại hoặc đã bị hủy'); 
        setLoading(false); 
        return; 
      }
      try {
        // 2. QUAN TRỌNG: Gửi thẳng chuỗi orderId (KHÔNG dùng Number() để tránh bị lỗi NaN -> null)
        const res = await paymentsApi.confirmPayment(orderId, 'vnpay');
        
        // Nếu Backend trả về ID đơn hàng thật (ví dụ: { order_id: 8 }), lưu lại để chuyển hướng
        if (res && (res.order_id || res.data?.order_id)) {
          setRealOrderId(res.order_id || res.data.order_id);
        }
      } catch (err) {
        console.error("Lỗi xác nhận thanh toán:", err);
        setError('Không thể xác nhận thanh toán với hệ thống');
      } finally {
        setLoading(false);
      }
    };
    confirm();
  }, [orderId, isSuccess]);

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

  // Ưu tiên hiển thị ID thật từ DB, nếu không có thì hiển thị tạm mã từ URL
  const displayId = realOrderId || orderId;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={1} sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: 72 }}>{isSuccess && !error ? '✅' : '❌'}</Typography>
        <Typography variant="h4" fontWeight="bold" color={isSuccess && !error ? 'success.main' : 'error.main'} mt={2}>
          {isSuccess && !error ? 'Thanh toán VNPay thành công!' : (error || 'Thanh toán thất bại')}
        </Typography>
        <Box mt={4} display="flex" gap={2} justifyContent="center">
          <Button variant="contained" onClick={() => navigate(`/orders/${displayId}`)}>
            Xem đơn hàng #{displayId}
          </Button>
          <Button variant="outlined" component={Link} to="/products">
            Tiếp tục mua sắm
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VNPaySuccessPage;