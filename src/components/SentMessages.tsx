import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip, 
  Alert, 
  CircularProgress,
  Container,
  Stack,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider
} from '@mui/material';
import { 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  MessageSquare, 
  User, 
  Calendar,
  Clock,
  Plane,
  MapPin,
  Download,
  Search,
  X
} from 'lucide-react';

interface SentMessage {
  id: string;
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  originalDate: string;
  newDate?: string;
  originalTime: string;
  newTime: string;
  hebrewMessage: string;
  englishMessage: string;
  frenchMessage?: string;
  sentBy: string;
  sentAt: string;
  templateId: string;
  templateName: string;
}

const SentMessages: React.FC = () => {
  const { t, language } = useLanguage();
  const { userData } = useAuth();
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<SentMessage | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<SentMessage | null>(null);
  const [searchFlightNumber, setSearchFlightNumber] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<SentMessage[]>([]);

  // Load sent messages from Firebase
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messagesRef = collection(db, 'sentMessages');
        const q = query(messagesRef, orderBy('sentAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const messages: SentMessage[] = [];
        querySnapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() } as SentMessage);
        });
        
        setSentMessages(messages);
        
        // Also load from localStorage as backup
        const savedMessages = localStorage.getItem('sentMessages');
        if (savedMessages && messages.length === 0) {
          setSentMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.error('Error loading sent messages:', error);
        setError('שגיאה בטעינת ההודעות');
        
        // Fallback to localStorage
        try {
          const savedMessages = localStorage.getItem('sentMessages');
          if (savedMessages) {
            setSentMessages(JSON.parse(savedMessages));
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  // Save messages to localStorage whenever sentMessages changes
  useEffect(() => {
    if (sentMessages.length > 0) {
      localStorage.setItem('sentMessages', JSON.stringify(sentMessages));
    }
  }, [sentMessages]);

  // Filter messages based on search criteria
  useEffect(() => {
    let filtered = sentMessages;

    if (searchFlightNumber) {
      filtered = filtered.filter(message => 
        message.flightNumber.toLowerCase().includes(searchFlightNumber.toLowerCase())
      );
    }

    if (searchDate) {
      filtered = filtered.filter(message => {
        const messageDate = new Date(message.originalDate).toISOString().split('T')[0];
        return messageDate === searchDate;
      });
    }

    setFilteredMessages(filtered);
  }, [sentMessages, searchFlightNumber, searchDate]);

  const handleViewMessage = (message: SentMessage) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  const handleEditMessage = (message: SentMessage) => {
    setEditingMessage(message);
    setEditDialogOpen(true);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm(t.sentMessages.table.confirmDelete)) {
      try {
        // Delete from Firebase
        await deleteDoc(doc(db, 'sentMessages', messageId));
        
        // Update local state
        setSentMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        alert(t.sentMessages.table.deleteSuccess);
      } catch (error) {
        console.error('Error deleting message:', error);
        alert(t.sentMessages.table.deleteError);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editingMessage) {
      try {
        // Update in Firebase
        const messageRef = doc(db, 'sentMessages', editingMessage.id);
        await updateDoc(messageRef, {
          flightNumber: editingMessage.flightNumber,
          departureCity: editingMessage.departureCity,
          arrivalCity: editingMessage.arrivalCity,
          originalDate: editingMessage.originalDate,
          originalTime: editingMessage.originalTime,
          newDate: editingMessage.newDate,
          newTime: editingMessage.newTime,
        });
        
        // Update local state
        setSentMessages(prev => 
          prev.map(msg => 
            msg.id === editingMessage.id ? editingMessage : msg
          )
        );
        
        setEditDialogOpen(false);
        setEditingMessage(null);
        
        alert(language === 'he' ? 'ההודעה עודכנה בהצלחה' : 'Message updated successfully');
      } catch (error) {
        console.error('Error updating message:', error);
        alert(language === 'he' ? 'שגיאה בעדכון ההודעה' : 'Error updating message');
      }
    }
  };

  const handleExportToExcel = () => {
    try {
      const messagesToExport = filteredMessages.length > 0 ? filteredMessages : sentMessages;
      
      // Create CSV content
      const headers = [
        'מספר טיסה',
        'יציאה',
        'נחיתה',
        'תאריך מקורי',
        'שעה מקורית',
        'תאריך חדש',
        'שעה חדשה',
        'הודעה עברית',
        'הודעה באנגלית',
        'הודעה צרפתית',
        'נשלח על ידי',
        'נשלח בתאריך'
      ];

      const csvContent = [
        headers.join(','),
        ...messagesToExport.map(message => [
          `LY${message.flightNumber.padStart(3, '0')}`,
          `"${message.departureCity}"`,
          `"${message.arrivalCity}"`,
          formatDateOnly(message.originalDate),
          formatTime(message.originalTime),
          message.newDate ? formatDateOnly(message.newDate) : '',
          formatTime(message.newTime),
          `"${message.hebrewMessage.replace(/"/g, '""')}"`,
          `"${message.englishMessage.replace(/"/g, '""')}"`,
          `"${message.frenchMessage?.replace(/"/g, '""') || ''}"`,
          `"${message.sentBy}"`,
          formatDate(message.sentAt)
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sent-messages-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(t.sentMessages.table.exportSuccess);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert(t.sentMessages.table.exportError);
    }
  };

  const handleClearSearch = () => {
    setSearchFlightNumber('');
    setSearchDate('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM format
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: 48,
            height: 48
          }}>
            <MessageSquare size={24} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {t.sentMessages.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t.sentMessages.subtitle}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Messages Table */}
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.1)'
      }}>
        <CardContent sx={{ p: 0 }}>
          {sentMessages.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <MessageSquare size={48} style={{ color: '#ccc', marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {t.sentMessages.noMessages}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {language === 'he' 
                  ? 'הודעות שנשלחו יופיעו כאן' 
                  : 'Sent messages will appear here'
                }
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Header with title and export button */}
              <Box sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  {t.sentMessages.title}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Download size={18} />}
                  onClick={handleExportToExcel}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0ea472 0%, #047857 100%)',
                      boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                    }
                  }}
                >
                  {t.sentMessages.table.exportToExcel}
                </Button>
              </Box>

              {/* Search bar - sticky */}
              <Box sx={{ 
                p: 2, 
                background: 'rgba(255, 255, 255, 0.95)',
                borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backdropFilter: 'blur(10px)'
              }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    size="small"
                    placeholder={t.sentMessages.table.searchByFlightNumber}
                    value={searchFlightNumber}
                    onChange={(e) => setSearchFlightNumber(e.target.value)}
                    InputProps={{
                      startAdornment: <Search size={18} style={{ marginRight: 8, color: '#667eea' }} />
                    }}
                    sx={{
                      minWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      }
                    }}
                  />
                  <TextField
                    size="small"
                    type="date"
                    placeholder={t.sentMessages.table.searchByDate}
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    sx={{
                      minWidth: 150,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleClearSearch}
                    disabled={!searchFlightNumber && !searchDate}
                    sx={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        borderColor: '#5a6fd8',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      },
                      '&:disabled': {
                        borderColor: 'rgba(0, 0, 0, 0.12)',
                        color: 'rgba(0, 0, 0, 0.26)',
                      }
                    }}
                  >
                    {t.sentMessages.table.clearSearch}
                  </Button>
                </Stack>
              </Box>
              <TableContainer>
                <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                  }}>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Plane size={16} />
                        <span>{t.sentMessages.table.flightNumber}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <MapPin size={16} />
                        <span>{t.sentMessages.table.departureCity}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <MapPin size={16} />
                        <span>{t.sentMessages.table.arrivalCity}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Calendar size={16} />
                        <span>{t.sentMessages.table.originalDate}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Clock size={16} />
                        <span>{t.sentMessages.table.originalTime}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Calendar size={16} />
                        <span>{t.sentMessages.table.newDate}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Clock size={16} />
                        <span>{t.sentMessages.table.newTime}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <User size={16} />
                        <span>{t.sentMessages.table.sentBy}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Calendar size={16} />
                        <span>{t.sentMessages.table.sentAt}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      {t.sentMessages.table.actions}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMessages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchFlightNumber || searchDate 
                            ? (language === 'he' ? 'לא נמצאו תוצאות לחיפוש' : 'No search results found')
                            : (language === 'he' ? 'אין הודעות להצגה' : 'No messages to display')
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMessages.map((message) => (
                    <TableRow 
                      key={message.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(102, 126, 234, 0.05)' 
                        } 
                      }}
                    >
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip 
                          label={`LY${message.flightNumber.padStart(3, '0')}`}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{message.departureCity}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{message.arrivalCity}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDateOnly(message.originalDate)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatTime(message.originalTime)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{message.newDate ? formatDateOnly(message.newDate) : '-'}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatTime(message.newTime)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {message.sentBy.charAt(0).toUpperCase()}
                          </Avatar>
                          <span>{message.sentBy}</span>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{formatDate(message.sentAt)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                          <Tooltip title={t.sentMessages.table.view}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewMessage(message)}
                              sx={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #0ea472 0%, #047857 100%)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Eye size={16} />
                            </IconButton>
                          </Tooltip>
                          {userData?.role === 'admin' && (
                            <>
                              <Tooltip title={t.sentMessages.table.edit}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditMessage(message)}
                                  sx={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #e58e00 0%, #c46200 100%)',
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <Edit size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t.sentMessages.table.delete}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteMessage(message.id)}
                                  sx={{
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <MessageSquare size={24} />
            <span>{t.sentMessages.title}</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {language === 'he' ? 'פרטי הטיסה' : 'Flight Details'}
                </Typography>
                <Stack spacing={1}>
                  <Typography><strong>{t.sentMessages.table.flightNumber}:</strong> LY{selectedMessage.flightNumber.padStart(3, '0')}</Typography>
                  <Typography><strong>{t.sentMessages.table.departureCity}:</strong> {selectedMessage.departureCity}</Typography>
                  <Typography><strong>{t.sentMessages.table.arrivalCity}:</strong> {selectedMessage.arrivalCity}</Typography>
                  <Typography><strong>{t.sentMessages.table.originalDate}:</strong> {formatDateOnly(selectedMessage.originalDate)}</Typography>
                  <Typography><strong>{t.sentMessages.table.originalTime}:</strong> {formatTime(selectedMessage.originalTime)}</Typography>
                </Stack>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t.sentMessages.table.hebrewMessage}
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(102, 126, 234, 0.05)' }}>
                  <Typography sx={{ direction: 'rtl', textAlign: 'right' }}>
                    {selectedMessage.hebrewMessage}
                  </Typography>
                </Paper>
              </Box>
              
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t.sentMessages.table.englishMessage}
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(102, 126, 234, 0.05)' }}>
                  <Typography sx={{ direction: 'ltr', textAlign: 'left' }}>
                    {selectedMessage.englishMessage}
                  </Typography>
                </Paper>
              </Box>

              {selectedMessage.frenchMessage && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🇫🇷 {language === 'he' ? 'הודעה צרפתית' : 'French Message'}
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(102, 126, 234, 0.05)' }}>
                    <Typography sx={{ direction: 'ltr', textAlign: 'left' }}>
                      {selectedMessage.frenchMessage}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              <Divider />
              
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {language === 'he' ? 'פרטי שליחה' : 'Send Details'}
                </Typography>
                <Stack spacing={1}>
                  <Typography><strong>{t.sentMessages.table.sentBy}:</strong> {selectedMessage.sentBy}</Typography>
                  <Typography><strong>{t.sentMessages.table.sentAt}:</strong> {formatDate(selectedMessage.sentAt)}</Typography>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            {language === 'he' ? 'סגור' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Edit size={24} />
            <span>{t.sentMessages.table.edit}</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {editingMessage && (
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              borderRadius: 2,
              p: 2,
              mb: 2
            }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}>
                {language === 'he' ? 'פרטי הטיסה' : 'Flight Details'}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label={t.sentMessages.table.flightNumber}
                  value={editingMessage.flightNumber}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    flightNumber: e.target.value
                  })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }
                  }}
                />
                
                <TextField
                  label={t.sentMessages.table.departureCity}
                  value={editingMessage.departureCity}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    departureCity: e.target.value
                  })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputBase-input': {
                      textAlign: 'center'
                    }
                  }}
                />
                
                <TextField
                  label={t.sentMessages.table.arrivalCity}
                  value={editingMessage.arrivalCity}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    arrivalCity: e.target.value
                  })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputBase-input': {
                      textAlign: 'center'
                    }
                  }}
                />
                
                <TextField
                  label={t.sentMessages.table.originalDate}
                  type="date"
                  value={editingMessage.originalDate}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    originalDate: e.target.value
                  })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    }
                  }}
                />
                
                <TextField
                  label={t.sentMessages.table.originalTime}
                  type="time"
                  value={editingMessage.originalTime}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    originalTime: e.target.value
                  })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    }
                  }}
                />
                
                <TextField
                  label={t.sentMessages.table.newDate}
                  type="date"
                  value={editingMessage.newDate || ''}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    newDate: e.target.value
                  })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    }
                  }}
                />
                
                <TextField
                  label={t.sentMessages.table.newTime}
                  type="time"
                  value={editingMessage.newTime}
                  onChange={(e) => setEditingMessage({
                    ...editingMessage,
                    newTime: e.target.value
                  })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {language === 'he' ? 'שמור' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SentMessages;
