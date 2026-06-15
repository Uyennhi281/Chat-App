const Header = ({ title }) => {
  const navItems = ['Home', 'Products', 'Cart', 'Login'];

  return (
    <header style={{ padding: '16px 24px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <nav>
        {navItems.map((item) => (
          <a key={item} href="#" style={{ marginLeft: '16px', textDecoration: 'none', color: '#1976d2' }}>
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Header;