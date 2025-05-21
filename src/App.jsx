import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MapComponent from './MapComponent';
// import TimelineControl from './TimelineControl';
import Header from './Header';
import 'leaflet/dist/leaflet.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [timeRange, setTimeRange] = useState('year');
  const [zoomLevel, setZoomLevel] = useState(0); // 0: super sections, 1: 10m sections, 2: distress
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleZoomChange = (newZoom) => {
    setZoomLevel(newZoom);
  };

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  return (
    <ThemeProvider theme={theme}>
      {/* <LocalizationProvider dateAdapter={AdapterDateFns}> */}
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', width: '100vw' }}>
        <Header />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MapComponent
            zoomLevel={zoomLevel}
            onZoomChange={handleZoomChange}
            timeRange={timeRange}
            selectedDate={selectedDate}
          />
          {/* <TimelineControl
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            /> */}
        </Box>
      </Box>
      {/* </LocalizationProvider> */}
    </ThemeProvider>
  );
}

export default App; 