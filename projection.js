export function project({lat, lon}) {
  const radians = Math.PI / 180;
  const n = 0.6028370046288244;
  const c = 1.351221325417899;
  const rho = Math.sqrt(c - 2 * n * Math.sin(lat * radians)) / n;
  const theta = n * (lon + 96) * radians;
  return [rho * Math.sin(theta) * 1473.9540602993602 + 611.5633559258118, 387.6846821344867 - (1.2944500917315158 - rho * Math.cos(theta)) * 1473.9540602993602];
}
