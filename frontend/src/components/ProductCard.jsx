import React from 'react';
import { Card, Typography, Button, Box } from '@mui/material';
import { AddShoppingCart as AddCartIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/useAuth';

// Placeholder base64 để tránh lỗi external
const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const ProductCard = ({ product, onDelete }) => {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Thêm domain backend vào URL
  const imageUrl = product.imageUrl
    ? `http://localhost:8000${product.imageUrl}`
    : PLACEHOLDER;

  // Xử lý chuyển trang khi click vào thẻ
  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  // Ngăn chặn sự kiện click lan ra ngoài (chuyển trang) khi bấm nút
  const handleAddToCart = (e) => {
    e.stopPropagation(); 
    addToCart(product, 1);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(product.id);
  };

  return (
    <Card 
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '2px', // Bo góc siêu nhỏ chuẩn sàn TMĐT
        border: '1px solid #f0f0f0',
        boxShadow: 'none',
        cursor: 'pointer',
        transition: 'transform 0.1s, box-shadow 0.1s',
        '&:hover': { 
          transform: 'translateY(-2px)', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
        },
      }}
    >
      {/* 1. KHUNG ẢNH VUÔNG VỨC */}
      <Box sx={{ width: '100%', paddingTop: '100%', position: 'relative', backgroundColor: '#f8f9fa' }}>
        <Box
          component="img"
          src={imageUrl}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          alt={product.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Badge "Mall" hoặc "Giảm giá" góc trên */}
        <Box sx={{ 
          position: 'absolute', top: 4, left: -4, 
          backgroundColor: '#0f08c4', color: '#fff', 
          fontSize: '0.7rem', fontWeight: 'bold', 
          px: 1, py: 0.2, borderRadius: '0 2px 2px 0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>
          Yêu thích
        </Box>
      </Box>

      {/* 2. KHUNG NỘI DUNG SIÊU GỌN */}
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        {/* Tên sản phẩm (Tối đa 2 dòng) */}
        <Typography
          sx={{
            color: '#222',
            fontSize: '0.85rem',
            lineHeight: '1.2rem',
            height: '2.4rem', // Cố định chiều cao 2 dòng
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Typography>

        {/* Mochi-chan đã ẩn phần mô tả (description) đi để thẻ không bị dài thoòng lõng nha! */}

        {/* Khu vực Giá & Đã bán */}
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ color: '#0f08c4', fontSize: '1rem', fontWeight: 500 }}>
            <Typography component="span" sx={{ fontSize: '0.75rem', mr: '2px', textDecoration: 'underline' }}>đ</Typography>
            {Number(product.price).toLocaleString('vi-VN')}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#757575' }}>
            Đã bán 1,2k
          </Typography>
        </Box>

        {/* 3. NÚT BẤM TINH TẾ */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={handleAddToCart}
            startIcon={<AddCartIcon sx={{ fontSize: '1rem' }} />}
            sx={{
              borderColor: '#0f08c4',
              color: '#0f08c4',
              textTransform: 'none',
              fontSize: '0.75rem',
              p: '4px',
              borderRadius: '2px',
              '&:hover': { backgroundColor: '#fff5f5', borderColor: '#0f08c4' }
            }}
          >
            Thêm
          </Button>

          {isAdmin && (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleDelete}
              sx={{ minWidth: '36px', p: '4px', borderRadius: '2px', boxShadow: 'none' }}
            >
              <DeleteIcon fontSize="small" />
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default ProductCard;