import { Box, Chip } from '@mui/material';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Tất cả', slug: '' },
  { name: 'Điện thoại', slug: 'phone' },
  { name: 'Laptop', slug: 'laptop' },
  { name: 'Tablet', slug: 'tablet' },
  { name: 'Phụ kiện', slug: 'accessories' },
];

const CategoryNav = ({ activeCategory = '' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        py: 2,
        px: 3,
        overflowX: 'auto',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
      }}
    >
      {categories.map((cat) => (
        <Chip
          key={cat.slug}
          label={cat.name}
          component={Link}
          to={cat.slug ? `/products?category=${cat.slug}` : '/products'}
          clickable
          color={activeCategory === cat.slug ? 'primary' : 'default'}
          variant={activeCategory === cat.slug ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#1976d2',
              color: 'white',
            },
          }}
        />
      ))}
    </Box>
  );
};

export default CategoryNav;