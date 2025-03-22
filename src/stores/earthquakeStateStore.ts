import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Earthquake } from '@/consts/earthquake.types';

export const useEarthquakeStateStore = defineStore('earthquakeState', () => {
  const selectedEarthquake = ref<Earthquake | null>();
  const filterSearchTerm = ref<string>('');
  const filterDates = ref<Date[]>([]);

  const filterDateFromTimestamp = computed<number>(() => {
    return filterDates.value[0]?.getTime();
  });

  const filterDateToTimestamp = computed<number>(() => {
    return filterDates.value[1]?.getTime();
  });

  //TODO: Timestamps
  //   const filterFromTimestamp = ref<string>('');
  //   const filterToTimestamp = ref<string>('');

  return {
    selectedEarthquake,
    filterSearchTerm,
    filterDates,
    filterDateFromTimestamp,
    filterDateToTimestamp,
  };
});
