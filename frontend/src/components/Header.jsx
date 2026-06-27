import { NavLink } from 'react-router-dom';

const Header = ({ title }) => {
  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'Cart', to: '/cart' },
    { label: 'Login', to: '/login' },
  ];

  const linkStyle = ({ isActive }) => ({
    marginRight: '16px',
    textDecoration: 'none',
    color: isActive ? '#1976d2' : '#555',
    fontWeight: isActive ? 'bold' : 'normal',
    padding: '8px 12px',
    borderRadius: '4px',
    backgroundColor: isActive ? '#e3f2fd' : 'transparent',
  });

  return (
    <header style={{ padding: '16px 24px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
      <h1 style={{ margin: 0, color: '#333' }}>{title}</h1>
      <nav>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} style={linkStyle}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Header;