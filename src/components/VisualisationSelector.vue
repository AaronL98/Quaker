<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import Listbox from 'primevue/listbox';

import { useMapStore } from '@/stores/mapStore';
import { storeToRefs } from 'pinia';

import { VISUALISATION } from '@/consts/visualisations.ts';
import type { Visualisation } from '@/consts/visualisations.ts';

const mapStore = useMapStore();
const popover = ref();
const listboxKey = ref(0); //Used to force re-render of listbox when user tries to de-select the selected visualisation

const { selectedVisualisationId } = storeToRefs(mapStore);
const visualisations = computed<Visualisation[]>(() => Object.values(VISUALISATION));

const toggle = (event: any) => {
  popover.value.toggle(event);
};

//Prevent user from de-selecting the selected visualisation, it cannot be null
watch(selectedVisualisationId, (newValue, oldValue) => {
  if (!newValue) {
    selectedVisualisationId.value = oldValue;
    listboxKey.value++;
  }
});
</script>
<template>
  <div>
    <Button
      v-tooltip.left="'Select a visualisation'"
      @click="toggle"
      :icon="`mdi ${VISUALISATION[selectedVisualisationId]?.icon || 'mdi-chart-scatter-plot'}`"
      class="shadow-xl"
      size="large"
      severity="primary"
      rounded />

    <Popover ref="popover">
      <span class="block font-medium mb-2">Earthquake visualisation </span>
      <Listbox
        v-model="selectedVisualisationId"
        :options="visualisations"
        :key="listboxKey"
        optionLabel="name"
        optionValue="id"
        class="w-75">
        <template #option="slotProps">
          <div class="flex">
            <span :class="`mdi ${slotProps.option.icon} text-xl mr-2 my-auto`"></span>
            <div class="flex flex-col">
              <span class="">{{ slotProps.option.name }}</span>
              <span class="text-sm">{{ slotProps.option.description }}</span>
            </div>
          </div>
        </template>
      </Listbox>
    </Popover>
  </div>
</template>
