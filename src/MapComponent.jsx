import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, useMap, Popup, ZoomControl, Marker, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Box, Typography, Divider } from '@mui/material';
import L from 'leaflet';
import { mockData, superSectionMetadata, pciColor } from './mockData';
import YearSelector from './components/YearSelector';
import VideoPlayer from './components/VideoPlayer';
import 'leaflet/dist/leaflet.css';
// import 'react-leaflet-cluster/lib/styles.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom car icon with embedded SVG data URL
const carIconUrl = 'data:image/svg+xml;base64,' + btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="12" width="20" height="10" rx="2" fill="#1976d2"/>
  <rect x="8" y="14" width="4" height="6" rx="1" fill="#ffffff"/>
  <rect x="20" y="14" width="4" height="6" rx="1" fill="#ffffff"/>
  <circle cx="10" cy="22" r="2" fill="#333333"/>
  <circle cx="22" cy="22" r="2" fill="#333333"/>
</svg>`);

const customCarIcon = new L.Icon({
  iconUrl: carIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return 'N/A';
  return date.toLocaleDateString();
};

// Custom map controller to maintain zoom and center
const MapController = ({ selectedYear }) => {
  const map = useMap();
  const prevYear = useRef(selectedYear);

  useEffect(() => {
    if (prevYear.current !== selectedYear) {
      // Store current zoom and center
      const currentZoom = map.getZoom();
      const currentCenter = map.getCenter();

      // After data update, restore the view
      requestAnimationFrame(() => {
        map.setView(currentCenter, currentZoom, { animate: false });
      });

      prevYear.current = selectedYear;
    }
  }, [selectedYear, map]);

  return null;
};

// Map follower component to keep the marker centered
const MapFollower = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.panTo(position, { 
        animate: true,
        duration: 1,
        easeLinearity: 0.5
      });
    }
  }, [map, position]);

  return null;
};

function MapComponent({ onZoomChange }) {
  const [currentZoom, setCurrentZoom] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [showDistress, setShowDistress] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoPosition, setVideoPosition] = useState(null);
  const [currentPathCoordinates, setCurrentPathCoordinates] = useState([]);
  const [visibleLayers, setVisibleLayers] = useState({
    superSections: true,
    sections: false
  });

  // Memoize the current year's data to prevent unnecessary re-renders
  const currentYearData = useMemo(() => mockData[selectedYear], [selectedYear]);
  const { superSections, sections10m, distressPoints } = currentYearData;

  // Find the nearest section's condition for each distress point
  const memoizedDistressPoints = useMemo(() => {
    if (!showDistress) return [];

    return distressPoints.map(point => {
      // Find the nearest section to get its condition
      const nearestSection = sections10m.find(section => {
        const [lat, lng] = point.position;
        return section.coordinates.some(coord =>
          Math.abs(coord[0] - lat) < 0.0001 && Math.abs(coord[1] - lng) < 0.0001
        );
      });

      return {
        ...point,
        color: pciColor(nearestSection?.condition || 50)
      };
    });
  }, [distressPoints, sections10m, showDistress]);

  // Memoize sections data
  const memoizedSections = useMemo(() => {
    if (!visibleLayers.sections) return [];
    return sections10m.map(section => ({
      ...section,
      color: pciColor(section.condition)
    }));
  }, [sections10m, visibleLayers.sections]);

  // Memoize super sections data
  const memoizedSuperSections = useMemo(() => {
    if (!visibleLayers.superSections) return [];
    return superSections.map(section => ({
      ...section,
      color: pciColor(section.condition),
      meta: superSectionMetadata.find(m => m.id === section.id)
    }));
  }, [superSections, visibleLayers.superSections]);

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

  // Get all coordinates from visible sections for the video path
  useEffect(() => {
    let allCoords = [];
    if (visibleLayers.sections && sections10m) {
      // If zoomed in, use detailed 10m sections
      allCoords = sections10m.reduce((acc, section) => {
        return acc.concat(section.coordinates);
      }, []);
    } else if (superSections) {
      // Otherwise use super sections
      allCoords = superSections.reduce((acc, section) => {
        return acc.concat(section.coordinates);
      }, []);
    }
    setCurrentPathCoordinates(allCoords);
  }, [sections10m, superSections, visibleLayers.sections]);

  const ZoomHandler = useCallback(() => {
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
  }, [onZoomChange]);

  const handleYearChange = useCallback((event) => {
    const newYear = parseInt(event.target.value);
    setSelectedYear(newYear);
  }, []);

  const handleDistressToggle = useCallback((event) => {
    setShowDistress(event.target.checked);
    if (!event.target.checked) {
      setShowVideo(false);
    }
  }, []);

  const handleVideoToggle = useCallback((event) => {
    setShowVideo(event.target.checked);
  }, []);

  // Calculate video marker position based on video progress
  const handleVideoPositionUpdate = useCallback((progress) => {
    if (!currentPathCoordinates || currentPathCoordinates.length === 0) return;

    const totalPoints = currentPathCoordinates.length;
    const currentIndex = Math.min(Math.floor((progress / 100) * totalPoints), totalPoints - 1);
    
    setVideoPosition(currentPathCoordinates[currentIndex]);
  }, [currentPathCoordinates]);

  // Initialize video position at the start of the path
  useEffect(() => {
    if (currentPathCoordinates && currentPathCoordinates.length > 0) {
      setVideoPosition(currentPathCoordinates[0]);
    }
  }, [currentPathCoordinates]);

  const yearSelectorComponent = useMemo(() => (
    <YearSelector
      selectedYear={selectedYear}
      onYearChange={handleYearChange}
      showDistress={showDistress}
      onDistressToggle={handleDistressToggle}
      showVideo={showVideo}
      onVideoToggle={handleVideoToggle}
    />
  ), [selectedYear, showDistress, showVideo, handleYearChange, handleDistressToggle, handleVideoToggle]);

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
      {yearSelectorComponent}

      <MapContainer
        center={[51.4700, -0.4500]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <MapController selectedYear={selectedYear} />
        <ZoomControl position="topright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomHandler />

        {memoizedSuperSections.map((section) => (
          <Polyline
            key={`${section.id}-${selectedYear}`}
            positions={section.coordinates}
            color={section.color}
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
                  <Typography variant="caption">{section.meta?.totalLength.toFixed(1)} km</Typography>
                  <Typography variant="caption" color="textSecondary">Traffic:</Typography>
                  <Typography variant="caption">{section.meta?.trafficVolume.toLocaleString()}/day</Typography>
                  <Typography variant="caption" color="textSecondary">Inspected:</Typography>
                  <Typography variant="caption">{formatDate(section.lastInspected)}</Typography>
                </Box>
              </Box>
            </Popup>
          </Polyline>
        ))}

        {memoizedSections.map((section) => (
          <Polyline
            key={`${section.id}-${selectedYear}`}
            positions={section.coordinates}
            color={section.color}
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

        {showDistress && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={40}
            spiderfyOnMaxZoom={true}
            polygonOptions={{
              fillColor: '#1976d2',
              color: '#1976d2',
              weight: 0.5,
              opacity: 1,
              fillOpacity: 0.3
            }}
          >
            {memoizedDistressPoints.map((point) => (
              <Circle
                key={`${point.id}-${selectedYear}`}
                center={point.position}
                radius={3}
                color={point.color}
                fillColor={point.color}
                fillOpacity={0.9}
                weight={1}
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
          </MarkerClusterGroup>
        )}

        {videoPosition && showVideo && (
          <>
            <CircleMarker 
              center={videoPosition}
              radius={10}
              color="black"
              weight={3}
              fillColor="white"
              fillOpacity={1}
              zIndexOffset={1000}
            >
              <Popup>
                <Typography variant="body2">
                  Current Video Location
                </Typography>
              </Popup>
            </CircleMarker>
            <MapFollower position={videoPosition} />
          </>
        )}
      </MapContainer>

      {showVideo && (
        <VideoPlayer
          onClose={() => setShowVideo(false)}
          onCarPositionUpdate={handleVideoPositionUpdate}
        />
      )}
    </Box>
  );
}

export default MapComponent; 