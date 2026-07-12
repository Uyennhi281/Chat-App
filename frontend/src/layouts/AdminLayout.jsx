import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import {
  Box, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider,
  AppBar, Toolbar, InputBase, Avatar, Button, Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductIcon,
  People as UserIcon,
  BarChart as StatsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  ExpandLess, ExpandMore,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { logout, getUser } from '../auth/token';

const SIDEBAR_WIDTH = 220;

const AdminLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = getUser();
  const [openManage, setOpenManage] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItemStyle = (path) => ({
    borderRadius: '8px',
    mx: 1,
    mb: 0.5,
    backgroundColor: isActive(path) ? 'rgba(255,255,255,0.2)' : 'transparent',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
    color: 'white',
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            backgroundColor: '#3f51b5',
            color: 'white',
            border: 'none',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: 'white', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography sx={{ color: '#3f51b5', fontWeight: 'bold', fontSize: 16 }}>S</Typography>
          </Box>
          <Typography fontWeight="bold" fontSize={16} letterSpacing={0.5}>
            SHOPHUB
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        <List sx={{ mt: 1, flex: 1 }}>
          {/* Thống kê */}
          <Typography sx={{ px: 2.5, py: 1, fontSize: 11, opacity: 0.6, fontWeight: 600, letterSpacing: 1 }}>
            THỐNG KÊ
          </Typography>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/admin" sx={menuItemStyle('/admin')}>
              <ListItemIcon sx={{ minWidth: 36, color: 'white' }}><StatsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Thống kê" primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />

          {/* Quản lý */}
          <Typography sx={{ px: 2.5, py: 1, fontSize: 11, opacity: 0.6, fontWeight: 600, letterSpacing: 1 }}>
            QUẢN LÝ
          </Typography>

          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenManage(!openManage)}
              sx={{ borderRadius: '8px', mx: 1, color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'white' }}><SettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Quản lý" primaryTypographyProps={{ fontSize: 14 }} />
              {openManage ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={openManage} timeout="auto">
            <List disablePadding sx={{ pl: 1 }}>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin/products"
                  sx={menuItemStyle('/admin/products')}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'white' }}><ProductIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Sản phẩm" primaryTypographyProps={{ fontSize: 13 }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin/users"
                  sx={menuItemStyle('/admin/users')}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'white' }}><UserIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Người dùng" primaryTypographyProps={{ fontSize: 13 }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin/orders"
                  sx={menuItemStyle('/admin/orders')}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'white' }}>
                    <ShoppingCartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Đơn hàng" primaryTypographyProps={{ fontSize: 13 }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        </List>

        {/* Logout */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ color: 'white', justifyContent: 'flex-start',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* ── Main Content ────────────────────────────── */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top AppBar */}
        <AppBar position="static" elevation={1}
          sx={{ backgroundColor: 'white', color: '#333' }}>
          <Toolbar sx={{ gap: 2 }}>
            {/* Search */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              backgroundColor: '#f5f5f5', borderRadius: 1, px: 2, py: 0.5, flex: 1,
            }}>
              <SearchIcon fontSize="small" sx={{ color: '#999' }} />
              <InputBase placeholder="Search for..." fullWidth sx={{ fontSize: 14 }} />
            </Box>
            {/* User */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, backgroundColor: '#3f51b5', fontSize: 14 }}>
                {user?.full_name?.[0] || 'A'}
              </Avatar>
              <Typography fontSize={14} fontWeight={500}>
                {user?.full_name || 'Admin'}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flex: 1, backgroundColor: '#f0f2f5', p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;