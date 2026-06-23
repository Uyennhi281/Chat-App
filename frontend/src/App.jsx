import Header from './components/Header';
import Banner from './components/Banner';
import ProductPage from './pages/ProductPage';
import Footer from './components/Footer';

const App = () => {
  const studentName = 'Nguyễn Cao Uyên Nhi'; 

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#fafafa' }}>
      <Header title="ShopHub" />
      <Banner subtitle="Welcome to our store" buttonText="Shop Now" />
      
      {/* Trang Catalog tích hợp tính năng Tìm kiếm - Lọc - Sắp xếp */}
      <ProductPage />
      
      <Footer
        studentName={studentName}
        courseName="Full-Stack Web Development"
        semester="Summer 2026"
      />
    </div>
  );
};

export default App;