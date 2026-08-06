import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Button, CircularProgress, Alert, Select, MenuItem,
  FormControl, InputLabel, IconButton, Divider,
  Stepper, Step, StepLabel,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as PlusIcon,
  Remove as MinusIcon,
  LocalShipping as ShippingIcon,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../auth/useAuth';


const ALLOWED_STATUSES = ['PLACED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELED', 'FAILED'];

const statusColors = {
  PLACED:     'primary',
  PAID:       'primary',
  PROCESSING: 'warning',
  SHIPPED:    'info',
  COMPLETED:  'success',
  CANCELED:   'error',
  FAILED:     'error',
};

// Chu trình vòng đời chuẩn của đơn hàng (Session 16 - NV1)
const STEP_FLOW   = ['PLACED', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'];
const STEP_LABELS = ['Đặt hàng', 'Thanh toán', 'Xử lý đơn', 'Đang giao', 'Hoàn tất'];



const OrderDetailPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAdmin }  = useAuth();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handleStatusChange = async (e) => {
    try {
      const updated = await ordersApi.adminUpdateStatus(order.id, e.target.value);
      setOrder(updated);
    } catch {
      alert('Cập nhật trạng thái thất bại');
    }
  };

  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) return;
    try {
      const updated = await ordersApi.adminUpdateItemQuantity(order.id, itemId, newQty);
      setOrder(updated);
    } catch {
      alert('Cập nhật số lượng thất bại');
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
  );

  if (error) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  if (!order) return null;

  const backUrl = isAdmin ? '/admin/orders' : '/orders';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<BackIcon />} onClick={() => navigate(backUrl)} sx={{ mb: 2, color: '#666' }}>
        Quay lại
      </Button>

      <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold">Đơn hàng #{order.id}</Typography>
            <Typography color="text.secondary" mt={0.5}>
              {new Date(order.created_at).toLocaleString('vi-VN')}
            </Typography>
          </Box>

          {/* Trạng thái – ADMIN có thể đổi */}
          {isAdmin ? (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select value={order.status} onChange={handleStatusChange} label="Trạng thái">
                {ALLOWED_STATUSES.map(st => (
                  <MenuItem key={st} value={st}>{st}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Chip
              label={order.status}
              color={statusColors[order.status] || 'default'}
              size="medium"
            />
          )}

          {!['PAID', 'CANCELED', 'COMPLETED', 'FAILED'].includes(order.status) && !isAdmin && (
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate(`/orders/${order.id}/payment`)}
            sx={{ ml: 2 }}
            >
            💳 Thanh toán ngay
          </Button>
          )}

        </Box>

        {/* Trạng thái vòng đời đơn hàng */}
        {order.status === 'CANCELED' || order.status === 'FAILED' ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {order.status === 'CANCELED' ? 'Đơn hàng đã bị hủy.' : 'Giao hàng thất bại.'}
          </Alert>
        ) : (
          <Stepper
            activeStep={Math.max(STEP_FLOW.indexOf(order.status), 0)}
            alternativeLabel
            sx={{ mb: 3 }}
          >
            {STEP_LABELS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        )}

        {/* Thông tin vận chuyển */}
        <Box sx={{ backgroundColor: '#fafafa', borderRadius: 1, p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <ShippingIcon fontSize="small" color="action" />
            {order.shipping_provider === 'GHN' && order.tracking_code ? (
              <Typography variant="body2">
                Mã vận đơn GHN:{' '}
                <a
                  href={`https://tracking.ghn.vn/?b=${order.tracking_code}`}
                  target="_blank" rel="noreferrer"
                >
                  {order.tracking_code}
                </a>
              </Typography>
            ) : (
              <Typography variant="body2">
                Đơn vị vận chuyển: Đội xe ShopHub
                {order.shipper_name ? ` — Shipper: ${order.shipper_name}` : ''}
              </Typography>
            )}
          </Box>

          {order.delivery_lat != null && order.delivery_lng != null && (
            <Box display="flex" alignItems="center" gap={1}>
              <PlaceIcon fontSize="small" color="action" />
              <a
                href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`}
                target="_blank" rel="noreferrer"
                style={{ fontSize: 14 }}
              >
                Xem vị trí giao hàng gần nhất trên bản đồ
              </a>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Items table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Đơn giá</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số lượng</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thành tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography fontWeight={500}>{item.product_name}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    {Number(item.product_price).toLocaleString('vi-VN')} ₫
                  </TableCell>
                  <TableCell align="center">
                    {/* ADMIN có nút tăng/giảm */}
                    {isAdmin ? (
                      <Box display="flex" alignItems="center" justifyContent="center"
                        border="1px solid #ddd" borderRadius={1} width="fit-content" mx="auto">
                        <IconButton size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}>
                          <MinusIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ px: 2, minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                          <PlusIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography>{item.quantity}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      {Number(item.line_total).toLocaleString('vi-VN')} ₫
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* Total */}
        <Box display="flex" justifyContent="flex-end">
          <Box textAlign="right">
            {order.shipping_fee > 0 && (
              <Typography color="text.secondary" mb={0.5}>
                Phí vận chuyển: {Number(order.shipping_fee).toLocaleString('vi-VN')} ₫
              </Typography>
            )}
            <Typography variant="h5" fontWeight="bold">
              Tổng cộng: {Number(order.total_amount).toLocaleString('vi-VN')} ₫
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderDetailPage;