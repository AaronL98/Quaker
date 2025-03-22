<script lang="ts" setup>
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import { useSourceDataStore } from '@/stores/sourceDataStore';
import type { Earthquake } from '@/consts/earthquake.types';
import Listbox from 'primevue/listbox';
import type { FeatureCollection } from 'geojson';
import type { Feature } from 'geojson';
import { formatDate } from '@/helpers/formatDate.ts';
import { getMagnitudeIcon } from '@/helpers/getMagnitudeIcon.ts';

const sourceDataStore = useSourceDataStore();

const selectedEarthquake = ref<Earthquake | null>(null);

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

  const mappedData: Earthquake[] = data.value.features.map((feature: Feature) => {
    return {
      id: feature.id ? String(feature.id) : 'unknown-id',
      title: feature.properties?.title,
      place: feature.properties?.place,
      time: feature.properties?.time,
      mag: feature.properties?.mag,
    };
  });

  console.log(mappedData);

  return mappedData;
});
</script>
<template>
  <Card
    class="!w-70"
    :pt="{
      body: {
        class: '!p-3 h-full',
      },
      content: {
        class: 'flex flex-col grow',
      },
    }">
    <template #title> Recent Earthquakes</template>
    <template #subtitle>Seismic earthquake data provided by USGS.gov</template>

    <template #content>
      <span class="text-sm">Showing {{ earthquakes.length }} earthquakes</span>

      <div class="grow">
        <!-- Virtually scrolls to handle lots of results -->
        <Listbox
          v-model="selectedEarthquake"
          :options="earthquakes"
          optionLabel="place"
          optionValue="id"
          :virtualScrollerOptions="{ itemSize: 55 }"
          class="w-full h-full"
          listStyle="height: 100%; max-height: unset"
          striped>
          <template #option="slotProps">
            <div class="flex">
              <span
                :class="`mdi mdi-ice ${getMagnitudeIcon(
                  slotProps.option.mag,
                )} text-xl mr-2 my-auto`"></span>

              <div class="flex flex-col">
                {{ slotProps.option.place }}
                <div class="flex justify-between text-xs">
                  <span>Mag: {{ slotProps.option.mag }}</span>
                  <span>{{ formatDate(slotProps.option.time) }}</span>
                </div>
              </div>
            </div>
          </template>
        </Listbox>
      </div>
    </template>
  </Card>
</template>
