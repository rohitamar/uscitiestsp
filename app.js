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
    title.textContent = city.name || String(city.id);
    const circle = svgElement('circle', { cx: x, cy: y, r: 2, fill: '#1d4ed8', stroke: '#fff', 'stroke-width': 0.4 });
    group.append(title, circle);
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

const form = document.getElementById('controls');
const nInput = document.getElementById('n');
const algorithmInput = document.getElementById('algorithm');
const status = document.getElementById('status');
let allCities = [];
let source = null;
let timer = null;
let queue = [];
let displayed = 0;
let lastDisplay = 0;

function stopPlayback() {
  source?.close();
  source = null;
  clearTimeout(timer);
  timer = null;
  queue = [];
}

function playNext() {
  if (timer !== null) return;
  if (queue.length === 0) return;
  const delay = Math.max(0, 300 - (Date.now() - lastDisplay));
  timer = setTimeout(() => {
    timer = null;
    try {
      const tour = queue.shift();
      drawRoute(tour.permutation);
      lastDisplay = Date.now();
      displayed += 1;
      status.textContent = `${tour.final ? 'Final tour' : `Tour ${displayed}`} with cost ${tour.cost.toFixed(2)}`;
      playNext();
    } catch (error) {
      stopPlayback();
      status.textContent = error.message;
    }
  }, delay);
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const N = Number(nInput.value);
  if (!Number.isInteger(N) || N < 1 || N > allCities.length) {
    status.textContent = `N must be between 1 and ${allCities.length}.`;
    return;
  }
  if (algorithmInput.value === 'dp' && N > 16) {
    status.textContent = 'Use at most 16 cities for dynamic programming.';
    return;
  }
  stopPlayback();
  displayed = 0;
  lastDisplay = 0;
  setCities(allCities.slice(0, N));
  status.textContent = 'Computing tours…';
  const params = new URLSearchParams({ n: N, algorithm: algorithmInput.value });
  source = new EventSource(`/routes?${params}`);
  source.onmessage = event => {
    try {
      queue.push(JSON.parse(event.data));
      playNext();
    } catch (error) {
      stopPlayback();
      status.textContent = error.message;
    }
  };
  source.addEventListener('done', () => {
    source.close();
    source = null;
    playNext();
  });
  source.onerror = () => {
    stopPlayback();
    status.textContent = 'Could not load tours. Check that the backend is running and try again.';
  };
});

try {
  const response = await fetch('/cities.tsv');
  if (!response.ok) throw new Error(`Failed to load cities: ${response.status}`);
  allCities = (await response.text()).trim().split(/\r?\n/).map((row, id) => {
    const [name, lat, lon] = row.split('\t');
    return { id, name, lat: Number(lat), lon: Number(lon) };
  });
  nInput.max = allCities.length;
  setCities(allCities.slice(0, Number(nInput.value)));
  document.getElementById('submit').disabled = false;
} catch (error) {
  status.textContent = error.message;
}
