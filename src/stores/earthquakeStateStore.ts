import { defineStore, storeToRefs } from 'pinia';
import { ref, computed, watch } from 'vue';

import { useMapStore } from '@/stores/mapStore';
import { useSourceDataStore } from '@/stores/sourceDataStore';

import { LAYERS, EXCLUDED_FILTER_LAYERS } from '@/consts/layers';
import { VISUALISATION } from '@/consts/visualisations';
import type { Layer, Source, GeoJSONSource, ExpressionSpecification, Map, Layer } from 'mapbox-gl';

export const useEarthquakeStateStore = defineStore('earthquakeState', () => {
  const selectedEarthquakeId = ref<string | null>();
  const filterSearchTerm = ref<string>('');
  const filterDates = ref<Date[]>([]);

  const filterDateFromTimestamp = computed<number>(() => {
    return filterDates.value[0]?.getTime();
  });

  const filterDateToTimestamp = computed<number>(() => {
    return filterDates.value[1]?.getTime();
  });

  const updateLayerFilter = (map: Map, layerId: Layer['id']) => {
    //Some layers already have filters in the consts
    const existingFilters = LAYERS[layerId].filter || (null as ExpressionSpecification | null);
    const filters: ExpressionSpecification[] = [];

    //Search filter
    if (filterSearchTerm.value) {
      filters.push([
        'all',
        ['has', 'place'], // Ensure 'place' exists
        [
          'in',
          filterSearchTerm.value.toLowerCase(), // Search term in lowercase
          ['downcase', ['get', 'place']], // Convert 'place' to lowercase
        ],
      ]);
    }

    //Date range filter
    if (filterDates.value?.length === 2) {
      const startDate = new Date(filterDateFromTimestamp.value);
      //To be consistent with the list filtering, the date timestamp should start at 00:00:00
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(filterDateToTimestamp.value);
      //To be consistent with the list filtering, the date timestamp should end at 23:59:59
      endDate.setHours(23, 59, 59, 999);

      filters.push([
        'all',
        ['>=', ['get', 'time'], startDate.getTime()],
        ['<=', ['get', 'time'], endDate.getTime()],
      ]);
    }

    let combinedFilter: ExpressionSpecification | null = null;

    if (existingFilters) {
      if (filters.length) {
        //Combine the existing filters with the new ones
        combinedFilter = ['all', existingFilters, ...filters] as ExpressionSpecification;
      } else {
        //If there are no new filters, just use the existing ones
        combinedFilter = existingFilters as ExpressionSpecification;
      }
    } else {
      //If there are no existing filters, just use the new ones
      combinedFilter = ['all', ...filters] as ExpressionSpecification;
    }

    map.setFilter(layerId, combinedFilter);
  };

  //When filters change, apply them to the layers of the current visualisation
  watch([filterSearchTerm, filterDates], () => {
    const mapStore = useMapStore();
    const { selectedVisualisationId } = storeToRefs(mapStore);
    const sourceDataStore = useSourceDataStore();

    const map = mapStore.map;

    if (!map || !selectedVisualisationId.value) return;

    const filteredData = sourceDataStore.getFilteredSourceData('earthquakes');

    //Filter the data at source level for earthquakes clustered, because clusters do not have the properties we need to filter by
    const source = map.getSource('earthquakes-clustered') as GeoJSONSource;
    source.setData(filteredData);

    const layerIds = VISUALISATION[selectedVisualisationId.value].layers;

    layerIds.forEach((layerId) => {
      if (EXCLUDED_FILTER_LAYERS.includes(layerId)) return;
      // @ts-ignore
      updateLayerFilter(map, layerId);
    });
  });

  return {
    selectedEarthquakeId,
    filterSearchTerm,
    filterDates,
    filterDateFromTimestamp,
    filterDateToTimestamp,
    updateLayerFilter,
  };
});
