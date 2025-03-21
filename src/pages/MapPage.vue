<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import StyleSelector from '@/components/StyleSelector.vue';
import { useMapStore } from '@/stores/mapStore';
import { useSourceDataStore } from '@/stores/sourceDataStore';
import type { SourceData } from '@/consts/sourceData.types';
import axios from 'axios';

import 'mapbox-gl/dist/mapbox-gl.css';

const mapStore = useMapStore();
const sourceDataStore = useSourceDataStore();

onMounted(async () => {
  mapStore.initMap('map', import.meta.env.VITE_MAPBOX_API_KEY);

  //Load the data from the USGS Earthquake API and add it to the map
  mapStore.map?.on('load', async () => {
    await loadData(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson',
      'earthquakes',
    );

    //Add the new data to the map as a source
    mapStore.map?.addSource('earthquakes', {
      type: 'geojson',
      data: sourceDataStore.getSourceData('earthquakes')?.data,
    });

    //Add the data to the map as a layer
    mapStore.map?.addLayer({
      id: 'earthquakes',
      type: 'circle',
      source: 'earthquakes',
      paint: {
        'circle-color': '#f00',
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    });
  });
});

onUnmounted(() => {
  mapStore.cleanupMap();
});

const loadData = async (endpoint: string, name: string) => {
  //Load the GeoJSON from the USGS Earthquake API into the sourceData store
  await axios
    .get(endpoint)
    .then((response: any) => {
      console.log(response.data);

      sourceDataStore.addSourceData({
        id: name,
        data: response.data,
      });
    })
    .catch((error: any) => {
      console.error('Failed to fetch data', error);
    });
};
</script>

<template>
  <div class="relative">
    <!-- UI Overlays -->
    <div class="h-screen absolute w-full">
      <div id="map" class="absolute inset-0 h-full w-full z-0"></div>
    </div>

    <!-- UI elements container-->
    <div class="relative p-4 pointer-events-none">
      <StyleSelector class="flex ml-auto pointer-events-auto" />
    </div>
  </div>
</template>
