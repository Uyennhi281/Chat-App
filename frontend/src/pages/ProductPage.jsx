import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container, Typography, Box, Button, TextField,
  InputAdornment, Chip, CircularProgress, Alert, Paper,
  Pagination, Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { productsApi } from '../api/productsApi';
import { useAuth } from '../auth/useAuth';
import ProductCard from '../components/ProductCard';
import CategoryNav, { categoryLabel } from '../components/CategoryNav';

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
  const itemsPerPage = 10; // Đổi thành 10 để chia 5 cột cho đẹp (2 hàng)

  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setSearch(searchParams.get('search') || '');
    setPage(1);
  }, [searchParams]);

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

  // Lọc và sắp xếp
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
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', pb: 6 }}>
      
      <CategoryNav activeCategory={category} />

      <Container maxWidth="xl" sx={{ pt: 3 }}>
        
        {/* THANH TÌM KIẾM VÀ NÚT THÊM SẢN PHẨM Ở TRÊN CÙNG */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
          <Paper elevation={0} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, borderRadius: '2px' }}>
            <TextField
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              fullWidth
              size="small"
              variant="outlined"
              sx={{ '& fieldset': { border: 'none' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/products/new')}
              sx={{ backgroundColor: '#0f08c4', '&:hover': { backgroundColor: '#d73d1f' }, borderRadius: '2px' }}
            >
              Thêm sản phẩm
            </Button>
          )}
        </Box>

        {/* KẾT QUẢ SẢN PHẨM (Chiếm trọn bề ngang) */}
        <Box sx={{ width: '100%' }}>
          
          {/* Thanh Sắp Xếp ngang */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, backgroundColor: '#ededed', borderRadius: '2px' }}>
            <Typography variant="body2" color="text.secondary">Sắp xếp theo</Typography>
            
            <Button 
              variant={sortBy === 'name' ? 'contained' : 'outlined'} 
              onClick={() => setSortBy('name')}
              sx={{ 
                bgcolor: sortBy === 'name' ? '#0f08c4' : 'white',
                color: sortBy === 'name' ? 'white' : 'black',
                borderColor: '#ddd',
                textTransform: 'none',
                borderRadius: '2px',
                '&:hover': { borderColor: '#0f08c4', bgcolor: sortBy === 'name' ? '#d73d1f' : 'white' }
              }}
            >
              Tên A-Z
            </Button>
            
            <Button 
              variant={sortBy === 'price_asc' ? 'contained' : 'outlined'} 
              onClick={() => setSortBy('price_asc')}
              sx={{ 
                bgcolor: sortBy === 'price_asc' ? '#0f08c4' : 'white',
                color: sortBy === 'price_asc' ? 'white' : 'black',
                borderColor: '#ddd',
                textTransform: 'none',
                borderRadius: '2px',
                '&:hover': { borderColor: '#0f08c4', bgcolor: sortBy === 'price_asc' ? '#d73d1f' : 'white' }
              }}
            >
              Giá Thấp - Cao
            </Button>

            <Button 
              variant={sortBy === 'price_desc' ? 'contained' : 'outlined'} 
              onClick={() => setSortBy('price_desc')}
              sx={{ 
                bgcolor: sortBy === 'price_desc' ? '#0f08c4' : 'white',
                color: sortBy === 'price_desc' ? 'white' : 'black',
                borderColor: '#ddd',
                textTransform: 'none',
                borderRadius: '2px',
                '&:hover': { borderColor: '#0f08c4', bgcolor: sortBy === 'price_desc' ? '#d73d1f' : 'white' }
              }}
            >
              Giá Cao - Thấp
            </Button>

            <Box sx={{ flexGrow: 1 }} />
            
            {/* Phân trang nhỏ */}
            <Typography variant="body2">
              <span style={{ color: '#0f08c4' }}>{page}</span> / {totalPages || 1}
            </Typography>
          </Paper>

          {/* Hiển thị Chip báo hiệu đang lọc */}
          {(category || search) && (
            <Box mb={2} display="flex" gap={1}>
              {category && <Chip label={`Danh mục: ${categoryLabel(category)}`} onDelete={() => { setCategory(''); navigate('/products'); }} size="small" />}
              {search && <Chip label={`Từ khóa: ${search}`} onDelete={() => { setSearch(''); navigate('/products'); }} size="small" />}
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* LƯỚI SẢN PHẨM: CSS Grid 5 cột siêu đều */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: '#0f08c4' }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Paper elevation={0} sx={{ textAlign: 'center', py: 10, borderRadius: '2px' }}>
              <Typography variant="h6" color="text.secondary">Không tìm thấy sản phẩm nào khớp với tìm kiếm của bạn.</Typography>
            </Paper>
          ) : (
            <>
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' }, 
                  gap: '10px' 
                }}
              >
                {paginated.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onDelete={isAdmin ? handleDelete : null}
                  />
                ))}
              </Box>

              {totalPages > 1 && (
                <Stack alignItems="center" mt={5}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, v) => setPage(v)}
                    sx={{
                      '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: '#0f08c4',
                        color: '#fff',
                      }
                    }}
                  />
                </Stack>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ProductPage;