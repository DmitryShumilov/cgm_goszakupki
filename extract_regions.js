const fs = require('fs');

const json = JSON.parse(fs.readFileSync('frontend_map/public/simple_map.geojson', 'utf8'));
const names = json.features
  .map(f => f.properties.name)
  .filter(n => n)
  .sort((a, b) => a.localeCompare(b));

console.log('=== Регионы в GeoJSON (simple_map.geojson) ===\n');
names.forEach((name, i) => {
  console.log(`${i + 1}. ${name}`);
});

console.log(`\nВсего: ${names.length} регионов`);
