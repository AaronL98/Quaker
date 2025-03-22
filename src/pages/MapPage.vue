<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import StyleSelector from '@/components/StyleSelector.vue';
import VisualisationSelector from '@/components/VisualisationSelector.vue';
import EarthquakeList from '@/components/EarthquakeList.vue';
import { useMapStore } from '@/stores/mapStore';
import { useSourceDataStore } from '@/stores/sourceDataStore';
import { useEarthquakeStateStore } from '@/stores/earthquakeStateStore';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { getTimeAgo, formatDateTime } from '@/helpers/formatDate';
import { getMagnitudeIcon } from '@/helpers/getMagnitudeIcon';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl, { LngLat } from 'mapbox-gl';
import * as turf from '@turf/turf';
import type { Feature, FeatureCollection, Polygon, Point, GeoJsonProperties } from 'geojson';

const mapStore = useMapStore();
const sourceDataStore = useSourceDataStore();
const earthquakeStateStore = useEarthquakeStateStore();
const { selectedEarthquakeId } = storeToRefs(earthquakeStateStore);

const popup = ref<mapboxgl.Popup | null>(null);

const addAtmosphere = () => {
  mapStore.map?.setFog({
    color: 'rgb(46, 120, 135)',
    'high-color': 'rgb(20, 55, 155)',
    'horizon-blend': 0.01,
    'space-color': 'rgb(11, 11, 25)',
    'star-intensity': 0.3,
  });
};

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

const addEarthquakeMagnitudePolygonSource = () => {
  //Adds a source for the earthquakes as polygons, size based on magnitude
  const map = mapStore.map;
  if (!map) {
    console.error('Map not initialized when trying to add earthquake magnitude polygon source');
    return;
  }

  if (map.getSource('earthquakes-magnitude-polygons')) {
    console.warn(
      'Earthquake magnitude polygon source already exists, removing it before adding it again',
    );
    map.removeSource('earthquakes-magnitude-polygons');
  }

  const rawData = sourceDataStore.getSourceData('earthquakes')?.data.features ?? []; // Ensure it's always an array

  const data: FeatureCollection<Point, GeoJsonProperties> = {
    type: 'FeatureCollection',
    features: rawData.filter(
      (feature): feature is Feature<Point> => feature.geometry.type === 'Point',
    ),
  };

  if (!data) {
    console.error('No data found for earthquake magnitude polygons');
    return;
  }

  const polygons: FeatureCollection<Polygon> = {
    type: 'FeatureCollection',
    features: (data?.features ?? []).map((feature: Feature<Point>): Feature<Polygon> => {
      const magnitude = feature.properties?.mag || 0;
      // Radius based on magnitude - Magnitude 0 = 0.2km, Magnitude 10 = 30km
      const radius = Math.max(magnitude * 10, 0.2);

      const circle = turf.circle(feature.geometry.coordinates, radius, {
        steps: 64,
        units: 'kilometers',
      });

      return {
        type: 'Feature',
        geometry: circle.geometry as Polygon, // Ensure the geometry is a Polygon
        properties: feature.properties || {}, // Keep properties or set an empty object
      };
    }),
  };

  map.addSource('earthquakes-magnitude-polygons', {
    type: 'geojson',
    data: polygons,
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

const add3DMagnitudeLayers = () => {
  const map = mapStore.map;
  if (!map) {
    console.error('Map not initialized when trying to add 3D extrusion layer');
    return;
  }

  if (map.getLayer('earthquakes-3d')) {
    console.error('3D extrusion layer already exists');
  }

  // 3D extrusion layer
  map.addLayer({
    id: '3d-magnitudes',
    type: 'fill-extrusion',
    source: 'earthquakes-magnitude-polygons',
    // filter: ['==', '$type', 'Point'],
    paint: {
      'fill-extrusion-base': 0,
      //Height based on magnitude
      'fill-extrusion-height': [
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
      ],

      //Colour based on magnitude, green -> yellow -> red
      'fill-extrusion-color': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        0,
        '#fff',
        2,
        '#0f0',
        4,
        '#ff0',
        6,
        '#f90',
        8,
        '#f60',
        10,
        '#f00',
      ],
      // 'fill-extrusion-opacity': 0.9,
      'fill-extrusion-vertical-gradient': false,
    },
  });

  map.easeTo({
    pitch: 60,
    bearing: 0,
    duration: 1000,
  });
};

// Function to initialize popup
const initPopup = () => {
  popup.value = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
};

const updateSelectedEarthquake = (earthquakeId: number | null | undefined) => {
  const map = mapStore.map;
  if (!map) {
    console.error('Map not initialized when trying to update selected earthquake');
    return;
  }

  if (!popup.value) {
    console.error('Popup not initialized when trying to update selected earthquake');
    return;
  }

  if (!earthquakeId) {
    popup.value.remove();
    return;
  }

  const earthquakeFeature = sourceDataStore
    .getSourceData('earthquakes')
    ?.data.features.find((feature) => feature.id === earthquakeId);

  if (!earthquakeFeature) {
    console.error('Earthquake feature not found');
    return;
  }

  if (earthquakeFeature.geometry.type !== 'Point') {
    console.error('Earthquake was not of type Point');
    return;
  }

  const coords = new LngLat(
    earthquakeFeature.geometry.coordinates[0],
    earthquakeFeature.geometry.coordinates[1],
  );

  const timestamp = earthquakeFeature.properties?.time;
  const magnitude = earthquakeFeature.properties?.mag;

  // @ts-ignore
  popup.value
    .setLngLat(coords)
    .setHTML(
      `
      <div class='flex flex-col'>
        <div class='mb-2'>
          <div class='mdi ${getMagnitudeIcon(earthquakeFeature.properties?.mag)}'>
            <span class='font-bold'>${earthquakeFeature.properties?.place}</span>
          </div>
          <span class='mdi mdi-history' />
          <span class="text-sm">${getTimeAgo(timestamp)}</span>
        </div>
        <div class="border-1 rounded-md border-surface-300 bg-surface-100 dark:border-surface-700 dark:bg-surface-800 p-2 text-sm">

          <div>Magnitude: ${magnitude}</div>
          <div>Date ${formatDateTime(timestamp)}</div>
          <div>Coordinates:</div>
          <div class="ml-2">Lat: ${coords.lat.toFixed(2)}</div>
          <div class="ml-2">Lat: ${coords.lng.toFixed(2)}</div>
        </div>

      </div>
    `,
    )
    // @ts-ignore
    .addTo(map);

  map.flyTo({ center: coords, zoom: 6 });
};

onMounted(async () => {
  mapStore.initMap('map', import.meta.env.VITE_MAPBOX_API_KEY);

  initPopup();

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
    addEarthquakeMagnitudePolygonSource();

    addEarthquakeLayers();
    setTimeout(() => {
      add3DMagnitudeLayers();
    }, 10000);
    addAtmosphere();

    mapStore.map?.on('style.load', () => {
      addEarthquakeSource();
      addEarthquakeLayers();
      addAtmosphere();

      //TODO: Re-apply the selected earthquake if one is selected
    });
  });

  // Watch for changes to selected earthquake
  watch(
    selectedEarthquakeId,
    (earthquakeId) => {
      updateSelectedEarthquake(earthquakeId);
    },
    { immediate: true },
  );
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
        <div class="flex flex-col ml-auto">
          <VisualisationSelector class="pointer-events-auto mb-4" />
          <StyleSelector class="pointer-events-auto" />
        </div>
      </div>
    </div>
  </div>
</template>
