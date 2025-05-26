import React from 'react';
import { CircleMarker } from 'react-leaflet';

const CarMarker = ({ position }) => {
  return (
    <CircleMarker
      center={position}
      radius={6}
      color="black"
      fillColor="white"
      fillOpacity={1}
      weight={2}
    />
  );
};

export default CarMarker; 