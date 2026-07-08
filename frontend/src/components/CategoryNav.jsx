import { Box, Chip } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const categories = [
  { name: 'Tất cả', slug: '' },
  { name: 'Điện thoại', slug: 'phone' },
  { name: 'Laptop', slug: 'laptop' },
  { name: 'Tablet', slug: 'tablet' },
  { name: 'Phụ kiện', slug: 'accessories' },
];

const CategoryNav = ({ activeCategory = '' }) => {
  const location = useLocation();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        py: 2,
        px: 3,
        overflowX: 'auto',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug || 
          (!activeCategory && !cat.slug && location.pathname === '/products');
        
        return (
          <Chip
            key={cat.slug}
            label={cat.name}
            component={Link}
            to={cat.slug ? `/products?category=${cat.slug}` : '/products'}
            clickable
            color={isActive ? 'primary' : 'default'}
            variant={isActive ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 500,
              px: 1,
              '&:hover': {
                backgroundColor: isActive ? '#1976d2' : '#e3f2fd',
              },
            }}
          />
        );
      })}
    </Box>
  );
};

export default CategoryNav;