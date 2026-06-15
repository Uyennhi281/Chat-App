const Footer = ({ studentName, courseName, semester }) => {
  const year = new Date().getFullYear();

  return (
    <footer style={{ padding: '16px 24px', borderTop: '1px solid #ddd', textAlign: 'center' }}>
      <p>© {year} ShopHub</p>
      <p><strong>Student:</strong> {studentName}</p>
      <p><strong>Course:</strong> {courseName}</p>
      <p><strong>Semester:</strong> {semester}</p>
    </footer>
  );
};

export default Footer;