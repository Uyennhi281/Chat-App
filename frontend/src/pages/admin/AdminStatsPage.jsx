import { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Grid,
  CircularProgress, Alert,
} from '@mui/material';
import {
  ShoppingCart as OrdersIcon,
  Paid as PaidIcon,
  AttachMoney as RevenueIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { ordersApi } from '../../api/ordersApi';

const PAID_STATUSES = ['PAID', 'COMPLETED'];

const STATUS_COLORS = {
  paid:     '#2e7d32',
  pending:  '#ed6c02',
  canceled: '#d32f2f',
};

const StatCard = ({ icon, label, value, color }) => (
  <Paper elevation={1} sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
    <Box sx={{
      width: 48, height: 48, borderRadius: 2, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: `${color}.light`, color: `${color}.main`,
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" fontWeight="bold">{value}</Typography>
    </Box>
  </Paper>
);

const AdminStatsPage = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersApi.getAllForAdmin();
        setOrders(data);
      } catch {
        setError('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthOrders = orders.filter((o) => {
      const created = new Date(o.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });

    const paidOrders     = monthOrders.filter((o) => PAID_STATUSES.includes(o.status));
    const canceledOrders = monthOrders.filter((o) => o.status === 'CANCELED');
    const pendingOrders  = monthOrders.filter((o) => !PAID_STATUSES.includes(o.status) && o.status !== 'CANCELED');
    const paidRevenue    = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    // Số đơn đặt theo từng ngày trong tháng
    const dailyCounts = Array(daysInMonth).fill(0);
    monthOrders.forEach((o) => {
      const day = new Date(o.created_at).getDate();
      dailyCounts[day - 1] += 1;
    });

    return {
      placedCount:  monthOrders.length,
      paidCount:    paidOrders.length,
      pendingCount: pendingOrders.length,
      canceledCount: canceledOrders.length,
      paidRevenue,
      dailyCounts,
      monthLabel: `${now.getMonth() + 1}/${now.getFullYear()}`,
    };
  }, [orders]);

  if (loading) {
    return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={0.5}>Thống kê Bán hàng</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Số liệu đơn hàng tháng {stats.monthLabel}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<OrdersIcon />}
            label="Đơn đã đặt trong tháng"
            value={stats.placedCount}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PaidIcon />}
            label="Đơn đã thanh toán"
            value={stats.paidCount}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PendingIcon />}
            label="Đơn chờ xử lý / chưa thanh toán"
            value={stats.pendingCount}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<RevenueIcon />}
            label="Doanh thu đã thanh toán"
            value={`${stats.paidRevenue.toLocaleString('vi-VN')} ₫`}
            color="info"
          />
        </Grid>
      </Grid>

      {stats.placedCount === 0 ? (
        <Paper elevation={0} sx={{ mt: 3, p: 4, textAlign: 'center', backgroundColor: '#fafafa' }}>
          <Typography color="text.secondary">
            Chưa có đơn hàng nào trong tháng {stats.monthLabel}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12} lg={5}>
            <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
              <Typography fontWeight="bold" fontSize={18} mb={2}>Tỷ lệ trạng thái đơn hàng</Typography>
              <PieChart
                series={[{
                  data: [
                    { id: 0, value: stats.paidCount,     label: 'Đã thanh toán', color: STATUS_COLORS.paid },
                    { id: 1, value: stats.pendingCount,   label: 'Chờ xử lý',     color: STATUS_COLORS.pending },
                    { id: 2, value: stats.canceledCount,  label: 'Đã hủy',        color: STATUS_COLORS.canceled },
                  ].filter((d) => d.value > 0),
                  innerRadius: 70,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  cx: 150,
                }]}
                height={400}
                slotProps={{ legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } } }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} lg={7}>
            <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
              <Typography fontWeight="bold" fontSize={18} mb={2}>Đơn đặt theo ngày trong tháng</Typography>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: stats.dailyCounts.map((_, i) => i + 1),
                  label: 'Ngày',
                }]}
                series={[{ data: stats.dailyCounts, label: 'Số đơn', color: '#1976d2' }]}
                height={400}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminStatsPage;
