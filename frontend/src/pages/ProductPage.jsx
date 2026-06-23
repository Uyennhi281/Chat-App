import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductList from '../components/ProductList';

const ProductPage = () => {
  // Định nghĩa các state quản lý dữ liệu và bộ lọc theo giáo trình
  const [products, setProducts] = useState([]);           // Dữ liệu thô ban đầu
  const [filteredProducts, setFilteredProducts] = useState([]);  // Dữ liệu sau khi tìm kiếm/lọc/sắp xếp
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('none');   // 'none' | 'price-asc' | 'price-desc'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy dữ liệu từ FakeStoreAPI và map lại thuộc tính cho đúng cấu trúc
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('https://fakestoreapi.com/products');
        const data = res.data;

        // Đổi các trường dữ liệu API về đúng model hệ thống
        const mapped = data.map((item) => ({
          id: item.id,
          name: item.title,
          price: item.price,
          category: item.category,
          imageUrl: item.image,
          description: item.description,
        }));

        setProducts(mapped);
        setFilteredProducts(mapped);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Tự động chạy lại bộ lọc mỗi khi người dùng gõ tìm kiếm, đổi danh mục hoặc đổi cách sắp xếp
  useEffect(() => {
    let updated = [...products];

    // 1) Logic Tìm kiếm (Không phân biệt chữ hoa chữ thường)
    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      updated = updated.filter((p) =>
        p.name.toLowerCase().includes(lower)
      );
    }

    // 2) Logic Lọc theo danh mục
    if (selectedCategory !== 'All') {
      updated = updated.filter((p) => p.category === selectedCategory);
    }

    // 3) Logic Sắp xếp giá cả
    if (sortOption === 'price-asc') {
      updated.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      updated.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updated);
  }, [searchTerm, selectedCategory, sortOption, products]);

  // Tự động gom các danh mục độc nhất (Unique Categories) từ dữ liệu sản phẩm trả về
  const categories = [
    'All',
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  if (loading) {
    return <p style={{ padding: '24px', textAlign: 'center' }}>🔄 Loading products...</p>;
  }

  if (error) {
    return <p style={{ padding: '24px', color: 'red', textAlign: 'center' }}>{error}</p>;
  }

  return (
    <section style={{ padding: '24px' }}>
      <h2>Product Catalog</h2>
      <p style={{ color: '#666' }}>Search, filter, and sort products dynamically.</p>

      {/* Thanh công cụ chứa các bộ lọc (Filter Bar) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '16px',
          marginBottom: '16px',
        }}
      >
        {/* Ô nhập Tìm kiếm */}
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', minWidth: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        {/* Dropdown chọn Danh mục */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Dropdown Sắp xếp giá */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          <option value="none">Sort by price (none)</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>

        {/* Nút Xóa bộ lọc (Clear Filters) */}
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('All');
            setSortOption('none');
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: '#eeeeee',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Dòng chữ hiển thị số lượng kết quả tìm thấy */}
      <p style={{ marginBottom: '16px', color: '#555', fontStyle: 'italic' }}>
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Truyền mảng đã lọc xuống danh sách hiển thị */}
      <ProductList products={filteredProducts} />
    </section>
  );
};

export default ProductPage;