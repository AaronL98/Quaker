import { ref } from 'vue';
import { defineStore } from 'pinia';

import type { FeatureCollection } from 'geojson';
import type { SourceData } from '@/consts/sourceData.types';

import { useEarthquakeStateStore } from '@/stores/earthquakeStateStore';

//This store will hold source data that can be added to the map. The ID in here does not need to match the ID of the mapbox source.
export const useSourceDataStore = defineStore('sources', () => {
  const sourceData = ref<SourceData[]>([]);

  //Actions
  const addSourceData = (data: SourceData) => {
    sourceData.value.push(data);
  };

  const deleteSourceData = (data: SourceData) => {
    sourceData.value = sourceData.value.filter((s) => s.id !== data.id);
  };

  //Getters
  const getSourceData = (sourceDataId: SourceData['id']): SourceData | undefined => {
    return sourceData.value.find((s) => s.id === sourceDataId);
  };

  //Filtered geojson source
  const getFilteredSourceData = (sourceDataId: SourceData['id']): FeatureCollection => {
    const earthquakeStateStore = useEarthquakeStateStore();

    const geojson = sourceData.value.find((s) => s.id === sourceDataId)?.data as
      | { features?: any[] }
      | undefined;

    const features = geojson?.features || [];

    // Apply the filters based on the search term and date range
    const filteredFeatures = features.filter((feature: any) => {
      // Apply search filter if search term is provided
      if (
        earthquakeStateStore.filterSearchTerm &&
        earthquakeStateStore.filterSearchTerm.trim() !== ''
      ) {
        const searchTerm = earthquakeStateStore.filterSearchTerm.toLowerCase();
        const place = feature.properties?.place?.toLowerCase() || '';

        if (!place.includes(searchTerm)) {
          return false; // Filter out if the place doesn't include the search term
        }
      }

      // Apply date filtering
      if (earthquakeStateStore.filterDates?.length === 2) {
        const earthquakeDate = new Date(feature.properties?.time);

        const startDate = new Date(earthquakeStateStore.filterDateFromTimestamp);
        const endDate = new Date(earthquakeStateStore.filterDateToTimestamp);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (earthquakeDate < startDate || earthquakeDate > endDate) {
          return false;
        }
      }

      return true;
    });

    return {
      ...geojson,
      type: 'FeatureCollection',
      features: filteredFeatures,
    };
  };

  return { sourceData, addSourceData, deleteSourceData, getSourceData, getFilteredSourceData };
});
