import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Badge,
  InputBase, Button, Menu, MenuItem, Container
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  AccountCircle as UserIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { getUser, logout } from '../auth/token';

import { useCart } from '../context/CartContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: { width: '30ch' },
  },
}));

const Header = ({ cartCount = 0, onSearch }) => {
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchValue);
    else if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue)}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navButtonStyle = (path) => ({
    color: 'white',
    mx: 0.5,
    textTransform: 'none',
    fontSize: '0.95rem',
    fontWeight: isActive(path) ? 600 : 400,
    borderBottom: isActive(path) ? '2px solid white' : 'none',
    borderRadius: 0,
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
  });

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1976d2' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mr: 3,
            }}
          >
            🛒 ShopHub
          </Typography>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
            <Button component={Link} to="/" sx={navButtonStyle('/')}>
              Trang chủ
            </Button>
            <Button component={Link} to="/products" sx={navButtonStyle('/products')}>
              Sản phẩm
            </Button>
            {user?.role === 'ADMIN' && (
              <Button component={Link} to="/admin" sx={navButtonStyle('/admin')}>
                Quản lý
              </Button>
            )}
          </Box>

          {/* Search Bar */}
          <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Tìm kiếm sản phẩm..."
                inputProps={{ 'aria-label': 'search' }}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Search>
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Cart */}
             <IconButton color="inherit" component={Link} to="/cart">
          <Badge badgeContent={totalQuantity} color="error">
            <CartIcon />
          </Badge>
        </IconButton>

            {/* User Menu */}
            {user ? (
              <>
                <Button
                  color="inherit"
                  onClick={handleMenuOpen}
                  startIcon={<UserIcon />}
                  sx={{ textTransform: 'none', ml: 1 }}
                >
                  {user.full_name}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleMenuClose}>Tài khoản</MenuItem>
                  {user.role === 'ADMIN' && (
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
                      Quản lý
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} sx={{ color: 'red' }}>
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                component={Link}
                to="/login"
                startIcon={<UserIcon />}
                sx={{ textTransform: 'none' }}
              >
                Đăng nhập
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;