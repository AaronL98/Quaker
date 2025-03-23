import { LAYERS } from '@/consts/layers';

export interface Visualisation {
  id: string;
  name: string;
  description: string;
  icon: string;
  layers: string[];
  dimension: '3D' | '2D';
}

interface VisualisationConsts {
  [key: string]: Visualisation;
}
export const VISUALISATION: VisualisationConsts = {
  NONE: {
    id: 'NONE',
    name: 'None',
    description: 'Earthquakes plotted as regular points',
    icon: 'mdi-scatter-plot',
    layers: [LAYERS.EARTHQUAKES.id],
    dimension: '2D',
  },
  CLUSTER: {
    id: 'CLUSTER',
    name: 'Cluster',
    description: 'Earthquakes clustered together based on proximity',
    icon: 'mdi-chart-bubble',
    layers: [
      LAYERS.CLUSTERED_EARTHQUAKES.id,
      LAYERS.CLUSTERED_EARTHQUAKES_COUNT.id,
      LAYERS.CLUSTERED_EARTHQUAKE_UNCLUSTERED_POINTS.id,
    ],
    dimension: '2D',
  },
  //   HEATMAP: {
  //     id: 'heatmap',
  //     name: 'Heatmap',
  //     description: 'Heatmap of earthquakes showing areas of high activity',
  //     icon: 'mdi-fire',
  //     layers: [],
  //   },
  THREE_D_MAGNITUDES: {
    id: 'THREE_D_MAGNITUDES',
    name: '3D Magnitudes',
    description: '3D extrusions based on earthquake magnitudes',
    icon: 'mdi-cube',
    layers: [LAYERS.THREE_D_MAGNITUDES.id],
    dimension: '3D',
  },
} as const;
