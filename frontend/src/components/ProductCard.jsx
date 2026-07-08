import { Card, CardMedia, CardContent, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import {
  AddShoppingCart as AddCartIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/useAuth';

const ProductCard = ({ product, onDelete }) => {
  const { addToCart } = useCart();
  const { isAdmin }   = useAuth();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardMedia
        component={Link}
        to={`/products/${product.id}`}
        image={product.imageUrl || 'https://via.placeholder.com/300x200'}
        sx={{
          height: 200,
          backgroundSize: 'contain',
          backgroundColor: '#f5f5f5',
          cursor: 'pointer',
        }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          component={Link}
          to={`/products/${product.id}`}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontSize: '1rem',
            fontWeight: 600,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '3em',
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.description}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
            {Number(product.price).toLocaleString('vi-VN')} ₫
          </Typography>

          <Button
            variant="contained"
            fullWidth
            startIcon={<AddCartIcon />}
            onClick={handleAddToCart}
            sx={{
              backgroundColor: '#ff6b00',
              '&:hover': { backgroundColor: '#e65100' },
              mb: isAdmin ? 1 : 0,
            }}
          >
            Thêm vào giỏ
          </Button>

          {isAdmin && (
            <Button
              variant="outlined"
              fullWidth
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete?.(product.id)}
            >
              Xóa
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;