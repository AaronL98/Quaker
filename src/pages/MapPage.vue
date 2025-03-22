<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import StyleSelector from '@/components/StyleSelector.vue';
import EarthquakeList from '@/components/EarthquakeList.vue';
import { useMapStore } from '@/stores/mapStore';
import { useSourceDataStore } from '@/stores/sourceDataStore';
import axios from 'axios';

import 'mapbox-gl/dist/mapbox-gl.css';

const mapStore = useMapStore();
const sourceDataStore = useSourceDataStore();

const addEarthquakeSource = () => {
  const map = mapStore.map;
  if (!map) {
    console.error('Map not initialized when trying to add earthquake source');
    return;
  }

  if (map.getSource('earthquakes')) {
    console.warn('Earthquake source already exists, removing it before adding it again');
    map.removeSource('earthquakes');
  }

  map.addSource('earthquakes', {
    type: 'geojson',
    data: sourceDataStore.getSourceData('earthquakes')?.data,
  });
};

// Function to add earthquake layers
const addEarthquakeLayers = () => {
  const map = mapStore.map;
  if (!map) {
    console.error('Map not initialized when trying to add earthquake layer');
    return;
  }

  if (map.getLayer('earthquakes')) {
    console.error('Earthquake layer already exists');
  }

  // Regular earthquakes layer
  map.addLayer({
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

  //Can add more layers here, like heatmap, etc.
};

onMounted(async () => {
  mapStore.initMap('map', import.meta.env.VITE_MAPBOX_API_KEY);

  //Load the data from the USGS Earthquake API and add it to the map
  mapStore.map?.on('load', async () => {
    await loadData(
      //All over 1 mag, the last week
      //'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson',
      //All the last month
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson',
      'earthquakes',
    );

    addEarthquakeSource();
    addEarthquakeLayers();

    mapStore.map?.on('style.load', () => {
      addEarthquakeSource();
      addEarthquakeLayers();

      //TODO: Re-apply the selected earthquake if one is selected
    });
  });
});

onUnmounted(() => {
  mapStore.cleanupMap();
});

const loadData = async (endpoint: string, name: string) => {
  //Load the GeoJSON from the USGS Earthquake API into the sourceData store
  try {
    const response = await axios.get(endpoint);
    sourceDataStore.addSourceData({
      id: name,
      data: response.data,
    });
  } catch (error) {
    console.error('Failed to fetch data', error);
  }
};
</script>

<template>
  <div class="relative h-screen">
    <!-- UI Overlays -->
    <div class="h-screen absolute w-full">
      <div id="map" class="absolute inset-0 h-full w-full z-0"></div>
    </div>

    <!-- UI elements container-->
    <div class="relative h-screen p-4 pointer-events-none z-10">
      <div class="flex h-full">
        <!--Flexbox for all UI elements-->
        <EarthquakeList class="pointer-events-auto" />
        <StyleSelector class="ml-auto pointer-events-auto" />
      </div>
    </div>
  </div>
</template>
