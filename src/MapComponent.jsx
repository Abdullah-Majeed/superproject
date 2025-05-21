import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Polyline, Circle, Popup } from 'react-leaflet';
import { Box, Typography, Paper, Divider } from '@mui/material';
import L from 'leaflet';
import { mockData, superSectionMetadata } from './mockData';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different distress types
const distressIcons = {
  pothole: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  crack: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  default: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
};

// Helper function to get color based on condition
const getConditionColor = (condition) => {
  if (condition >= 80) return '#00C853'; // Bright green
  if (condition >= 60) return '#64DD17'; // Light green
  if (condition >= 40) return '#FFD600'; // Yellow
  if (condition >= 20) return '#FF6D00'; // Orange
  return '#D50000'; // Red
};

// Helper function to get distress color
const getDistressColor = (type) => {
  const colors = {
    pothole: '#D32F2F',     // Deep red
    crack: '#FF6F00',       // Deep orange
    rutting: '#FFC107',     // Amber
    raveling: '#7B1FA2',    // Purple
    bleeding: '#1976D2',    // Blue
    patching: '#388E3C',    // Green
    edge_cracking: '#5D4037' // Brown
  };
  return colors[type] || '#666666';
};

// Helper function to safely format date
const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return 'N/A';
  }
  return date.toLocaleDateString();
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

function MapComponent({ timeRange, selectedDate, onZoomChange }) {
  const [currentZoom, setCurrentZoom] = useState(0);
  const [visibleLayers, setVisibleLayers] = useState({
    superSections: true,
    sections: false,
    distress: false
  });
  
  useEffect(() => {
    // Filter data based on timeRange and selectedDate
    const filterByDate = (item) => {
      if (!item.lastInspected && !item.dateReported) return true;
      const itemDate = item.lastInspected || item.dateReported;
      if (!itemDate || !(itemDate instanceof Date) || isNaN(itemDate)) return true;
      
      const start = new Date(selectedDate);
      if (isNaN(start)) return true;
      
      if (timeRange === 'year') {
        return itemDate.getFullYear() === start.getFullYear();
      } else if (timeRange === 'quarter') {
        return itemDate.getFullYear() === start.getFullYear() &&
               Math.floor(itemDate.getMonth() / 3) === Math.floor(start.getMonth() / 3);
      } else { // month
        return itemDate.getFullYear() === start.getFullYear() &&
               itemDate.getMonth() === start.getMonth();
      }
    };

    // Update visible layers based on zoom level
    if (currentZoom < 13) {
      setVisibleLayers({
        superSections: true,
        sections: false,
        distress: false
      });
    } else if (currentZoom < 15) {
      setVisibleLayers({
        superSections: true,
        sections: true,
        distress: false
      });
    } else {
      setVisibleLayers({
        superSections: true,
        sections: true,
        distress: true
      });
    }
  }, [currentZoom, timeRange, selectedDate]);

  // Custom zoom handler component
  const ZoomHandler = () => {
    const map = useMap();
    
    useEffect(() => {
      const handleZoom = () => {
        const zoom = map.getZoom();
        console.log('Current zoom level:', zoom);
        setCurrentZoom(zoom);
        
        if (zoom < 13) {
          onZoomChange(0); // Super sections
        } else if (zoom < 15) {
          onZoomChange(1); // 10m sections
        } else {
          onZoomChange(2); // Distress level
        }
      };

      map.on('zoomend', handleZoom);
      handleZoom(); // Initial check

      return () => {
        map.off('zoomend', handleZoom);
      };
    }, [map]);

    return null;
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <MapContainer
        center={[51.52, -0.12]} // Adjusted center to better show the grid
        zoom={13}               // Adjusted initial zoom
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomHandler />
        
        {/* Super Sections - Always visible */}
        {visibleLayers.superSections && mockData[0].map((road) => (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            color="#1976d2"
            weight={6}
            opacity={0.9}
          >
            <Popup>
              <Paper elevation={0} sx={{ p: 1 }}>
                <Typography variant="h6">{road.name}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  Length: {superSectionMetadata.find(meta => meta.id === road.id)?.totalLength.toFixed(1)} km
                </Typography>
                <Typography variant="body2">
                  Condition: {superSectionMetadata.find(meta => meta.id === road.id)?.averageCondition}%
                </Typography>
              </Paper>
            </Popup>
          </Polyline>
        ))}

        {/* 10m Sections */}
        {visibleLayers.sections && mockData[1].map((section) => (
          <Polyline
            key={section.id}
            positions={section.coordinates}
            color={getConditionColor(section.condition)}
            weight={4}
            opacity={0.8}
          >
            <Popup>
              <Paper elevation={0} sx={{ p: 1 }}>
                <Typography variant="subtitle2">10m Section</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">Condition: {section.condition}%</Typography>
                <Typography variant="body2">
                  Last Inspected: {formatDate(section.lastInspected)}
                </Typography>
              </Paper>
            </Popup>
          </Polyline>
        ))}

        {/* Distress Points */}
        {visibleLayers.distress && mockData[2].map((point) => (
          <Circle
            key={point.id}
            center={point.position}
            radius={8}
            color={getDistressColor(point.type)}
            fillColor={getDistressColor(point.type)}
            fillOpacity={0.9}
            weight={2}
          >
            <Popup>
              <Paper elevation={0} sx={{ p: 1 }}>
                <Typography variant="subtitle2">
                  {point.type.charAt(0).toUpperCase() + point.type.slice(1).replace('_', ' ')}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">Severity: {point.severity}/5</Typography>
                <Typography variant="body2">Size: {point.size}m²</Typography>
                <Typography variant="body2">
                  Reported: {formatDate(point.dateReported)}
                </Typography>
              </Paper>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </Box>
  );
}

export default MapComponent; 