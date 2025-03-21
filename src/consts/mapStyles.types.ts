export interface MapStyle {
  name: string;
  url: string;
}

export const MAP_STYLES = {
  STREETS: {
    name: 'Mapbox Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    username: 'mapbox',
    id: 'streets-v12',
  },
  LIGHT: {
    name: 'Mapbox Light',
    url: 'mapbox://styles/mapbox/light-v10',
    username: 'mapbox',
    id: 'light-v10',
  },
  DARK: {
    name: 'Mapbox Dark',
    url: 'mapbox://styles/mapbox/dark-v10',
    username: 'mapbox',
    id: 'dark-v10',
  },
  SATELLITE: {
    name: 'Mapbox Satellite',
    url: 'mapbox://styles/mapbox/satellite-v9',
    username: 'mapbox',
    id: 'satellite-v9',
  },
} as const;

export const MAP_STYLES_LIST = Object.values(MAP_STYLES);
