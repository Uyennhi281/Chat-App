const Header = ({ title }) => {
  const navItems = ['Home', 'Products', 'Cart', 'Login'];
  const activeItem = 'Products';

  return (
    <header style={{ padding: '16px 24px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
      <h1 style={{ margin: 0, color: '#333' }}>{title}</h1>
      <nav>
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            style={{
              marginRight: '16px',
              textDecoration: 'none',
              // Nếu là mục active thì tô màu xanh và in đậm
              color: item === activeItem ? '#1976d2' : '#555',
              fontWeight: item === activeItem ? 'bold' : 'normal',
            }}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Header;