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
        point.lat < -90 || point.lat > 90 || point.lon < -180 || point.lon > 180)) {
    throw new Error('Cities need unique integer IDs and valid latitude and longitude coordinates.');
  }
  cities = points.map(point => ({ ...point }));
  document.getElementById('route').replaceChildren();
  const markers = cities.map(city => {
    const [x, y] = project(city);
    const group = svgElement('g', { class: 'city' });
    const title = svgElement('title', {});
    title.textContent = `${city.id}${city.name ? `: ${city.name}` : ''}`;
    const circle = svgElement('circle', { cx: x, cy: y, r: 2, fill: '#1d4ed8', stroke: '#fff', 'stroke-width': 0.4 });
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
  const closedRoute = permutation.length > 1 ? [...permutation, permutation[0]] : permutation;
  const points = closedRoute.map(id => project(byId.get(id)).join(',')).join(' ');
  document.getElementById('route').replaceChildren(...(permutation.length < 2 ? [] : [svgElement('polyline', {
    points, fill: 'none', stroke: '#2563eb', 'stroke-width': 1.8,
    'stroke-linejoin': 'round', 'stroke-linecap': 'round'
  })]));
}

const N = 10;
const permutation = Array.from({ length: N }, (_, i) => i + 1);
const response = await fetch(new URL('./cities.tsv', import.meta.url), { cache: 'no-store' });
if (!response.ok) throw new Error(`Failed to load cities.tsv: ${response.status}`);
const rows = (await response.text()).trim().split(/\r?\n/);
if (!Number.isInteger(N) || N < 1 || N > rows.length) {
  throw new Error(`N must be an integer between 1 and ${rows.length}.`);
}
const selectedCities = rows.slice(0, N).map((row, id) => {
  const fields = row.split('\t');
  if (fields.length !== 3 || fields.some(field => !field.trim())) {
    throw new Error(`Invalid city data on row ${id + 1}.`);
  }
  const [name, lat, lon] = fields;
  return { id: id + 1, name, lat: Number(lat), lon: Number(lon) };
});

setCities(selectedCities);
drawRoute(permutation);
