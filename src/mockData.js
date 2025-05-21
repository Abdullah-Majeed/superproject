// Generate random distress types
const distressTypes = ['pothole', 'crack', 'rutting', 'raveling', 'bleeding', 'patching', 'edge_cracking'];

// Helper function to generate points along a line
const generatePointsAlongLine = (start, end, count) => {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const lat = start[0] + (end[0] - start[0]) * (i / count);
    const lng = start[1] + (end[1] - start[1]) * (i / count);
    points.push([lat, lng]);
  }
  return points;
};

// Helper function to generate a grid of coordinates
const generateGrid = (startLat, startLng, rows, cols, spacing) => {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid.push([startLat + i * spacing, startLng + j * spacing]);
    }
  }
  return grid;
};

// Generate super sections in a grid pattern
const generateSuperSections = () => {
  const sections = [];
  const baseGrid = generateGrid(51.5, -0.15, 5, 5, 0.01);
  
  // Create horizontal routes
  for (let i = 0; i < 5; i++) {
    const row = baseGrid.slice(i * 5, (i + 1) * 5);
    sections.push({
      id: `super-h-${i}`,
      name: `East-West Highway ${i + 1}`,
      coordinates: row
    });
  }
  
  // Create vertical routes
  for (let i = 0; i < 5; i++) {
    const col = [];
    for (let j = 0; j < 5; j++) {
      col.push(baseGrid[j * 5 + i]);
    }
    sections.push({
      id: `super-v-${i}`,
      name: `North-South Route ${i + 1}`,
      coordinates: col
    });
  }

  // Add some diagonal routes
  sections.push({
    id: 'super-d-1',
    name: 'Diagonal Express 1',
    coordinates: [
      [51.5, -0.15],
      [51.51, -0.14],
      [51.52, -0.13],
      [51.53, -0.12],
      [51.54, -0.11]
    ]
  });

  return sections;
};

// Generate 10m sections
const generate10mSections = (superSections) => {
  const sections = [];
  
  superSections.forEach(superSection => {
    // Generate more subsections between each pair of coordinates
    for (let i = 0; i < superSection.coordinates.length - 1; i++) {
      const start = superSection.coordinates[i];
      const end = superSection.coordinates[i + 1];
      
      // Create 10 subsections between each pair (instead of 5)
      for (let j = 0; j < 10; j++) {
        const subStart = [
          start[0] + (end[0] - start[0]) * (j / 10),
          start[1] + (end[1] - start[1]) * (j / 10)
        ];
        const subEnd = [
          start[0] + (end[0] - start[0]) * ((j + 1) / 10),
          start[1] + (end[1] - start[1]) * ((j + 1) / 10)
        ];
        
        sections.push({
          id: `${superSection.id}-section-${i}-${j}`,
          parentId: superSection.id,
          coordinates: [subStart, subEnd],
          condition: Math.floor(Math.random() * 100),
          lastInspected: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          videoUrl: `https://example.com/videos/${superSection.id}/section-${i}-${j}.mp4`
        });
      }
    }
  });
  
  return sections;
};

// Generate distress points
const generateDistressPoints = (sections) => {
  const points = [];
  
  sections.forEach(section => {
    // Add 3 distress points for each subsection (instead of 2)
    for (let i = 0; i < 3; i++) {
      const progress = (i + 1) / 4; // Distribute points along the section
      const point = [
        section.coordinates[0][0] + (section.coordinates[1][0] - section.coordinates[0][0]) * progress,
        section.coordinates[0][1] + (section.coordinates[1][1] - section.coordinates[0][1]) * progress
      ];
      
      points.push({
        id: `distress-${section.id}-${i}`,
        position: point,
        type: distressTypes[Math.floor(Math.random() * distressTypes.length)],
        severity: Math.floor(Math.random() * 5) + 1,
        size: Math.floor(Math.random() * 100) + 20,
        dateReported: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      });
    }
  });
  
  return points;
};

// Generate all data
const superSections = generateSuperSections();
const sections10m = generate10mSections(superSections);
const distressPoints = generateDistressPoints(sections10m);

// Export the mock data
export const mockData = {
  0: superSections,
  1: sections10m,
  2: distressPoints
};

// Additional metadata for each super section
export const superSectionMetadata = superSections.map(section => ({
  id: section.id,
  name: section.name,
  totalLength: Math.random() * 5 + 2,
  averageCondition: Math.floor(Math.random() * 100),
  lastMaintenance: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
  trafficVolume: Math.floor(Math.random() * 50000) + 10000
}));