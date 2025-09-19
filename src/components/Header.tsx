import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, User, Settings, ChevronDown, Moon, Sun } from 'lucide-react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Avatar, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Chip,
  Button
} from '@mui/material';

const Header: React.FC = () => {
  const { userData, logout } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) {
      console.error('Logout failed:', result.error);
    }
    handleClose();
  };

  // Generate user initials for avatar
  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar color based on user name
  const getAvatarColor = (name: string | undefined) => {
    if (!name) return '#667eea'; // Default color
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
      '#ff5722', '#795548', '#607d8b'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderBottom: isDarkMode 
          ? '1px solid rgba(139, 92, 246, 0.2)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isDarkMode 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: isDarkMode 
            ? 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.5) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)',
        }
      }}
    >
      <Toolbar 
        sx={{ 
          justifyContent: 'space-between', 
          minHeight: { xs: '64px', sm: '72px' },
          px: { xs: 2, sm: 3, md: 4 },
          flexWrap: 'nowrap',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      >
        {/* Logo/Title Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          minWidth: 0,
          flex: '0 0 auto',
          gap: 2
        }}>
          {/* Logo Icon */}
          <Box
            sx={{
              width: { xs: 40, sm: 44, md: 48 },
              height: { xs: 40, sm: 44, md: 48 },
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 2,
                padding: '1px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'xor',
                WebkitMaskComposite: 'xor',
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                lineHeight: 1
              }}
            >
              EL
            </Typography>
          </Box>
          
          {/* Title */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography 
              variant="h6" 
              component="h1"
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2
              }}
            >
              {t.app.title}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                fontWeight: 'medium',
                opacity: 0.8
              }}
            >
              מערכת הודעות טיסות
            </Typography>
          </Box>
        </Box>

        {/* Dark Mode Toggle & User Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2, md: 3 },
          minWidth: 0,
          flex: '0 0 auto'
        }}>
          {/* Dark Mode Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>

          {/* User Section */}
          {userData && (
            <>
            {/* User Info */}
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center', 
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 3,
              background: 'rgba(102, 126, 234, 0.05)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: '600',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: '80px', sm: '120px', md: '150px' }
                }}
              >
                שלום, {userData.name || 'משתמש'}
              </Typography>
              
              <Chip
                label={userData.role === 'admin' ? 'מנהל' : 'משתמש'}
                size="small"
                sx={{
                  backgroundColor: userData.role === 'admin' 
                    ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' 
                    : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  color: userData.role === 'admin' ? '#1976d2' : '#7b1fa2',
                  fontWeight: 'bold',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  height: { xs: '22px', sm: '26px' },
                  border: userData.role === 'admin' 
                    ? '1px solid rgba(25, 118, 210, 0.2)' 
                    : '1px solid rgba(123, 31, 162, 0.2)',
                  '& .MuiChip-label': {
                    px: { xs: 0.75, sm: 1.25 }
                  }
                }}
              />
            </Box>

            {/* Avatar with Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
              <Button
                onClick={handleClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  textTransform: 'none',
                  color: 'text.primary',
                  borderRadius: 3,
                  px: 1.5,
                  py: 1,
                  minWidth: 'auto',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 36, sm: 40, md: 44 },
                    height: { xs: 36, sm: 40, md: 44 },
                    backgroundColor: getAvatarColor(userData.name),
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '3px solid white',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      padding: '2px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                      WebkitMaskComposite: 'xor',
                    }
                  }}
                >
                  {getUserInitials(userData.name)}
                </Avatar>
                <Box sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  color: 'text.secondary',
                  transition: 'transform 0.2s ease-in-out'
                }}>
                  <ChevronDown size={16} />
                </Box>
              </Button>

              {/* User Menu */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 8px 32px rgba(0,0,0,0.12))',
                    mt: 2,
                    minWidth: { xs: 200, sm: 240 },
                    maxWidth: { xs: '90vw', sm: 'none' },
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '& .MuiAvatar-root': {
                      width: 40,
                      height: 40,
                      ml: -0.5,
                      mr: 1.5,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: -6,
                      right: 20,
                      width: 12,
                      height: 12,
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderBottom: 'none',
                      borderRight: 'none',
                      transform: 'rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* User Info Header */}
                <MenuItem disabled sx={{ 
                  opacity: 1, 
                  cursor: 'default',
                  py: 2,
                  px: 2,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                }}>
                  <Avatar
                    sx={{
                      backgroundColor: getAvatarColor(userData.name),
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      width: 48,
                      height: 48,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '3px solid white'
                    }}
                  >
                    {getUserInitials(userData.name)}
                  </Avatar>
                  <Box sx={{ ml: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      {userData.name || 'משתמש'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {userData.email || userData.phoneNumber}
                    </Typography>
                    <Chip
                      label={userData.role === 'admin' ? 'מנהל' : 'משתמש'}
                      size="small"
                      sx={{
                        mt: 0.5,
                        backgroundColor: userData.role === 'admin' 
                          ? 'rgba(25, 118, 210, 0.1)' 
                          : 'rgba(123, 31, 162, 0.1)',
                        color: userData.role === 'admin' ? '#1976d2' : '#7b1fa2',
                        fontSize: '0.7rem',
                        height: '20px'
                      }}
                    />
                  </Box>
                </MenuItem>
                
                <Divider sx={{ my: 0.5 }} />
                
                {/* Settings Option */}
                <MenuItem 
                  onClick={handleClose}
                  sx={{ 
                    py: 1.5,
                    px: 2,
                    borderRadius: 1,
                    mx: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.08)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Settings size={20} color="#667eea" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t.header.settings} 
                    primaryTypographyProps={{ 
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}
                  />
                </MenuItem>
                
                <Divider sx={{ my: 0.5 }} />
                
                {/* Logout Option */}
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    color: '#d32f2f',
                    py: 1.5,
                    px: 2,
                    borderRadius: 1,
                    mx: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.08)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LogOut size={20} color="#d32f2f" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t.header.logout} 
                    primaryTypographyProps={{ 
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}
                  />
                </MenuItem>
              </Menu>
            </Box>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
