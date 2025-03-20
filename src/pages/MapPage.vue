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
  <div class="absolute z-10 p-4 w-full h-full pointer-events-none">
    <StyleSelector />
    <div class="flex flex-col w-1/12 h-full bg-surface-0">
      <Button label="Zoom In" icon="pi pi-plus" @click="map.zoomIn()" />
      <Button label="Zoom Out" icon="pi pi-minus" @click="map.zoomOut()" />
    </div>
  </div>

  <div id="map" class="h-screen"></div>
</template>
