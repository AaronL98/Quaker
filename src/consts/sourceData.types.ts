import type { FeatureCollection } from 'geojson';

export interface SourceData {
  id: string;
  data: FeatureCollection;
}
