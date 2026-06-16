import Header from './components/Header';
import Banner from './components/Banner';
import ProductList from './components/ProductList';
import Footer from './components/Footer';

const App = () => {
  const studentName = 'Nguyễn Cao Uyên Nhi'; 

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#fafafa' }}>
      <Header title="ShopHub" />
      <Banner subtitle="Welcome to our store" buttonText="Shop Now" />
      
      {/* Danh sách sản phẩm lấy từ API thực tế nằm ở đây */}
      <ProductList />
      
      <Footer
        studentName={studentName}
        courseName="Full-Stack Web Development"
        semester="Summer 2026"
      />
    </div>
  );
};

export default App;