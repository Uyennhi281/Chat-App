import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Footer from './components/Footer';

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

const LoginPage = () => (
  <section
    style={{
      padding: '40px 24px',
      textAlign: 'center',
      backgroundColor: '#fff',
      margin: '40px auto',
      borderRadius: '8px',
      maxWidth: '400px',
    }}
  >
    <h2>Login</h2>
    <input
      type="text"
      placeholder="Username / Email"
      style={{
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        boxSizing: 'border-box',
      }}
    />
    <input
      type="password"
      placeholder="Password"
      style={{
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        boxSizing: 'border-box',
      }}
    />
    <button
      style={{
        width: '100%',
        padding: '10px',
        backgroundColor: '#1976d2',
        color: '#fff',
        border: 'none',
        marginTop: '10px',
      }}
    >
      Login
    </button>
  </section>
);

const App = () => {
  const studentName = 'Nguyễn Cao Uyên Nhi';

  return (
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
      <Header title="ShopHub" />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
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
  );
};

export default App;