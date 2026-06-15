const PrimaryButton = ({ label }) => {
  return (
    <button style={{ backgroundColor: '#1976d2', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
      {label}
    </button>
  );
};

// Component Banner chính
const Banner = ({ subtitle, buttonText }) => {
  return (
    <section style={{ padding: '40px 24px', backgroundColor: '#f5f5f5', textAlign: 'left' }}>
      <h2>{subtitle}</h2>
      <p>Discover our latest products and special offers.</p>
      <PrimaryButton label={buttonText} />
    </section>
  );
};

export default Banner;