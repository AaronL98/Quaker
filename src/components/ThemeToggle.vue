<script lang="ts" setup>
import { ref } from 'vue';
import Button from 'primevue/button';

const icon = ref('mdi-weather-sunny');

const toggle = () => {
  document.documentElement.classList.toggle('dark-mode');
  icon.value = document.documentElement.classList.contains('dark-mode')
    ? 'mdi-weather-night'
    : 'mdi-weather-sunny';
};
</script>
<template>
  <Button
    v-tooltip.left="'Switch app theme'"
    @click="toggle"
    :icon="`mdi ${icon}`"
    class="shadow-xl"
    size="large"
    severity="secondary"
    rounded />
</template>
