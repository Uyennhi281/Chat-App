import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button,
  CircularProgress, Alert,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { ordersApi } from '../../api/ordersApi';

const statusColors = {
  PLACED: 'primary', PROCESSING: 'warning',
  SHIPPED: 'info', COMPLETED: 'success', CANCELED: 'error',
};

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersApi.getAllForAdmin();
        setOrders(data);
      } catch {
        setError('Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>Quản lý Đơn hàng</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Mã đơn</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ngày đặt</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                  <TableCell><Typography fontWeight={600}>#{order.id}</Typography></TableCell>
                  <TableCell>
                    <Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600} color="primary">
                      {Number(order.total_amount).toLocaleString('vi-VN')} ₫
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleString('vi-VN')}</TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined" startIcon={<ViewIcon />}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}>
                      Quản lý
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#999' }}>
                    Chưa có đơn hàng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminOrdersPage;