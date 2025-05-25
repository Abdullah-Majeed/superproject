import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, useMap, Popup, ZoomControl } from 'react-leaflet';
import { Box, Typography, Divider } from '@mui/material';
import { mockData, superSectionMetadata, pciColor } from './mockData';
import YearSelector from './components/YearSelector';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return 'N/A';
  return date.toLocaleDateString();
};

function MapComponent({ onZoomChange }) {
  const [currentZoom, setCurrentZoom] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [showDistress, setShowDistress] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    superSections: true,
    sections: false
  });

  // Memoize the current year's data to prevent unnecessary re-renders
  const currentYearData = useMemo(() => mockData[selectedYear], [selectedYear]);
  const { superSections, sections10m, distressPoints } = currentYearData;
  
  useEffect(() => {
    if (currentZoom < 13) {
      setVisibleLayers({
        superSections: true,
        sections: false
      });
    } else {
      setVisibleLayers({
        superSections: true,
        sections: true
      });
    }
  }, [currentZoom]);

  // Custom zoom handler component
  const ZoomHandler = () => {
    const map = useMap();
    
    useEffect(() => {
      const handleZoom = () => {
        const zoom = map.getZoom();
        setCurrentZoom(zoom);
        
        if (zoom < 13) {
          onZoomChange(0);
        } else {
          onZoomChange(1);
        }
      };

      map.on('zoomend', handleZoom);
      handleZoom();

      return () => {
        map.off('zoomend', handleZoom);
      };
    }, [map]);

    return null;
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleDistressToggle = (event) => {
    setShowDistress(event.target.checked);
  };

  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      '& .leaflet-control-zoom': {
        position: 'absolute',
        right: '20px',
        top: '20px'
      }
    }}>
      <YearSelector 
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        showDistress={showDistress}
        onDistressToggle={handleDistressToggle}
      />
      
      <MapContainer
        center={[51.4700, -0.4500]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false} // Disable default zoom control
      >
        <ZoomControl position="topright" /> {/* Add custom positioned zoom control */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomHandler />
        
        {visibleLayers.superSections && superSections.map((section) => {
          const meta = superSectionMetadata.find(m => m.id === section.id);
          return (
            <Polyline
              key={`${section.id}-${selectedYear}`}
              positions={section.coordinates}
              color={pciColor(section.condition)}
              weight={6}
              opacity={0.9}
            >
              <Popup>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {section.name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px' }}>
                    <Typography variant="caption" color="textSecondary">Condition:</Typography>
                    <Typography variant="caption">{section.condition}%</Typography>
                    <Typography variant="caption" color="textSecondary">Length:</Typography>
                    <Typography variant="caption">{meta?.totalLength.toFixed(1)} km</Typography>
                    <Typography variant="caption" color="textSecondary">Traffic:</Typography>
                    <Typography variant="caption">{meta?.trafficVolume.toLocaleString()}/day</Typography>
                    <Typography variant="caption" color="textSecondary">Inspected:</Typography>
                    <Typography variant="caption">{formatDate(section.lastInspected)}</Typography>
                  </Box>
                </Box>
              </Popup>
            </Polyline>
          );
        })}

        {visibleLayers.sections && sections10m.map((section) => (
          <Polyline
            key={`${section.id}-${selectedYear}`}
            positions={section.coordinates}
            color={pciColor(section.condition)}
            weight={4}
            opacity={0.8}
          >
            <Popup>
              <Box sx={{ minWidth: 150 }}>
                <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                  10m Section
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Condition: {section.condition}%
                </Typography>
              </Box>
            </Popup>
          </Polyline>
        ))}

        {showDistress && distressPoints.map((point) => (
          <Circle
            key={`${point.id}-${selectedYear}`}
            center={point.position}
            radius={6}
            color={pciColor(Math.max(0, 100 - point.severity * 20))}
            fillColor={pciColor(Math.max(0, 100 - point.severity * 20))}
            fillOpacity={0.9}
            weight={2}
          >
            <Popup>
              <Box sx={{ minWidth: 150 }}>
                <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                  {point.type.charAt(0).toUpperCase() + point.type.slice(1).replace('_', ' ')}
                </Typography>
                <Typography variant="body2">Severity: {point.severity}/5</Typography>
                <Typography variant="body2">Size: {point.size}m²</Typography>
              </Box>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </Box>
  );
}

export default MapComponent; 