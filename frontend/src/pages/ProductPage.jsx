import { useState, useEffect } from 'react';
import { Grid, Container, Typography, Box, CircularProgress } from '@mui/material';
import { productsApi } from '../api/productsApi';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import CategoryNav from '../components/CategoryNav';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      setError('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // TODO: Thêm vào giỏ hàng (Session 10)
    setCartCount(prev => prev + 1);
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Header cartCount={cartCount} />
      <CategoryNav />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Sản phẩm nổi bật
        </Typography>

        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ProductPage;