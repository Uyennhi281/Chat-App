import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Tooltip, TextField, InputAdornment,
  CircularProgress, Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { productsApi } from '../../api/productsApi';
import { PLACEHOLDER_SMALL } from '../../utils/placeholder';

const categoryColors = {
  phone:       'primary',
  laptop:      'secondary',
  tablet:      'success',
  accessories: 'warning',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
    } catch {
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Xóa thất bại. Kiểm tra quyền của bạn.');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Quản lý Sản phẩm
        </Typography>
        <Button
          variant="contained" startIcon={<AddIcon />}
          onClick={() => navigate('/admin/products/new')}
          sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
        >
          + Thêm mới
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth placeholder="Tìm kiếm sản phẩm..."
        value={search} onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2, backgroundColor: 'white', borderRadius: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell width={60}  sx={{ fontWeight: 'bold' }}>Mã</TableCell>
                <TableCell           sx={{ fontWeight: 'bold' }}>Tên sản phẩm</TableCell>
                <TableCell width={100} sx={{ fontWeight: 'bold' }}>Hình ảnh</TableCell>
                <TableCell width={130} sx={{ fontWeight: 'bold' }}>Giá</TableCell>
                <TableCell width={120} sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell width={200} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}
                  sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary"
                      sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      component="img"
                      src={product.imageUrl ? `http://localhost:8000${product.imageUrl}` : PLACEHOLDER_SMALL}

                      alt={product.name}
                      sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      onError={e => { e.target.src = PLACEHOLDER_SMALL; }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} color="primary">
                      {Number(product.price).toLocaleString('vi-VN')} ₫
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.category}
                      color={categoryColors[product.category] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <Tooltip title="Chi tiết">
                        <IconButton size="small" color="info"
                          onClick={() => navigate(`/products/${product.id}`)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa">
                        <IconButton size="small" color="warning"
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error"
                          onClick={() => handleDelete(product.id, product.name)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#999' }}>
                    Không tìm thấy sản phẩm nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminDashboard;