import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Banner from './components/Banner';
import Footer from './components/Footer';
import ProductPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminRoute from './routes/AdminRoute';
import ProductCreatePage from './pages/admin/ProductCreatePage';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#ff6b00' },
    background: { default: '#f5f5f5' },
  },
});

const HomePage = () => (
  <>
    <Banner subtitle="Welcome to our store" buttonText="Shop Now" buttonLink="/products" />
    <section style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: '#fff', margin: '20px', borderRadius: '8px' }}>
      <h2>Welcome to ShopHub</h2>
      <p style={{ color: '#666', marginTop: '12px' }}>
        Browse our products, add to cart, and enjoy shopping!
      </p>
    </section>
  </>
);

const CartPage = () => (
  <section style={{ padding: '40px 24px', textAlign: 'center' }}>
    <h2>Shopping Cart</h2>
    <p style={{ color: '#666' }}>Cart sẽ được làm ở session tiếp theo.</p>
  </section>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public routes */}
            <Route path="/"          element={<HomePage />} />
            <Route path="/products"  element={<ProductPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart"      element={<CartPage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/products/new" element={<ProductCreatePage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <section style={{ padding: '60px', textAlign: 'center' }}>
                <h2>404 - Không tìm thấy trang</h2>
              </section>
            } />
          </Routes>
        </main>
        <Footer studentName="Nguyễn Cao Uyên Nhi" courseName="Full-Stack Web Development" semester="Summer 2026" />
      </div>
    </ThemeProvider>
  );
};

export default App;