import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers';

function TimelineControl({ timeRange, onTimeRangeChange, selectedDate, onDateChange }) {
  return (
    <Box sx={{ 
      p: 2, 
      borderTop: 1, 
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }}>
      <ToggleButtonGroup
        value={timeRange}
        exclusive
        onChange={(e, newValue) => newValue && onTimeRangeChange(newValue)}
        aria-label="time range"
      >
        <ToggleButton value="year" aria-label="yearly view">
          Year
        </ToggleButton>
        <ToggleButton value="quarter" aria-label="quarterly view">
          Quarter
        </ToggleButton>
        <ToggleButton value="month" aria-label="monthly view">
          Month
        </ToggleButton>
      </ToggleButtonGroup>

      {/* <DatePicker
        label="Select Date"
        value={selectedDate}
        onChange={onDateChange}
        views={timeRange === 'year' ? ['year'] : timeRange === 'quarter' ? ['year', 'month'] : ['year', 'month', 'day']}
        slotProps={{
          textField: {
            size: "small",
            sx: { width: 200 }
          }
        }}
      /> */}
    </Box>
  );
}

export default TimelineControl; 