import ProductCard from './ProductCard';

const ProductList = ({ products }) => {
  // Nếu bộ lọc không tìm ra sản phẩm nào thì hiển thị thông báo
  if (products.length === 0) {
    return <p style={{ padding: '20px 0', color: '#777' }}>No products found for the selected filters.</p>;
  }

  return (
    <div
      style={{
        marginTop: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center'
      }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          category={product.category}
          imageUrl={product.imageUrl}
          description={product.description}
        />
      ))}
    </div>
  );
};

export default ProductList;