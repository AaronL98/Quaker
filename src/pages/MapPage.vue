<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as turf from '@turf/turf';
import axios from 'axios';
import { storeToRefs } from 'pinia';

import StyleSelector from '@/components/StyleSelector.vue';
import VisualisationSelector from '@/components/VisualisationSelector.vue';
import EarthquakeList from '@/components/EarthquakeList.vue';

import { useMapStore } from '@/stores/mapStore';
import { useSourceDataStore } from '@/stores/sourceDataStore';
import { useEarthquakeStateStore } from '@/stores/earthquakeStateStore';

import { getTimeAgo, formatDateTime } from '@/helpers/formatDate';
import { getMagnitudeIcon } from '@/helpers/getMagnitudeIcon';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl, {
  LngLat,
  MapMouseEvent,
  type GeoJSONFeature,
  type LngLatLike,
  type Popup,
  type Map,
  type GeoJSONSource,
} from 'mapbox-gl';
import type { Feature, FeatureCollection, Polygon, Point, GeoJsonProperties } from 'geojson';

import { EXCLUDED_FILTER_LAYERS, LAYERS } from '@/consts/layers';
import { VISUALISATION, type Visualisation } from '@/consts/visualisations';

const mapStore = useMapStore();
const sourceDataStore = useSourceDataStore();
const earthquakeStateStore = useEarthquakeStateStore();

const { selectedEarthquakeId } = storeToRefs(earthquakeStateStore);
const { selectedVisualisationId } = storeToRefs(mapStore);

const popup = ref<Popup | null>(null);

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

