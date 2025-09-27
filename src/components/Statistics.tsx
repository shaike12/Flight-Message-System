import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { BarChart3, MessageSquare, Send, Clock, TrendingUp, Users, Plane, FileText, UserCheck, Activity, Database, Calendar } from 'lucide-react';
import { GeneratedMessage, Flight, MessageTemplate } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  LinearProgress, 
  Chip, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider,
  Container,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';

const Statistics: React.FC = () => {
  const { t } = useLanguage();
  const { messages } = useAppSelector((state) => state.messages);
  const { flights } = useAppSelector((state) => state.flights);
  const { templates } = useAppSelector((state) => state.templates);
  const { routes: flightRoutes } = useAppSelector((state) => state.flightRoutes);
  const { cities } = useAppSelector((state) => state.cities);

  // Calculate statistics
  const totalMessages = messages.length;
  const sentMessages = messages.filter((msg: GeneratedMessage) => msg.status === 'sent').length;
  const pendingMessages = totalMessages - sentMessages;
  const totalFlights = flights.length;
  const activeTemplates = templates.filter((t: MessageTemplate) => t.isActive).length;
  const totalTemplates = templates.length;
  const totalFlightRoutes = flightRoutes.length;
  const totalCities = cities.length;
  
  // Calculate updated flights (flights with recent updates)
  const updatedFlights = flights.filter((flight: Flight) => {
    const updateDate = new Date((flight as any).updatedAt || (flight as any).createdAt || new Date());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updateDate > weekAgo;
  }).length;

  // Mock user activity data (in real app, this would come from backend)
  const [userActivity, setUserActivity] = useState([
    { id: 1, name: 'שי שמואל', action: 'יצר תבנית חדשה', time: 'לפני 2 שעות', avatar: 'ש' },
    { id: 2, name: 'מנהל מערכת', action: 'עדכן מסלול טיסה', time: 'לפני 4 שעות', avatar: 'מ' },
    { id: 3, name: 'משתמש 1', action: 'שלח הודעה', time: 'לפני 6 שעות', avatar: 'מ' },
    { id: 4, name: 'משתמש 2', action: 'יצר תבנית חדשה', time: 'אתמול', avatar: 'מ' },
    { id: 5, name: 'מנהל מערכת', action: 'הוסיף עיר חדשה', time: 'לפני 2 ימים', avatar: 'מ' },
  ]);

  // Messages by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const messagesByDay = last7Days.map(date => ({
    date,
    count: messages.filter((msg: GeneratedMessage) => msg.createdAt.startsWith(date)).length
  }));

  // Most used templates
  const templateUsage = templates.map((template: MessageTemplate) => ({
    name: template.name,
    count: messages.filter((msg: GeneratedMessage) => msg.templateId === template.id).length
  })).sort((a: {name: string, count: number}, b: {name: string, count: number}) => b.count - a.count);

  // Most common routes
  const routeUsage = messages.reduce((acc: Record<string, number>, msg: GeneratedMessage) => {
    const route = `${msg.departureCity} → ${msg.arrivalCity}`;
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRoutes = Object.entries(routeUsage)
    .map(([route, count]) => ({ route, count: count as number }))
    .sort((a: {route: string, count: number}, b: {route: string, count: number}) => b.count - a.count)
    .slice(0, 5);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={24} color="white" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a202c' }} >
              {t.statistics.title}
            </Typography>
            <Typography variant="body1" sx={{ color: '#718096' }}>
              {t.statistics.systemOverview}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Main Statistics Cards */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: { xs: 2, sm: 3 }, 
        mb: 4,
        justifyContent: { xs: 'center', sm: 'flex-start' }
      }}>
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 250px' }, 
          minWidth: { xs: '280px', sm: '250px' },
          maxWidth: { xs: '100%', sm: 'none' }
        }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} style={{ marginLeft: '10px' }} >
                  <MessageSquare size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }} >
                    {totalMessages}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t.statistics.totalMessages}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 250px' }, 
          minWidth: { xs: '280px', sm: '250px' },
          maxWidth: { xs: '100%', sm: 'none' }
        }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} style={{ marginLeft: '10px' }} >
                  <Send size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {sentMessages}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t.statistics.sentMessages}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 250px' }, 
          minWidth: { xs: '280px', sm: '250px' },
          maxWidth: { xs: '100%', sm: 'none' }
        }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} style={{ marginLeft: '10px' }}>
                  <Clock size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {pendingMessages}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t.statistics.pendingMessages}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 250px' }, 
          minWidth: { xs: '280px', sm: '250px' },
          maxWidth: { xs: '100%', sm: 'none' }
        }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)',
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} style={{ marginLeft: '10px' }}>
                  <FileText size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {activeTemplates}/{totalTemplates}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {t.statistics.activeTemplates}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* System Data Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 250px' }, 
          minWidth: { xs: '280px', sm: '250px' },
          maxWidth: { xs: '100%', sm: 'none' }
        }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#e6fffa' }} style={{ marginLeft: '10px' }}>
                  <Plane size={24} color="#319795" />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                    {totalFlightRoutes}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096' }}>
                    {t.statistics.flightRoutes}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 250px' }, 
          minWidth: { xs: '280px', sm: '250px' },
          maxWidth: { xs: '100%', sm: 'none' }
        }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#fef5e7' }} style={{ marginLeft: '10px' }}>
                  <Activity size={24} color="#d69e2e" />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                    {updatedFlights}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096' }}>
                    {t.statistics.updatedFlights}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 250px' }, 
          minWidth: { xs: '280px', sm: '250px' },
          maxWidth: { xs: '100%', sm: 'none' }
        }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#e6f3ff' }} style={{ marginLeft: '10px' }}>
                  <Database size={24} color="#3182ce" />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                    {totalCities}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096' }}>
                    {t.statistics.citiesInSystem}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ 
          flex: { xs: '1 1 100%', sm: '1 1 250px' }, 
          minWidth: { xs: '280px', sm: '250px' },
          maxWidth: { xs: '100%', sm: 'none' }
        }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#f0fff4' }} style={{ marginLeft: '10px' }}>
                  <UserCheck size={24} color="#38a169" />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a202c' }}>
                    {userActivity.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096' }}>
                    {t.statistics.userActivities}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts and Activity */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Messages by Day */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={20} />
                {t.statistics.messagesByDay}
              </Typography>
              <Stack spacing={2}>
                {messagesByDay.map(({ date, count }) => (
                  <Box key={date}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#718096' }}>
                        {new Date(date).toLocaleDateString('he-IL')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(5, (count / Math.max(...messagesByDay.map(d => d.count), 1)) * 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Top Templates */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileText size={20} />
                {t.statistics.messagesByTemplate}
              </Typography>
              <Stack spacing={2}>
                {templateUsage.slice(0, 5).map(({ name, count }: {name: string, count: number}) => (
                  <Box key={name}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#718096', flex: 1, mr: 2 }}>
                        {name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(5, (count / Math.max(...templateUsage.map((t: {name: string, count: number}) => t.count), 1)) * 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* User Activity */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Users size={20} />
{t.statistics.userActivityHistory}
              </Typography>
              <List>
                {userActivity.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#667eea', color: 'white' }}>
                          {user.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {user.name}
                            </Typography>
                            <Chip
                              label={user.time}
                              size="small"
                              sx={{
                                backgroundColor: '#f7fafc',
                                color: '#718096',
                                fontSize: '0.75rem',
                              }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: '#718096' }}>
                            {user.action}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < userActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Top Routes */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Plane size={20} />
{t.statistics.popularRoutes}
              </Typography>
              <Stack spacing={2}>
                {topRoutes.map(({ route, count }: {route: string, count: number}) => (
                  <Paper
                    key={route}
                    sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Users size={16} color="#718096" />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {route}
                        </Typography>
                      </Stack>
                      <Chip
                        label={count}
                        sx={{
                          backgroundColor: '#667eea',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

          {/* Summary */}
      <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
{t.statistics.performanceSummary}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {totalMessages > 0 ? Math.round((sentMessages / totalMessages) * 100) : 0}%
              </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {t.statistics.sentMessagesPercentage}
                </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {Math.round(totalMessages / 7 * 10) / 10}
              </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {t.statistics.averageMessagesPerDay}
                </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {templateUsage.filter((t: {name: string, count: number}) => t.count > 0).length}/{totalTemplates}
              </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {t.statistics.templatesInUse}
                </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Statistics;

