const fs = require('fs');
const path = require('path');

const publicPath = path.join(__dirname, 'frontend_map', 'public');

console.log('\n=== GeoJSON Analysis ===\n');

const files = [
  { name: 'russia_regions.geojson', label: 'File 1' },
  { name: 'simple_map.geojson', label: 'File 2' }
];

files.forEach(({ name, label }) => {
  const filePath = path.join(publicPath, name);
  const size = fs.statSync(filePath).size;
  const sizeMB = (size / 1024 / 1024).toFixed(2);
  
  console.log(`${label}: ${name} (${sizeMB} MB)`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    console.log(`  Type: ${json.type}`);
    console.log(`  Features count: ${json.features.length}`);
    
    if (json.features.length > 0) {
      const first = json.features[0];
      console.log(`  First region: ${first.properties?.name || 'N/A'}`);
      console.log(`  Properties: ${Object.keys(first.properties || {}).join(', ')}`);
      console.log(`  Geometry type: ${first.geometry?.type || 'N/A'}`);
    }
    
    // Check for Russia regions
    const rusRegions = json.features.filter(f => 
      f.properties?.name && f.properties.name.includes('Москва')
    );
    console.log(`  Contains Москва: ${rusRegions.length > 0 ? 'Yes' : 'No'}`);
    
    // Get sample of region names
    console.log(`  Sample regions:`);
    json.features.slice(0, 5).forEach(f => {
      if (f.properties?.name) {
        console.log(`    - ${f.properties.name}`);
      }
    });
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
  
  console.log('');
});

console.log('=== Recommendation ===');
console.log('Choose the file with:');
console.log('  - Good balance of size vs detail');
console.log('  - Proper Russian region names');
console.log('  - Reasonable feature count (~80-90 for Russia regions)');
