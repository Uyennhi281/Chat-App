import { Box, ButtonBase, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  Apps as AllIcon,
  PhoneIphone as PhoneIcon,
  LaptopMac as LaptopIcon,
  TabletMac as TabletIcon,
  Headset as AccessoriesIcon,
} from '@mui/icons-material';

export const categories = [
  { name: 'Tất cả',      slug: '',             icon: AllIcon,         color: '#424242' },
  { name: 'Điện thoại',  slug: 'phone',        icon: PhoneIcon,       color: '#1976d2' },
  { name: 'Laptop',      slug: 'laptop',       icon: LaptopIcon,      color: '#9c27b0' },
  { name: 'Tablet',      slug: 'tablet',       icon: TabletIcon,      color: '#2e7d32' },
  { name: 'Phụ kiện',    slug: 'accessories',  icon: AccessoriesIcon, color: '#ed6c02' },
];

export const categoryLabel = (slug) =>
  categories.find((c) => c.slug === slug)?.name || slug;

const CategoryNav = ({ activeCategory = '' }) => {
  const location = useLocation();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 2, sm: 4 },
        py: 2.5,
        px: 3,
        overflowX: 'auto',
        justifyContent: { xs: 'flex-start', sm: 'center' },
        backgroundColor: 'white',
        borderBottom: '1px solid #eee',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug ||
          (!activeCategory && !cat.slug && location.pathname === '/products');
        const Icon = cat.icon;

        return (
          <ButtonBase
            key={cat.slug}
            component={Link}
            to={cat.slug ? `/products?category=${cat.slug}` : '/products'}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              flexShrink: 0,
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? cat.color : '#f5f5f5',
                color: isActive ? '#fff' : cat.color,
                border: isActive ? 'none' : `1px solid ${cat.color}33`,
                boxShadow: isActive ? `0 4px 12px ${cat.color}55` : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon fontSize="medium" />
            </Box>
            <Typography
              fontSize={13}
              fontWeight={isActive ? 700 : 500}
              color={isActive ? cat.color : 'text.secondary'}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {cat.name}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
};

export default CategoryNav;
