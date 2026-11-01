import { project } from './projection.js';

let cities = [];

function svgElement(tag, attributes) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}

export function setCities(points) {
  if (!Array.isArray(points) || new Set(points.map(point => point.id)).size !== points.length ||
      points.some(point => !Number.isInteger(point.id) || !Number.isFinite(point.lat) || !Number.isFinite(point.lon) ||
        point.lat < 24 || point.lat > 50 || point.lon < -125 || point.lon > -66)) {
    throw new Error('Cities need unique integer IDs and coordinates within the contiguous US.');
  }
  cities = points.map(point => ({ ...point }));
  document.getElementById('route').replaceChildren();
  const markers = cities.map(city => {
    const [x, y] = project(city);
    const group = svgElement('g', {});
    const title = svgElement('title', {});
    title.textContent = `${city.id}${city.name ? `: ${city.name}` : ''}`;
    const circle = svgElement('circle', { cx: x, cy: y, r: 4, fill: '#1d4ed8', stroke: '#fff', 'stroke-width': 1.2 });
    const label = svgElement('text', {
      x: x + 7, y: y - 7, fill: '#172554', 'font-size': 12, 'font-family': 'system-ui',
      'font-weight': 600, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke'
    });
    label.textContent = city.id;
    group.append(title, circle, label);
    return group;
  });
  document.getElementById('points').replaceChildren(...markers);
}

export function drawRoute(permutation) {
  const byId = new Map(cities.map(city => [city.id, city]));
  if (!Array.isArray(permutation) || permutation.length !== cities.length ||
      new Set(permutation).size !== cities.length || permutation.some(id => !byId.has(id))) {
    throw new Error('The permutation must contain every city ID exactly once.');
  }
  const points = permutation.map(id => project(byId.get(id)).join(',')).join(' ');
  document.getElementById('route').replaceChildren(...(permutation.length < 2 ? [] : [svgElement('polyline', {
    points, fill: 'none', stroke: '#2563eb', 'stroke-width': 1.8,
    'stroke-linejoin': 'round', 'stroke-linecap': 'round'
  })]));
}

setCities([
  {id:1,name:'Seattle',lat:47.6062,lon:-122.3321},
  {id:2,name:'San Francisco',lat:37.7749,lon:-122.4194},
  {id:3,name:'Los Angeles',lat:34.0522,lon:-118.2437},
  {id:4,name:'Las Vegas',lat:36.1699,lon:-115.1398},
  {id:5,name:'Denver',lat:39.7392,lon:-104.9903},
  {id:6,name:'Dallas',lat:32.7767,lon:-96.797},
  {id:7,name:'Chicago',lat:41.8781,lon:-87.6298},
  {id:8,name:'Atlanta',lat:33.749,lon:-84.388},
  {id:9,name:'Miami',lat:25.7617,lon:-80.1918},
  {id:10,name:'Washington, DC',lat:38.9072,lon:-77.0369},
  {id:11,name:'New York',lat:40.7128,lon:-74.006},
  {id:12,name:'Boston',lat:42.3601,lon:-71.0589}
]);
