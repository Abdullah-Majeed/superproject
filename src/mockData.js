export const distressTypes = [
    'Pothole',
    'Crack',
    'Subsidence/Depression',
    'Ravelling',
    'Patch',
    'Manhole',
    'Bleeding',
    'Corrugation/Shoving',
    'Polished aggregate',
    'Water bleeding and pumping',
    'Vegetation',
    'Edge deterioration',
    'Crack Seal'
];

export const pciColor = (score = 0) => {
    if (Math.round(score) >= 0 && Math.round(score) <= 20) return 'red';
    if (Math.round(score) >= 21 && Math.round(score) <= 40) return 'darkorange';
    if (Math.round(score) >= 41 && Math.round(score) <= 60) return 'yellow';
    if (Math.round(score) >= 61 && Math.round(score) <= 80) return '#57C018';
    return 'darkgreen';
};

export const generateWeightedPCI = (year = 2025, isAirport = false) => {
    // Airport sections generally maintain better conditions due to strict regulations
    const rand = Math.random();
    if (year === 2023) { 
        if (isAirport) {
            if (rand < 0.6) return Math.floor(Math.random() * 21); // 60% very poor
            return Math.floor(Math.random() * 20) + 21; // 40% poor
        } else {
            if (rand < 0.8) return Math.floor(Math.random() * 21); // 80% very poor
            return Math.floor(Math.random() * 20) + 21; // 20% poor
        }
    } else if (year === 2024) { 
        if (isAirport) {
            if (rand < 0.3) return Math.floor(Math.random() * 21); // 30% very poor
            if (rand < 0.6) return Math.floor(Math.random() * 20) + 21; // 30% poor
            return Math.floor(Math.random() * 20) + 41; // 40% fair
        } else {
            if (rand < 0.4) return Math.floor(Math.random() * 21); // 40% very poor
            if (rand < 0.8) return Math.floor(Math.random() * 20) + 21; // 40% poor
            return Math.floor(Math.random() * 20) + 41; // 20% fair
        }
    } else { // 2025
        if (isAirport) {
            if (rand < 0.1) return Math.floor(Math.random() * 20) + 21; // 10% poor
            if (rand < 0.3) return Math.floor(Math.random() * 20) + 41; // 20% fair
            if (rand < 0.7) return Math.floor(Math.random() * 20) + 61; // 40% good
            return Math.floor(Math.random() * 20) + 81; // 30% excellent
        } else {
            if (rand < 0.2) return Math.floor(Math.random() * 20) + 21; // 20% poor
            if (rand < 0.5) return Math.floor(Math.random() * 20) + 41; // 30% fair
            if (rand < 0.8) return Math.floor(Math.random() * 20) + 61; // 30% good
            return Math.floor(Math.random() * 20) + 81; // 20% excellent
        }
    }
};

const generateBaseSuperSections = () => {
    return [
        {
            id: 'super-heathrow',
            name: 'Heathrow Airport Complex',
            coordinates: [
                // Terminal 2 area
                [51.4714, -0.4527], [51.4720, -0.4520], [51.4725, -0.4515],
                // Terminal 3 area
                [51.4730, -0.4550], [51.4735, -0.4545], [51.4740, -0.4540],
                // Terminal 4 area
                [51.4590, -0.4430], [51.4585, -0.4425], [51.4580, -0.4420],
                // Terminal 5 area
                [51.4775, -0.4900], [51.4770, -0.4895], [51.4765, -0.4890],
                // Main taxiways
                [51.4700, -0.4600], [51.4695, -0.4595], [51.4690, -0.4590],
                // Connection roads
                [51.4680, -0.4570], [51.4675, -0.4565], [51.4670, -0.4560]
            ],
            type: 'airport'
        }
    ];
};

const generateDistressPoint = (coordinates, year, isAirport) => {
    const [lat, lng] = coordinates;
    const latOffset = (Math.random() - 0.5) * 0.0002;
    const lngOffset = (Math.random() - 0.5) * 0.0002;
    
    const type = distressTypes[Math.floor(Math.random() * distressTypes.length)];
    const severity = Math.floor(Math.random() * 5) + 1;
    const size = Math.floor(Math.random() * (isAirport ? 5 : 10)) + 1; // Airport distresses tend to be smaller
    
    return {
        id: `distress-${lat}-${lng}-${type}`,
        position: [lat + latOffset, lng + lngOffset],
        type,
        severity,
        size,
        yearOfData: year,
        dateReported: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        color: pciColor(Math.max(0, 100 - severity * 20))
    };
};

const generate10mSections = (superSection, year) => {
    const sections = [];
    const coordinates = superSection.coordinates;
    const isAirport = superSection.type === 'airport';
    
    for (let i = 0; i < coordinates.length - 1; i++) {
        const start = coordinates[i];
        const end = coordinates[i + 1];
        
        // Calculate distance and number of sections
        const dist = Math.sqrt(
            Math.pow((end[0] - start[0]) * 111000, 2) + 
            Math.pow((end[1] - start[1]) * 111000 * Math.cos(start[0] * Math.PI / 180), 2)
        );
        const numSections = Math.max(1, Math.floor(dist / 10));
        
        for (let j = 0; j < numSections; j++) {
            const ratio = j / numSections;
            const lat = start[0] + (end[0] - start[0]) * ratio;
            const lng = start[1] + (end[1] - start[1]) * ratio;
            
            const baseCondition = generateWeightedPCI(year, isAirport);
            const localVariation = Math.floor(Math.random() * 11) - 5;
            const condition = Math.max(0, Math.min(100, baseCondition + localVariation));
                
                sections.push({
                id: `10m-${superSection.id}-${i}-${j}`,
                    parentId: superSection.id,
                coordinates: [
                    [lat, lng],
                    [
                        lat + (end[0] - start[0]) / numSections,
                        lng + (end[1] - start[1]) / numSections
                    ]
                ],
                condition,
                    color: pciColor(condition),
                yearOfData: year,
                lastInspected: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                type: superSection.type
                });
            }
        }
    
    return sections;
};

const generateYearData = (year) => {
    const superSections = generateBaseSuperSections().map(section => ({
        ...section,
        yearOfData: year,
        condition: generateWeightedPCI(year, section.type === 'airport'),
        lastInspected: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }));

    const sections10m = superSections.flatMap(section => generate10mSections(section, year));
    
    const distressPoints = sections10m
        .filter(section => section.condition < 40)
        .flatMap(section => {
            const numPoints = Math.floor(Math.random() * 3) + 1;
            return Array(numPoints).fill().map(() => 
                generateDistressPoint(section.coordinates[0], year, section.type === 'airport')
            );
        });

    return {
        superSections,
        sections10m,
        distressPoints
    };
};

export const mockData = {
    2023: generateYearData(2023),
    2024: generateYearData(2024),
    2025: generateYearData(2025)
};

export const superSectionMetadata = generateBaseSuperSections().map(section => ({
    id: section.id,
    name: section.name,
    totalLength: section.type === 'airport' ? 25.5 : 1.2,
    trafficVolume: section.type === 'airport' ? 1500 : 45000,
    roadType: section.type === 'airport' ? 'Airport Internal Roads & Gates' : 'Major City Highway'
}));