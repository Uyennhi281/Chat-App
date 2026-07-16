import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, LinearProgress, Alert } from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { uploadApi } from '../api/uploadApi';
import { getToken } from '../auth/token';

const PLACEHOLDER_SVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const ImageUploader = ({ value, onChange }) => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Kiểm tra login trước
    const token = getToken();
    if (!token) {
      setError('Vui lòng đăng nhập để upload ảnh!');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Kiểm tra loại file
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Chỉ chấp nhận JPG, PNG, GIF, WEBP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File quá lớn (tối đa 5MB)');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    setLoading(true);
    setError('');
    try {
      const result = await uploadApi.uploadImage(file);
      onChange(result.url);
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.detail || 'Upload thất bại. Thử lại sau.');
      }
      setPreview('');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Box>
      <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileSelect} />
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {preview ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Box component="img" src={preview} sx={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 2, border: '1px solid #ddd' }} />
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={handleRemove} sx={{ mt: 1 }}>Xóa ảnh</Button>
        </Box>
      ) : (
        <Button variant="outlined" onClick={() => fileInputRef.current?.click()} sx={{ width: 200, height: 200, border: '2px dashed #ccc', borderRadius: 2, flexDirection: 'column', gap: 1 }}>
          <UploadIcon sx={{ fontSize: 40, color: '#999' }} />
          <Typography color="text.secondary">Chọn ảnh</Typography>
        </Button>
      )}

      {loading && <Box sx={{ width: 200, mt: 1 }}><LinearProgress /><Typography variant="caption">Đang upload...</Typography></Box>}
    </Box>
  );
};

export default ImageUploader;