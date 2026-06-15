const FeatureSection = () => {
  const features = [
    {
      title: 'Fast Delivery',
      description: 'Get your products delivered within 2–3 days.',
    },
    {
      title: 'Secure Payments',
      description: 'All transactions are protected with modern encryption.',
    },
    {
      title: 'Multiple Shops',
      description: 'Browse products from different shops in one place.',
    },
  ];

  return (
    <section style={{ padding: '40px 24px', textAlign: 'center' }}>
      <h2>Why ShopHub?</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
        {features.map((feature) => (
          <div key={feature.title} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>{feature.title}</h3>
            <p style={{ margin: 0, color: '#666' }}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;