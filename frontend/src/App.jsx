import Header from './components/Header';
import Banner from './components/Banner';
import FeatureSection from './components/FeatureSection';
import Footer from './components/Footer';

const App = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <Header title="ShopHub" />
      <Banner subtitle="Welcome to our store" buttonText="Shop Now" />
      <FeatureSection />
      <Footer
        studentName="Nguyễn Cao Uyên Nhi"
        courseName="Full-Stack Web Development"
        semester="Summer 2026"
      />
    </div>
  );
};

export default App;