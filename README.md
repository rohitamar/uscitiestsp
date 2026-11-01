# TSP on United States cities

## US Route Explorer

Open `index.html` in a browser. No installation, server, API key, or internet connection is required.

The page shows 14 numbered sample cities, including Anchorage and Honolulu. Enter a permutation in the text box and select **Draw route**, or call the global function in the browser console:

```js
drawRoute([1, 3, 2, 4, 6, 5, 7, 8, 9, 10, 12, 11, 13, 14]);
```

The function requires an array containing every numeric city ID exactly once. It throws an error for invalid input and keeps the previous route intact. Each successful call replaces the previous route. Lines connect consecutive entries without returning to the start. Alaska and Hawaii use insets, so connecting segments are schematic rather than geographic great-circle routes.

Edit the `cities` array in `app.js` to change the points. Coordinates use longitude and latitude. The HTML example and input must also be updated if the number of cities changes.

The bundled `us-map.svg` is derived from the public-domain US country boundary in [world.geo.json](https://github.com/johan/world.geo.json/blob/master/countries/USA.geo.json). The map and points use the same projection, with separate inset transforms for Alaska and Hawaii.
