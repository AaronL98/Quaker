<script lang="ts" setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import OverlayBadge from 'primevue/overlaybadge';
import Popover from 'primevue/popover';
import { useMapStore } from '@/stores/mapStore';

import { MAP_STYLES_LIST } from '@/consts/mapStyles.types';

const mapStore = useMapStore();

const popover = ref();

const toggle = (event: any) => {
  popover.value.toggle(event);
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
      icon="mdi mdi-earth"
      class="shadow-xl"
      size="large"
      severity="secondary"
      rounded />

    <Popover ref="popover">
      <span class="block font-medium mb-2">Map style </span>
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
            v-tooltip.top="style.name"
            :src="style.img"
            :alt="style.name"
            class="hover:border-primary-400 border-surface-800 rounded-md border-1 cursor-pointer"
            height="50"
            width="50" />
        </OverlayBadge>
      </div>
    </Popover>
  </div>
</template>
