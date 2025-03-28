import type { Layer, ExpressionSpecification, PaintSpecification } from 'mapbox-gl';

interface LayerConsts {
  [key: string]: Layer;
}
const magnitudeColorExpression: ExpressionSpecification = [
  'case',
  ['<', ['get', 'mag'], 3],
  '#008236', // Green for mag < 3
  ['all', ['>=', ['get', 'mag'], 3], ['<=', ['get', 'mag'], 5]],
  '#d08700', // Yellow for 3 ≤ mag ≤ 5
  ['>', ['get', 'mag'], 5],
  '#c10007', // Red for mag > 5
  '#FFFFFF', // Default color (optional, in case mag is missing)
];

const interpolatedMagnitudeColorExpression: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['get', 'mag'],
  0,
  '#fff',
  2,
  '#0f0',
  4,
  '#ffff00',
  6,
  '#f60',
  8,
  '#F00',
];

const interpolatedMagnitudeHeightExpression: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['get', 'mag'],
  0,
  0,
  2,
  50000,
  4,
  150000,
  6,
  400000,
  8,
  650000,
  10,
  1500000,
];

const interpolatedHeatmapColorExpression: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['heatmap-density'],
  0,
  'rgba(33,102,172,0)',
  0.2,
  'rgb(103,169,207)',
  0.4,
  'rgb(209,229,240)',
  0.6,
  'rgb(253,219,199)',
  0.8,
  'rgb(239,138,98)',
  1,
  'rgb(178,24,43)',
];

const basicPointStyle: PaintSpecification = {
  'circle-color': magnitudeColorExpression,
  'circle-radius': 6,
  'circle-stroke-width': 2,
  'circle-stroke-color': '#fff',
};

export const LAYERS: LayerConsts = {
  //All earthquakes
  EARTHQUAKES: {
    id: 'EARTHQUAKES',
    type: 'circle',
    source: 'earthquakes',
    paint: basicPointStyle,
  },
  //Earthquakes that are part of a cluster
  CLUSTERED_EARTHQUAKES: {
    id: 'CLUSTERED_EARTHQUAKES',
    type: 'circle',
    source: 'earthquakes-clustered',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#0ea5e9',
      'circle-radius': 20,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  },
  //Text layer for the cluster count on the clusters themselves
  CLUSTERED_EARTHQUAKES_COUNT: {
    id: 'CLUSTERED_EARTHQUAKES_COUNT',
    type: 'symbol',
    source: 'earthquakes-clustered',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#fff',
    },
  },
  //Earthquakes that are not part of a cluster
  CLUSTERED_EARTHQUAKE_UNCLUSTERED_POINTS: {
    id: 'CLUSTERED_EARTHQUAKE_UNCLUSTERED_POINTS',
    type: 'circle',
    source: 'earthquakes-clustered',
    filter: ['!', ['has', 'point_count']],
    paint: basicPointStyle,
  },
  //3D extrusion of earthquake magnitudes
  THREE_D_MAGNITUDES: {
    id: 'THREE_D_MAGNITUDES',
    type: 'fill-extrusion',
    source: 'earthquakes-magnitude-polygons',
    paint: {
      'fill-extrusion-base': 0,
      //Height based on magnitude
      'fill-extrusion-height': interpolatedMagnitudeHeightExpression,
      'fill-extrusion-color': interpolatedMagnitudeColorExpression,
      'fill-extrusion-vertical-gradient': false,
    },
  },
  HEATMAP: {
    id: 'HEATMAP',
    type: 'heatmap',
    source: 'earthquakes',

    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      'heatmap-color': interpolatedHeatmapColorExpression,
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
    },
  },
};

//Layers with clustered source do not have the properties we need to filter on layer, so filtering happens at source level
export const EXCLUDED_FILTER_LAYERS = [
  LAYERS.CLUSTERED_EARTHQUAKES.id,
  LAYERS.CLUSTERED_EARTHQUAKES_COUNT.id,
  LAYERS.CLUSTERED_EARTHQUAKE_UNCLUSTERED_POINTS.id,
];
