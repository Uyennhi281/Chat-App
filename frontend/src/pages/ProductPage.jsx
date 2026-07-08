import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Grid, Container, Typography, Box, Button, TextField,
  InputAdornment, Chip, CircularProgress, Alert, Paper,
  FormControl, InputLabel, Select, MenuItem, Pagination,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { productsApi } from '../api/productsApi';
import { useAuth } from '../auth/useAuth';
import ProductCard from '../components/ProductCard';
import CategoryNav from '../components/CategoryNav';

const sortOptions = [
  { value: 'name', label: 'Tên A-Z' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

const ProductPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll({ category });
      setProducts(data);
    } catch {
      setError('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
    }
  };

  const handleAddToCart = (product) => {
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Xóa thất bại');
    }
  };

  // Filter and sort
  let filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
      <CategoryNav activeCategory={category} />

      <Container maxWidth="xl" sx={{ pt: 3 }}>
        {/* Header Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Sản phẩm
              </Typography>
              <Typography color="text.secondary">
                {filtered.length} sản phẩm được tìm thấy
              </Typography>
            </Box>

            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/products/new')}
                sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
              >
                Thêm sản phẩm
              </Button>
            )}
          </Box>

          {/* Filter Bar */}
          <Box display="flex" gap={2} mt={3} flexWrap="wrap">
            <TextField
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              size="small"
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sắp xếp">
                {sortOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {category && (
              <Chip 
                label={`Category: ${category}`} 
                onDelete={() => { setCategory(''); navigate('/products'); }}
                color="primary"
              />
            )}
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginated.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onDelete={isAdmin ? handleDelete : null}
                  />
                </Grid>
              ))}
            </Grid>

            {filtered.length === 0 && (
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                  Không tìm thấy sản phẩm nào
                </Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Stack alignItems="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, v) => setPage(v)}
                  color="primary"
                  size="large"
                />
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ProductPage;