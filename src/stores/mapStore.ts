import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import mapboxgl, { LngLat } from 'mapbox-gl';

export const useMapStore = defineStore('map', () => {
  const map = ref<mapboxgl.Map | null>(null);

  //Actions
  const initMap = (mapContainer: string, accessToken: string) => {
    mapboxgl.accessToken = accessToken;

    map.value = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
    });
  };

  const cleanupMap = () => {
    //TODO: Tidy up any layers and sources here too.

    if (map.value) {
      map.value.remove();
    }
  };

  let isStyleChanging = false;

  const setStyle = async (styleUrl: string) => {
    if (isStyleChanging) {
      return Promise.reject(new Error('Style change already in progress'));
    }

    isStyleChanging = true;

    return new Promise<void>((resolve, reject) => {
      map.value?.once('style.load', () => {
        isStyleChanging = false;
        resolve();
      });

      try {
        map.value?.setStyle(styleUrl);
      } catch (error) {
        isStyleChanging = false;
        reject(error);
      }
    });
  };

  //Getters
  const getCenter = computed<LngLat>(() => map.value?.getCenter() || new LngLat(0, 0));

  const getZoom = computed<number>(() => map.value?.getZoom() || 9);

  const getStyleName = computed<string>(() => map.value?.getStyle()?.name || '');

  return { map, initMap, cleanupMap, setStyle, getCenter, getZoom, getStyleName };
});
