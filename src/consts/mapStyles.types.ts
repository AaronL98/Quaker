import streetsPreview from '@/assets/mapPreviews/streets-v12.png';
import lightPreview from '@/assets/mapPreviews/light-v10.png';
import darkPreview from '@/assets/mapPreviews/dark-v10.png';
import satellitePreview from '@/assets/mapPreviews/satellite-v9.png';

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
    img: streetsPreview,
  },
  LIGHT: {
    name: 'Mapbox Light',
    url: 'mapbox://styles/mapbox/light-v10',
    username: 'mapbox',
    id: 'light-v10',
    img: lightPreview,
  },
  DARK: {
    name: 'Mapbox Dark',
    url: 'mapbox://styles/mapbox/dark-v10',
    username: 'mapbox',
    id: 'dark-v10',
    img: darkPreview,
  },
  SATELLITE: {
    name: 'Mapbox Satellite',
    url: 'mapbox://styles/mapbox/satellite-v9',
    username: 'mapbox',
    id: 'satellite-v9',
    img: satellitePreview,
  },
} as const;

export const MAP_STYLES_LIST = Object.values(MAP_STYLES);
