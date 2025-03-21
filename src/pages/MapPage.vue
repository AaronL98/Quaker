<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import StyleSelector from '@/components/StyleSelector.vue';
import { useMapStore } from '@/stores/mapStore';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapStore = useMapStore();

onMounted(() => {
  mapStore.initMap('map', import.meta.env.VITE_MAPBOX_API_KEY);
});

onUnmounted(() => {
  mapStore.cleanupMap();
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
