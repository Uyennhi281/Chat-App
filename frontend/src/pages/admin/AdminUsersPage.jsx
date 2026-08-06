import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField,
  InputAdornment, CircularProgress, Alert, Avatar,
  Select, MenuItem,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { usersApi } from '../../api/usersApi';

const ROLES = ['customer', 'SHIPPER', 'ADMIN'];

const roleColors = {
  ADMIN:    { bg: '#fdecea', color: '#c62828' },
  SHIPPER:  { bg: '#e8f4fd', color: '#0277bd' },
  customer: { bg: '#f0f0f0', color: '#555' },
};

const AdminUsersPage = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getAll();
        setUsers(data);
      } catch {
        setError('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setSavingId(userId);
    try {
      const updated = await usersApi.updateRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch {
      alert('Không thể cập nhật vai trò');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>Người dùng đã đăng ký</Typography>

      <TextField
        fullWidth placeholder="Tìm theo tên hoặc email..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, backgroundColor: 'white', borderRadius: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell width={60} sx={{ fontWeight: 'bold' }}>Mã</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Người dùng</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell width={160} sx={{ fontWeight: 'bold' }}>Vai trò</TableCell>
                <TableCell width={160} sx={{ fontWeight: 'bold' }}>Ngày đăng ký</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14, backgroundColor: '#3f51b5' }}>
                        {user.full_name?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Typography fontWeight={500}>{user.full_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={user.role}
                      disabled={savingId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      sx={{
                        minWidth: 120,
                        fontSize: 13,
                        fontWeight: 600,
                        backgroundColor: roleColors[user.role]?.bg || '#f0f0f0',
                        color: roleColors[user.role]?.color || '#555',
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      }}
                    >
                      {ROLES.map((r) => (
                        <MenuItem key={r} value={r}>{r}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#999' }}>
                    Không tìm thấy người dùng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminUsersPage;
