<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';
import StyleSelector from '@/components/StyleSelector.vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
let map: any;

onMounted(() => {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-74.5, 40],
    zoom: 9,
  });
});

onUnmounted(() => {
  if (map) map.remove();
});
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
