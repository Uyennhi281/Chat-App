import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Footer from './components/Footer';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// Theme chuyên nghiệp
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#ff6b00' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const HomePage = () => (
  <>
    <Banner subtitle="Welcome to our store" buttonText="Shop Now" buttonLink="/products" />
    <section
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        backgroundColor: '#fff',
        margin: '20px',
        borderRadius: '8px',
      }}
    >
      <h2>Welcome to ShopHub</h2>
      <p style={{ color: '#666', marginTop: '12px' }}>
        Use the navigation bar to browse products, manage your cart, and log in.
      </p>
    </section>
  </>
);

const CartPage = () => (
  <section
    style={{
      padding: '40px 24px',
      textAlign: 'center',
      backgroundColor: '#fff',
      margin: '20px',
      borderRadius: '8px',
    }}
  >
    <h2>Shopping Cart</h2>
    <p style={{ color: '#666', marginTop: '12px' }}>
      Cart functionality will be implemented in a later session.
    </p>
  </section>
);

const App = () => {
  const studentName = 'Nguyễn Cao Uyên Nhi';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: '#fafafa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header MUI mới - bỏ prop title */}
        <Header />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Xóa dòng trùng /login */}
            <Route
              path="*"
              element={
                <section style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>404 - Page not found</h2>
                </section>
              }
            />
          </Routes>
        </main>

        <Footer
          studentName={studentName}
          courseName="Full-Stack Web Development"
          semester="Summer 2026"
        />
      </div>
    </ThemeProvider>
  );
};

export default App;