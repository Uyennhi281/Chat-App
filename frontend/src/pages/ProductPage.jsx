import { useEffect, useState } from 'react';
import { productsApi } from '../api/productsApi';
import ProductList from '../components/ProductList';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await productsApi.getAll();
        
        // Backend Session 6 trả về object có field 'items', nên tụi mình lặp qua data.items nha
        const mapped = data.items.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          description: p.description,
          imageUrl: p.imageUrl,
        }));
        setProducts(mapped);
      } catch (err) {
        setError('Could not load products from API.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts =
    searchTerm.trim() === ''
      ? products
      : products.filter((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  if (loading) return <p style={{ padding: '24px' }}>Loading products...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;

  return (
    <section style={{ padding: '24px' }}>
      <h2>Product Catalog</h2>
      <p>Data is loaded from the backend API via productsApi.</p>

      <div style={{ margin: '16px 0' }}>
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', minWidth: '220px' }}
        />
      </div>

      <p style={{ marginBottom: '8px', color: '#555' }}>
        Showing {filteredProducts.length} of {products.length} products
      </p>

      <ProductList products={filteredProducts} />
    </section>
  );
};

export default ProductPage;