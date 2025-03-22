<script lang="ts" setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import OverlayBadge from 'primevue/overlaybadge';
import Popover from 'primevue/popover';
import { useMapStore } from '@/stores/mapStore';

import { MAP_STYLES_LIST } from '@/consts/mapStyles.types';

import type { LngLat } from 'mapbox-gl';

const mapStore = useMapStore();

import { getMapStyleThumbnail } from '@/helpers/getMapStyleThumbnail';

const popover = ref();

const toggle = (event: any) => {
  popover.value.toggle(event);
};

const accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

const getThumbnail = (styleUsername: string, styleId: string) => {
  const center: LngLat = mapStore.getCenter;
  const zoom: number = mapStore.getZoom;

  return getMapStyleThumbnail(styleUsername, styleId, center.lng, center.lat, zoom, accessToken);
};

const activeStyleName = computed<string>(() => {
  return mapStore.getStyle?.name || '';
});

const setStyle = async (styleUrl: string) => {
  await mapStore.setStyle(styleUrl);
};
</script>

<template>
  <div>
    <Button
      v-tooltip.left="'Select a map style'"
      @click="toggle"
      icon="mdi mdi-layers"
      class="shadow-xl"
      rounded
      size="large"
      severity="secondary" />

    <Popover ref="popover">
      <div class="font-bold mb-2">Style selector</div>
      <div class="flex gap-4">
        <OverlayBadge
          v-for="style in MAP_STYLES_LIST"
          value="✓"
          :pt="{
            pcBadge: {
              root: {
                class: activeStyleName === style.name ? '' : '!hidden',
              },
            },
          }">
          <img
            @click="setStyle(style.url)"
            :src="getThumbnail(style.username, style.id)"
            :alt="style.name"
            class="hover:border-primary-400 border-surface-800 rounded-md border-1 cursor-pointer"
            height="50"
            width="50" />
        </OverlayBadge>
      </div>
    </Popover>
  </div>
</template>
