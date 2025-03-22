<script lang="ts" setup>
import { computed } from 'vue';

//Components
import Card from 'primevue/card';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Listbox from 'primevue/listbox';

//Types
import type { Earthquake } from '@/consts/earthquake.types';
import type { FeatureCollection } from 'geojson';
import type { Feature } from 'geojson';

//Store
import { useSourceDataStore } from '@/stores/sourceDataStore';
import { useEarthquakeStateStore } from '@/stores/earthquakeStateStore';
import { storeToRefs } from 'pinia';

//Helpers
import { formatDate } from '@/helpers/formatDate.ts';
import { getMagnitudeIcon } from '@/helpers/getMagnitudeIcon.ts';

const sourceDataStore = useSourceDataStore();
const earthquakeStateStore = useEarthquakeStateStore();

const { selectedEarthquake, filterSearchTerm, filterDates } = storeToRefs(earthquakeStateStore);

const minimumDate = computed<Date>(() => {
  //Return date 30 days ago
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
});

const maximumDate = computed<Date>(() => {
  //Return today's date
  return new Date();
});

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

  //TODO: Remove
  console.log(mappedData);

  return mappedData;
});

const filteredEarthquakes = computed<Earthquake[]>(() => {
  return earthquakes.value.filter((earthquake: Earthquake) => {
    // If search term exists, check if place includes it
    if (
      filterSearchTerm.value &&
      !earthquake.place.toLowerCase().includes(filterSearchTerm.value.toLowerCase())
    ) {
      return false;
    }

    // Date filtering
    if (earthquakeStateStore.filterDates?.length === 2) {
      const earthquakeDate = new Date(earthquake.time);

      const startDate = new Date(earthquakeStateStore.filterDateFromTimestamp);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(earthquakeStateStore.filterDateToTimestamp);
      endDate.setHours(23, 59, 59, 999);

      if (earthquakeDate < startDate || earthquakeDate > endDate) {
        return false;
      }
    }

    // If we didn't return false above, this earthquake passes all filters
    return true;
  });
});
</script>
<template>
  <Card
    class="!w-80"
    :pt="{
      body: {
        class: '!p-3 h-full',
      },
      content: {
        class: 'flex flex-col grow',
      },
    }">
    <template #title>🫨 Quaker</template>
    <template #subtitle
      >Real-time earthquake data from the past 30 days, provided by
      <a href="https://earthquake.usgs.gov/earthquakes/feed/" target="_blank"
        ><span class="text-primary hover:font-underline font-bold">USGS.gov</span></a
      ></template
    >

    <template #content>
      <InputText v-model="filterSearchTerm" placeholder="Search for a location" class="mb-2" />
      <DatePicker
        v-model="filterDates"
        :minDate="minimumDate"
        :maxDate="maximumDate"
        :manualInput="false"
        class="mb-2"
        placeholder="Select a date range"
        selectionMode="range"
        iconDisplay="input"
        showIcon
        showButtonBar>
      </DatePicker>

      <span class="text-sm text-surface-500 dark:text-surface-400 mx-auto"
        >Showing {{ filteredEarthquakes.length }} earthquakes</span
      >

      <div class="grow">
        <!-- Virtually scrolls to handle lots of results -->
        <Listbox
          v-model="selectedEarthquake"
          :options="filteredEarthquakes"
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