const addClusteredEarthquakeSource = () => {
  const map = mapStore.map;
  if (!map) {
    console.error('Map not initialized when trying to add clustered earthquake source');
    return;
  }

  if (map.getSource('earthquakes-clustered')) {
    console.warn('Clustered earthquake source already exists, removing it before adding it again');
    map.removeSource('earthquakes-clustered');
  }

  map.addSource('earthquakes-clustered', {
    type: 'geojson',
    data: sourceDataStore.getSourceData('earthquakes')?.data,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 100,
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

  // @ts-ignore
  const rawData = sourceDataStore.getSourceData('earthquakes')?.data.features ?? []; // Ensure it's always an array

  const data: FeatureCollection<Point, GeoJsonProperties> = {
    type: 'FeatureCollection',
    features: rawData.filter(
      (feature: Feature): feature is Feature<Point> => feature.geometry.type === 'Point',
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

// Function to initialize popup
const initPopup = () => {
  popup.value = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
};

const updateSelectedEarthquake = (earthquakeId: string | null | undefined) => {
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
    ?.data.features.find((feature: Feature) => feature.id === earthquakeId);

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

  map.flyTo({ center: coords, zoom: mapStore.getZoom > 5.5 ? mapStore.getZoom : 5.5 });
};

onMounted(async () => {
  mapStore.initMap('map', import.meta.env.VITE_MAPBOX_API_KEY);

  initPopup();

  //Load the data from the USGS Earthquake API and add it to the map
  mapStore.map?.on('load', async () => {
    await loadData(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson',
      'earthquakes',
    );

    addEarthquakeSource();
    addClusteredEarthquakeSource();
    addEarthquakeMagnitudePolygonSource();
    addVisualisationLayers(selectedVisualisationId.value);
    addAtmosphere();

    mapStore.map?.on('style.load', () => {
      addEarthquakeSource();
      addClusteredEarthquakeSource();
      addEarthquakeMagnitudePolygonSource();
      addVisualisationLayers(selectedVisualisationId.value);

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

  watch(selectedVisualisationId, (newValue, oldValue) => {
    if (!newValue || !oldValue) return;

    addVisualisationLayers(newValue);
  });
});

const addVisualisationLayers = (visualisationId: string) => {
  const map = mapStore.map;
  if (!map) {
    console.error('Map not initialized when trying to add visualisation layers');
    return;
  }

  //Remove the layers of all other VISUALISATION consts if they exist on the map
  Object.values(VISUALISATION).forEach((visualisation: Visualisation) => {
    //If the visualisation is not the selected one, remove its layers
    if (visualisation.id !== visualisationId) {
      visualisation.layers.forEach((layerId) => {
        //If the layer exists, remove it
        if (map.getLayer(layerId)) {
          //Remove any event listeners for the layer
          switch (layerId) {
            case LAYERS.EARTHQUAKES.id:
              togglePointClickHandler(LAYERS.EARTHQUAKES.id, false);
              break;
            case LAYERS.CLUSTERED_EARTHQUAKE_UNCLUSTERED_POINTS.id:
              togglePointClickHandler(LAYERS.CLUSTERED_EARTHQUAKE_UNCLUSTERED_POINTS.id, false);
              break;
            case LAYERS.CLUSTERED_EARTHQUAKES.id:
              toggleClusterClickHandler(LAYERS.CLUSTERED_EARTHQUAKES.id, false);
              break;
          }

          map.removeLayer(layerId);
        }
      });
    }
  });

  //Add the layers of the selected visualisation
  const selectedVisualisation: Visualisation = VISUALISATION[visualisationId];

  selectedVisualisation.layers.forEach((layer) => {
    map.addLayer(LAYERS[layer]);

    //Update the filters for layers that are not excluded from layer-based filtering
    if (!EXCLUDED_FILTER_LAYERS.includes(layer)) {
      earthquakeStateStore.updateLayerFilter(map as Map, layer);
    }

    switch (layer) {
      case LAYERS.EARTHQUAKES.id:
        togglePointClickHandler(LAYERS.EARTHQUAKES.id, true);
        break;
      case LAYERS.CLUSTERED_EARTHQUAKE_UNCLUSTERED_POINTS.id:
        togglePointClickHandler(LAYERS.CLUSTERED_EARTHQUAKE_UNCLUSTERED_POINTS.id, true);
        break;
      case LAYERS.CLUSTERED_EARTHQUAKES.id:
        toggleClusterClickHandler(LAYERS.CLUSTERED_EARTHQUAKES.id, true);
        break;
    }
  });

  //Set 2D/3D view based on the selected visualisation
  if (selectedVisualisation.dimension === '3D') {
    map.easeTo({
      pitch: 60,
      bearing: 0,
      duration: 500,
    });
  } else {
    map.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 500,
    });
  }
};

const togglePointClickHandler = (layerId: string, enabled: boolean) => {
  if (!mapStore.map) {
    console.error('Map not initialized when trying to toggle point click handler');
    return;
  }

  const handler = (e: MapMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) return;

    //Hack: USGS returns strings as mapbox feature IDs, but Mapbox needs numerical IDs.
    //Use the `ids` property (which has a prefix and suffix comma of the ID) to get the numerical ID
    const earthquakeId = feature.properties?.ids.replace(/,/g, '');

    if (earthquakeId) {
      selectedEarthquakeId.value = earthquakeId;
    } else {
      console.warn('Feature ID is undefined, cannot select earthquake');
    }
  };

  if (enabled) {
    mapStore.map.on('click', layerId, handler);
    toggleHoverHandler(layerId, true);
  } else {
    mapStore.map.off('click', layerId, handler);
    toggleHoverHandler(layerId, false);
  }
};

const toggleClusterClickHandler = (layerId: string, enabled: boolean) => {
  if (!mapStore.map) {
    console.error('Map not initialized when trying to toggle cluster click handler');
    return;
  }

  const handler = (e: MapMouseEvent) => {
    const feature: GeoJSONFeature | undefined = e.features?.[0];
    if (!feature || feature.geometry.type !== 'Point') return;

    const clusterId = feature.properties?.cluster_id;
    const source = mapStore.map?.getSource('earthquakes-clustered') as GeoJSONSource;

    source?.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      const pointGeometry = feature.geometry as GeoJSON.Point;
      const coordinates = pointGeometry.coordinates as LngLatLike;

      mapStore.map?.easeTo({
        center: coordinates,
        zoom: zoom || 10,
        duration: 500,
      });
    });
  };

  if (enabled) {
    mapStore.map.on('click', layerId, handler);
    toggleHoverHandler(layerId, true);
  } else {
    mapStore.map.off('click', layerId, handler);
    toggleHoverHandler(layerId, false);
  }
};

const toggleHoverHandler = (layerId: string, enabled: boolean) => {
  if (!mapStore.map) {
    console.error('Map not initialized when trying to toggle hover handler');
    return;
  }

  const enterHandler = () => {
    const canvas = mapStore.map?.getCanvas();

    if (canvas && canvas.style) {
      canvas.style.cursor = 'pointer';
    }
  };

  const leaveHandler = () => {
    const canvas = mapStore.map?.getCanvas();
    if (canvas && canvas.style) {
      canvas.style.cursor = '';
    }
  };

  if (enabled) {
    mapStore.map.on('mouseenter', layerId, enterHandler);
    mapStore.map.on('mouseleave', layerId, leaveHandler);
  } else {
    mapStore.map.off('mouseenter', layerId, enterHandler);
    mapStore.map.off('mouseleave', layerId, leaveHandler);
  }
};

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
