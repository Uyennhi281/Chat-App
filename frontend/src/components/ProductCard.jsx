import { Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { AddShoppingCart as AddCartIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
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
          <Typography
            variant="h5"
            color="primary"
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            {product.price.toLocaleString('vi-VN')} ₫
          </Typography>

          <Button
            variant="contained"
            fullWidth
            startIcon={<AddCartIcon />}
            onClick={() => onAddToCart(product)}
            sx={{
              backgroundColor: '#ff6b00',
              '&:hover': { backgroundColor: '#e65100' },
            }}
          >
            Thêm vào giỏ
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;