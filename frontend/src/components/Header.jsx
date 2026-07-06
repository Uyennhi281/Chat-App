import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Badge,
  InputBase, Menu, MenuItem, Button
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  AccountCircle as UserIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { getUser, logout } from '../auth/token';

// Styled components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
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
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const Header = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const user = getUser();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
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
            gap: 1
          }}
        >
          🛒 ShopHub
        </Typography>

        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm sản phẩm..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* Cart */}
          <IconButton 
            color="inherit" 
            component={Link} 
            to="/cart"
            sx={{ position: 'relative' }}
          >
            <Badge badgeContent={cartCount} color="error">
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
              >
                {user.full_name}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Tài khoản</MenuItem>
                <MenuItem onClick={handleMenuClose}>Đơn hàng</MenuItem>
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
            >
              Đăng nhập
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;