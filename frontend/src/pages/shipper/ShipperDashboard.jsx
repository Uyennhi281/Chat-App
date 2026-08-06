import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Button,
  Chip, CircularProgress, Alert, Stack, Tabs, Tab, Divider,
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  MyLocation as LocationIcon,
} from '@mui/icons-material';
import { ordersApi } from '../../api/ordersApi';
import { getUser, logout } from '../../auth/token';
import { useNavigate } from 'react-router-dom';

// HTML5 Geolocation - trả về {} nếu thiết bị không hỗ trợ hoặc người dùng từ chối
const getCurrentLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) { resolve({}); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({}),
      { timeout: 6000 },
    );
  });

const ShipperDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [tab, setTab] = useState(0);
  const [available, setAvailable] = useState([]);
  const [myOrders, setMyOrders]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [actingId, setActingId]   = useState(null);

  const fetchAll = async () => {
    try {
      const [avail, mine] = await Promise.all([
        ordersApi.getShipperAvailable(),
        ordersApi.getShipperMy(),
      ]);
      setAvailable(avail);
      setMyOrders(mine);
    } catch {
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Đăng ký Service Worker để trang này cài đặt được như PWA trên điện thoại Shipper
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const handleClaim = async (orderId) => {
    setActingId(orderId);
    try {
      const location = await getCurrentLocation();
      await ordersApi.claimOrder(orderId, location);
      await fetchAll();
    } catch {
      alert('Nhận đơn thất bại. Có thể đơn đã được Shipper khác nhận.');
    } finally {
      setActingId(null);
    }
  };

  const handleDeliver = async (orderId, success) => {
    if (!window.confirm(success ? 'Xác nhận đã giao hàng thành công?' : 'Xác nhận giao hàng thất bại?')) return;
    setActingId(orderId);
    try {
      const location = await getCurrentLocation();
      await ordersApi.deliverOrder(orderId, success, location);
      await fetchAll();
    } catch {
      alert('Cập nhật thất bại');
    } finally {
      setActingId(null);
    }
  };

  const activeDeliveries = myOrders.filter((o) => o.status === 'SHIPPED');
  const history = myOrders.filter((o) => o.status !== 'SHIPPED');

  if (loading) return (
    <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
  );

  return (
    <Container maxWidth="sm" sx={{ py: 3, minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold">🛵 Shipper</Typography>
          <Typography variant="body2" color="text.secondary">{user?.full_name}</Typography>
        </Box>
        <Button size="small" onClick={() => { logout(); navigate('/login'); }}>Đăng xuất</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
        <Tab label={`Đơn chờ nhận (${available.length})`} />
        <Tab label={`Đang giao (${activeDeliveries.length})`} />
        <Tab label="Lịch sử" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          {available.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Chưa có đơn nào cần giao.
            </Typography>
          )}
          {available.map((order) => (
            <Card key={order.id} elevation={1}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography fontWeight={700}>Đơn #{order.id}</Typography>
                  <Chip label="Chờ nhận" size="small" color="warning" />
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {new Date(order.created_at).toLocaleString('vi-VN')}
                </Typography>
                <Typography fontWeight={600} color="primary" mb={2}>
                  {Number(order.total_amount).toLocaleString('vi-VN')} ₫
                </Typography>
                <Button
                  fullWidth variant="contained" startIcon={<TruckIcon />}
                  disabled={actingId === order.id}
                  onClick={() => handleClaim(order.id)}
                >
                  {actingId === order.id ? 'Đang xử lý...' : 'Nhận giao đơn'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          {activeDeliveries.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Bạn chưa nhận đơn nào.
            </Typography>
          )}
          {activeDeliveries.map((order) => (
            <Card key={order.id} elevation={1}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography fontWeight={700}>Đơn #{order.id}</Typography>
                  <Chip label="Đang giao" size="small" color="info" icon={<LocationIcon />} />
                </Box>
                <Typography fontWeight={600} color="primary" mb={2}>
                  {Number(order.total_amount).toLocaleString('vi-VN')} ₫
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth variant="contained" color="success" startIcon={<CheckIcon />}
                    disabled={actingId === order.id}
                    onClick={() => handleDeliver(order.id, true)}
                  >
                    Giao thành công
                  </Button>
                  <Button
                    fullWidth variant="outlined" color="error" startIcon={<CancelIcon />}
                    disabled={actingId === order.id}
                    onClick={() => handleDeliver(order.id, false)}
                  >
                    Thất bại
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={1.5}>
          {history.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Chưa có lịch sử giao hàng.
            </Typography>
          )}
          {history.map((order) => (
            <Box key={order.id}>
              <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Typography>Đơn #{order.id}</Typography>
                <Chip
                  label={order.status === 'COMPLETED' ? 'Đã giao' : 'Thất bại'}
                  size="small"
                  color={order.status === 'COMPLETED' ? 'success' : 'error'}
                />
              </Box>
              <Divider />
            </Box>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default ShipperDashboard;
