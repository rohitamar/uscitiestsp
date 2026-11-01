const cities = [
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
  {id:12,name:'Boston',lat:42.3601,lon:-71.0589},
  {id:13,name:'Anchorage',lat:61.2181,lon:-149.9003},
  {id:14,name:'Honolulu',lat:21.3099,lon:-157.8581}
];

function project({lat,lon}) {
  if (lat > 50) return [(lon + 180) * 5 + 40, (72 - lat) * 5 + 430];
  if (lon < -130) return [(lon + 161) * 20 + 330, (23 - lat) * 20 + 480];
  return [(lon + 125) * 15 + 45, (50 - lat) * 17 + 40];
}

function svgElement(tag, attributes) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name,value] of Object.entries(attributes)) element.setAttribute(name,value);
  return element;
}

function drawRoute(permutation) {
  if (!Array.isArray(permutation) || permutation.length !== cities.length ||
      new Set(permutation).size !== cities.length ||
      permutation.some(id => !Number.isInteger(id) || !cities.some(city => city.id === id))) {
    throw new Error(`Use every city ID from 1 to ${cities.length} exactly once.`);
  }
  const points = permutation.map(id => project(cities.find(city => city.id === id)).join(',')).join(' ');
  document.getElementById('route').replaceChildren(svgElement('polyline', {
    points, fill:'none', stroke:'#cc803b', 'stroke-width':3, 'stroke-linejoin':'round', 'stroke-linecap':'round'
  }));
  document.getElementById('route-count').textContent = `${permutation.length - 1} connections`;
  document.getElementById('status').textContent = `Route: ${permutation.join(' → ')}`;
  return permutation.slice();
}

window.drawRoute = drawRoute;

for (const city of cities) {
  const [cx,cy] = project(city);
  const group = svgElement('g', {});
  const title = svgElement('title', {});
  title.textContent = `${city.id}: ${city.name}`;
  const circle = svgElement('circle', {cx,cy,r:13,fill:'#235b49',stroke:'#fff','stroke-width':2});
  const label = svgElement('text', {x:cx,y:cy,'text-anchor':'middle','dominant-baseline':'central',fill:'white','font-size':11,'font-family':'system-ui','font-weight':700});
  label.textContent = city.id;
  group.append(title,circle,label);
  document.getElementById('points').append(group);
  const item = document.createElement('li');
  const number = document.createElement('span');
  number.textContent = city.id;
  item.append(number,document.createTextNode(city.name));
  document.getElementById('city-list').append(item);
}

document.getElementById('route-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const input = document.getElementById('permutation').value.trim();
    if (!/^\d+(?:(?:\s*,\s*|\s+)\d+)*$/.test(input)) throw new Error('Enter city numbers separated by commas or spaces.');
    drawRoute(input.split(/[\s,]+/).map(Number));
  } catch (error) {
    document.getElementById('status').textContent = error.message;
  }
});

document.getElementById('clear').addEventListener('click', () => {
  document.getElementById('route').replaceChildren();
  document.getElementById('route-count').textContent = '0 connections';
  document.getElementById('status').textContent = 'Lines cleared. Enter a permutation to draw a new route.';
});

drawRoute(cities.map(city => city.id));
