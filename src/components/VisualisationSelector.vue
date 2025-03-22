<script lang="ts" setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import Listbox from 'primevue/listbox';

const popover = ref();

const toggle = (event: any) => {
  popover.value.toggle(event);
};
</script>
<template>
  <div>
    <Button
      v-tooltip.left="'Select a visualisation'"
      @click="toggle"
      icon="mdi mdi-chart-scatter-plot"
      class="shadow-xl"
      size="large"
      severity="primary"
      rounded />

    <Popover ref="popover">
      <span class="block font-medium mb-2">Visualisation selector </span>
    </Popover>
  </div>
</template>
