import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Users,
  UserPlus,
  Edit,
  Delete,
  Eye,
  Clock,
  Shield,
  User,
  Activity,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAvatarColor, getUserInitials } from '../utils/avatarUtils';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  isOnline: boolean;
  lastLogin: any; // Firestore timestamp
  loginCount: number;
  createdAt: any; // Firestore timestamp
  lastActivity: any; // Firestore timestamp
  avatar?: string;
  phoneNumber?: string;
  providerId?: string;
}

interface LoginHistory {
  id: string;
  userId: string;
  userEmail: string;
  loginTime: any; // Firestore timestamp
  logoutTime?: any; // Firestore timestamp
  ipAddress: string;
  userAgent: string;
  sessionDuration?: number;
}

const UserManagement: React.FC = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    email: '',
    role: 'user' as 'admin' | 'user'
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Load real data from Firestore
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load users from Firestore
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        
        const usersData: UserData[] = [];
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          usersData.push({
            id: doc.id,
            email: userData.email || '',
            displayName: userData.displayName || userData.name || 'משתמש ללא שם',
            role: userData.role || 'user',
            isOnline: userData.isOnline || false,
            lastLogin: userData.lastLogin,
            loginCount: userData.loginCount || 0,
            createdAt: userData.createdAt,
            lastActivity: userData.lastActivity,
            avatar: userData.avatar,
            phoneNumber: userData.phoneNumber,
            providerId: userData.providerId
          });
        });

        // Load login history from Firestore
        const loginHistoryCollection = collection(db, 'loginHistory');
        const historyQuery = query(loginHistoryCollection, orderBy('loginTime', 'desc'));
        const historySnapshot = await getDocs(historyQuery);
        
        const historyData: LoginHistory[] = [];
        historySnapshot.forEach((doc) => {
          const historyItem = doc.data();
          historyData.push({
            id: doc.id,
            userId: historyItem.userId || '',
            userEmail: historyItem.userEmail || '',
            loginTime: historyItem.loginTime,
            logoutTime: historyItem.logoutTime,
            ipAddress: historyItem.ipAddress || 'לא זמין',
            userAgent: historyItem.userAgent || 'לא זמין',
            sessionDuration: historyItem.sessionDuration
          });
        });

        setUsers(usersData);
        setLoginHistory(historyData);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to empty arrays if there's an error
        setUsers([]);
        setLoginHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const onlineUsers = users.filter(user => user.isOnline);
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === 'admin').length;

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditFormData({
      displayName: user.displayName,
      email: user.email,
      role: user.role
    });
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        displayName: editFormData.displayName,
        email: editFormData.email,
        role: editFormData.role,
        lastActivity: new Date()
      });
      
      // Refresh the users list
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData: UserData[] = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        usersData.push({
          id: doc.id,
          email: userData.email || '',
          displayName: userData.displayName || userData.name || 'משתמש ללא שם',
          role: userData.role || 'user',
          isOnline: userData.isOnline || false,
          lastLogin: userData.lastLogin,
          loginCount: userData.loginCount || 0,
          createdAt: userData.createdAt,
          lastActivity: userData.lastActivity,
          avatar: userData.avatar,
          phoneNumber: userData.phoneNumber,
          providerId: userData.providerId
        });
      });
      setUsers(usersData);
      
      setEditDialogOpen(false);
      setSelectedUser(null);
      setEditFormData({
        displayName: '',
        email: '',
        role: 'user'
      });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await deleteDoc(userRef);
      
      // Remove from local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (date: any) => {
    if (!date) return 'לא זמין';
    
    let dateObj: Date;
    if (date.toDate && typeof date.toDate === 'function') {
      // Firestore timestamp
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          {t.userManagement.loadingUsers}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
            width: 50,
            height: 50,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            <Users size={24} color="white" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {t.userManagement.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t.userManagement.subtitle}
            </Typography>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3 
        }}>
          <Box>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge color="success" variant="dot">
                    <Users size={24} color="#10b981" />
                  </Badge>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                      {onlineUsers.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t.userManagement.onlineUsers}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <User size={24} color="#3b82f6" />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                      {totalUsers}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t.userManagement.totalUsers}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Shield size={24} color="#a855f7" />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#a855f7', fontWeight: 'bold' }}>
                      {adminUsers}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t.userManagement.adminUsers}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Activity size={24} color="#f59e0b" />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      {loginHistory.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t.userManagement.loginsToday}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab 
              label={t.userManagement.activeUsers} 
              icon={<Users size={16} />}
              iconPosition="start"
            />
            <Tab 
              label={t.userManagement.loginHistory} 
              icon={<Clock size={16} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Active Users Tab */}
        {activeTab === 0 && (
          <CardContent>
            {/* Search and Filter */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder={t.userManagement.searchUsers}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={16} style={{ marginRight: 8 }} />
                }}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t.userManagement.userType}</InputLabel>
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  label={t.userManagement.userType}
                >
                  <MenuItem value="all">{t.userManagement.all}</MenuItem>
                  <MenuItem value="admin">{t.userManagement.admin}</MenuItem>
                  <MenuItem value="user">{t.userManagement.user}</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={16} style={{ marginLeft: '8px'}} />}
                onClick={() => window.location.reload()}
                sx={{ ml: 'auto' }}
              >
                רענן
              </Button>
              <Button
                variant="outlined"
                startIcon={<UserPlus size={16} style={{ marginLeft: '8px'}} />}
                sx={{ ml: 1 }}
              >
                {t.userManagement.addUser}
              </Button>
            </Box>

            {/* Users Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.user}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.status}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.role}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.lastLogin}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.lastActivity}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.actions}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                          <Avatar sx={{ 
                            bgcolor: user.isOnline ? '#10b981' : '#6b7280',
                            width: 32,
                            height: 32
                          }}>
                            {user.displayName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {user.displayName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={user.isOnline ? t.userManagement.connected : t.userManagement.disconnected}
                          color={user.isOnline ? 'success' : 'default'}
                          size="small"
                          icon={user.isOnline ? <LogIn size={14} /> : <LogOut size={14} />}
                          sx={{
                            backgroundColor: user.isOnline ? '#4caf50' : '#757575',
                            color: 'white',
                            '& .MuiChip-label': {
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.75rem'
                            },
                            '& .MuiChip-icon': {
                              color: 'white',
                              fontSize: '14px',
                              marginLeft: '4px',
                              marginRight: '4px'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={user.role === 'admin' ? t.userManagement.admin : t.userManagement.user}
                          color={user.role === 'admin' ? 'primary' : 'secondary'}
                          size="medium"
                          icon={<Shield size={14} />}
                          
                          sx={{
                            backgroundColor: user.role === 'admin' ? '#1976d2' : '#9c27b0',
                            color: 'white',
                            height: '32px',
                            '& .MuiChip-label': {
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              fontFamily: 'inherit',
                              direction: 'rtl',
                              unicodeBidi: 'bidi-override'
                            },
                            '& .MuiChip-icon': {
                              color: 'white',
                              fontSize: '14px',
                              marginLeft: '4px',
                              marginRight: '4px'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                          {formatDate(user.lastLogin)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {user.loginCount || 0} התחברויות
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                          {formatDate(user.lastActivity)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title={t.userManagement.view}>
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t.userManagement.edit}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t.userManagement.delete}>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Delete size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Login History Tab */}
        {activeTab === 1 && (
          <CardContent>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.user}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.loginTime}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.logoutTime}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.sessionDuration}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.ipAddress}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{t.userManagement.browser}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loginHistory.map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {session.userEmail}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                          {formatDate(session.loginTime)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                          {session.logoutTime ? formatDate(session.logoutTime) : 'פעיל'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                          {session.sessionDuration ? formatDuration(session.sessionDuration) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {session.ipAddress}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                          {session.userAgent}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t.userManagement.editUser}</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label={t.userManagement.fullName}
                value={editFormData.displayName}
                onChange={(e) => setEditFormData({...editFormData, displayName: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t.userManagement.email}
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth>
                <InputLabel>{t.userManagement.role}</InputLabel>
                <Select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value as 'admin' | 'user'})}
                  label={t.userManagement.role}
                >
                  <MenuItem value="user">{t.userManagement.user}</MenuItem>
                  <MenuItem value="admin">{t.userManagement.admin}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t.userManagement.cancel}</Button>
          <Button onClick={handleSaveUser} variant="contained">{t.userManagement.save}</Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t.userManagement.viewUser || 'פרטי משתמש'}</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{
                  bgcolor: getAvatarColor(selectedUser.displayName || selectedUser.email || 'unknown'),
                  width: 64,
                  height: 64
                }}>
                  {getUserInitials(selectedUser.displayName || selectedUser.email || 'U')}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {selectedUser.displayName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t.userManagement.role}:
                  </Typography>
                  <Chip
                    label={selectedUser.role === 'admin' ? t.userManagement.admin : t.userManagement.user}
                    color={selectedUser.role === 'admin' ? 'primary' : 'secondary'}
                    size="small"
                    icon={<Shield size={14} />}
                    sx={{
                      backgroundColor: selectedUser.role === 'admin' ? '#1976d2' : '#9c27b0',
                      color: 'white',
                      '& .MuiChip-label': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiChip-icon': {
                        color: 'white',
                        fontSize: '14px',
                        marginLeft: '4px',
                        marginRight: '4px'
                      }
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t.userManagement.status}:
                  </Typography>
                  <Chip
                    label={selectedUser.isOnline ? t.userManagement.connected : t.userManagement.disconnected}
                    color={selectedUser.isOnline ? 'success' : 'default'}
                    size="small"
                    icon={selectedUser.isOnline ? <LogIn size={14} /> : <LogOut size={14} />}
                    sx={{
                      backgroundColor: selectedUser.isOnline ? '#4caf50' : '#757575',
                      color: 'white',
                      '& .MuiChip-label': {
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      '& .MuiChip-icon': {
                        color: 'white',
                        fontSize: '12px',
                        marginLeft: '4px',
                        marginRight: '4px',
                        
                      }
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t.userManagement.lastLogin}:
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedUser.lastLogin)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t.userManagement.lastActivity}:
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedUser.lastActivity)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t.userManagement.loginCount}:
                  </Typography>
                  <Typography variant="body2">
                    {selectedUser.loginCount || 0}
                  </Typography>
                </Box>
                
                {selectedUser.phoneNumber && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {t.userManagement.phoneNumber || 'טלפון'}:
                    </Typography>
                    <Typography variant="body2">
                      {selectedUser.phoneNumber}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>{t.userManagement.close || 'סגור'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t.userManagement.deleteUser}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t.userManagement.deleteConfirm.replace('{name}', selectedUser?.displayName || '')}
            {t.userManagement.deleteWarning}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t.userManagement.cancel}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t.userManagement.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
