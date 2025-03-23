import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import mapboxgl, { LngLat } from 'mapbox-gl';
import type { Map as MapboxMap, StyleSpecification } from 'mapbox-gl';
import { VISUALISATION } from '@/consts/visualisations';

export const useMapStore = defineStore('map', () => {
  const map = ref<MapboxMap | null>(null);
  const localStyle = ref<StyleSpecification | undefined>(undefined);
  const selectedVisualisationId = ref<string>(VISUALISATION.NONE.id);

  //Actions
  const initMap = (mapContainer: string, accessToken: string) => {
    mapboxgl.accessToken = accessToken;

    map.value = new mapboxgl.Map({
      container: mapContainer,
      projection: 'globe',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [8, 56],
      zoom: 2.25,
    });

    // @ts-ignore
    map?.value.on('style.load', updateLocalStyleRef);
  };

  const cleanupMap = () => {
    if (map.value) {
      map.value?.off('style.load', updateLocalStyleRef);
      map.value.remove();
    }
  };

  //Holding a ref of style because it is not reactive, and we need to
  //retrieve the style's name reactively
  const updateLocalStyleRef = () => {
    localStyle.value = map.value?.getStyle() || undefined;
  };

  const setStyle = async (styleUrl: string) => {
    if (!map.value) throw new Error('Map is not initialized');

    map.value?.setStyle(styleUrl);
  };

  //Getters
  const getCenter = computed<LngLat>(() => map.value?.getCenter() || new LngLat(0, 0));

  const getZoom = computed<number>(() => map.value?.getZoom() || 9);

  const getStyle = computed(() => localStyle.value);

  return {
    map,
    initMap,
    cleanupMap,
    setStyle,
    getCenter,
    getZoom,
    getStyle,
    selectedVisualisationId,
  };
});
