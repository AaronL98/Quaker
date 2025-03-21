<script lang="ts" setup>
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import { useSourceDataStore } from '@/stores/sourceDataStore';
import type { Earthquake } from '@/consts/earthquake.types';
import EarthquakeListItem from '@/components/EarthquakeListItem.vue';
// import ScrollPanel from 'primevue/scrollpanel';

const sourceDataStore = useSourceDataStore();

import type { FeatureCollection } from 'geojson';

const data = computed<FeatureCollection>(() => {
  return (
    sourceDataStore.getSourceData('earthquakes')?.data || {
      type: 'FeatureCollection',
      features: [],
    }
  );
});

const earthquakes = computed<Earthquake[]>(() => {
  if (!data.value) {
    return [];
  }

  const mappedData: Earthquake[] = data.value.features.map((feature: any) => {
    return {
      id: feature.id,
      title: feature.properties.title,
      place: feature.properties.place,
      time: feature.properties.time,
      mag: feature.properties.mag,
    };
  });

  console.log(mappedData);

  return mappedData;
});
</script>
<template>
  <Card
    class="flex flex-col h-full !w-70"
    :pt="{
      body: {
        class: 'overflow-hidden',
      },
      content: {
        class: 'flex flex-col overflow-y-scroll',
      },
    }">
    <template #title> Recent Earthquakes</template>
    <template #subtitle>Seismic earthquake data provided by USGS.gov</template>

    <template #content>
      <span class="text-sm">Showing {{ earthquakes.length }} earthquakes</span>

      <div class="flex-grow">
        <EarthquakeListItem
          v-for="quake in earthquakes"
          :key="quake.id"
          :id="quake.id"
          :title="quake.title"
          :place="quake.place"
          :time="quake.time"
          :mag="quake.mag" />
      </div>
    </template>
  </Card>
</template>
