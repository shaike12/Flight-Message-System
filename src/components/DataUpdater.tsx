import React, { useState } from 'react';
import { checkMissingFlightRouteData, updateMissingFlightRouteData } from '../firebase/services';
import { Button, Box, Typography, Paper, List, ListItem, ListItemText, Alert, CircularProgress } from '@mui/material';

const DataUpdater: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [missingData, setMissingData] = useState<any>(null);
  const [updateResult, setUpdateResult] = useState<any>(null);

  const handleCheckMissingData = async () => {
    setChecking(true);
    try {
      const result = await checkMissingFlightRouteData();
      setMissingData(result);
      setUpdateResult(null);
    } catch (error) {
      console.error('Error checking missing data:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleUpdateData = async () => {
    setLoading(true);
    try {
      const result = await updateMissingFlightRouteData();
      setUpdateResult(result);
      // Refresh the missing data after update
      await handleCheckMissingData();
    } catch (error) {
      console.error('Error updating data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Typography variant="h4" gutterBottom>
        עדכון נתוני מסלולי טיסות
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleCheckMissingData}
          disabled={checking}
          startIcon={checking ? <CircularProgress size={20} /> : null}
        >
          {checking ? 'בודק...' : 'בדוק נתונים חסרים'}
        </Button>
        
        {missingData && missingData.routesWithMissingData.length > 0 && (
          <Button
            variant="contained"
            color="success"
            onClick={handleUpdateData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'מעדכן...' : 'עדכן נתונים חסרים'}
          </Button>
        )}
      </Box>

      {missingData && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            סיכום נתונים
          </Typography>
          <Typography variant="body1" gutterBottom>
            סה"כ מסלולי טיסות: {missingData.totalRoutes}
          </Typography>
          <Typography variant="body1" gutterBottom>
            מסלולים עם נתונים חסרים: {missingData.routesWithMissingData.length}
          </Typography>
          
          {missingData.missingAirportCodes.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                קודי שדות תעופה שחסרים להם מיפוי:
              </Typography>
              <Typography variant="body2" color="error">
                {missingData.missingAirportCodes.join(', ')}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {missingData && missingData.routesWithMissingData.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            מסלולים עם נתונים חסרים:
          </Typography>
          <List>
            {missingData.routesWithMissingData.map((route: any, index: number) => (
              <ListItem key={route.id} divider>
                <ListItemText
                  primary={`טיסה ${route.flightNumber}: ${route.departureCity} → ${route.arrivalCity}`}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        שדות חסרים: {route.missingFields.join(', ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        יציאה: {route.currentData.departureCityHebrew} / {route.currentData.departureCityEnglish}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        נחיתה: {route.currentData.arrivalCityHebrew} / {route.currentData.arrivalCityEnglish}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {missingData && missingData.routesWithMissingData.length === 0 && (
        <Alert severity="success">
          ✅ כל מסלולי הטיסות מעודכנים עם שמות בעברית ובאנגלית!
        </Alert>
      )}

      {updateResult && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            תוצאות העדכון
          </Typography>
          <Typography variant="body1" gutterBottom>
            מסלולים שעודכנו: {updateResult.updatedCount}
          </Typography>
          {updateResult.failedUpdates.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" color="error" gutterBottom>
                עדכונים שנכשלו: {updateResult.failedUpdates.length}
              </Typography>
              {updateResult.failedUpdates.map((failed: any, index: number) => (
                <Typography key={index} variant="body2" color="error">
                  טיסה {failed.route.flightNumber}: {failed.error.message}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </div>
  );
};

export default DataUpdater;
