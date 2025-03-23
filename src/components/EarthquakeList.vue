<script lang="ts" setup>
import { computed, watch, ref } from 'vue';

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

const { selectedEarthquakeId, filterSearchTerm, filterDates } = storeToRefs(earthquakeStateStore);

const listbox = ref();

const minimumDate = computed<Date>(() => {
  //Return date 30 days ago
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
});

const maximumDate = computed<Date>(() => {
  //Return today's date
  return new Date();
});

const filteredData = computed<FeatureCollection>(() => {
  return {
    type: 'FeatureCollection',
    features: sourceDataStore.getFilteredSourceData('earthquakes').features,
  };
});

const earthquakes = computed<Earthquake[]>(() => {
  if (!filteredData.value) {
    return [];
  }

  const mappedData: Earthquake[] = filteredData.value.features.map((feature: Feature) => {
    return {
      id: feature.id ? String(feature.id) : 'unknown-id',
      title: feature.properties?.title,
      place: feature.properties?.place,
      time: feature.properties?.time,
      mag: feature.properties?.mag,
    };
  });

  return mappedData;
});

watch(selectedEarthquakeId, (newValue) => {
  //When selected earthquake changes, scroll to the item in the list
  const selectedEarthquake = earthquakes.value.find((earthquake) => earthquake.id === newValue);

  if (selectedEarthquake) {
    const index = earthquakes.value.indexOf(selectedEarthquake);

    if (index !== -1) {
      listbox.value.virtualScroller.scrollToIndex(index);
    }
  }
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
        >Showing {{ earthquakes.length }} earthquakes</span
      >

      <div class="grow">
        <!-- Virtually scrolls to handle lots of results -->
        <Listbox
          v-model="selectedEarthquakeId"
          :options="earthquakes"
          optionLabel="place"
          optionValue="id"
          :virtualScrollerOptions="{ itemSize: 55 }"
          class="w-full h-full"
          listStyle="height: 100%; max-height: unset"
          ref="listbox"
          striped>
          <template #option="slotProps">
            <div class="flex">
              <span
                :class="`mdi ${getMagnitudeIcon(
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
