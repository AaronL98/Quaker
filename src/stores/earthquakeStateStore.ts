import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEarthquakeStateStore = defineStore('earthquakeState', () => {
  const selectedEarthquakeId = ref<number | null>();
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
    selectedEarthquakeId,
    filterSearchTerm,
    filterDates,
    filterDateFromTimestamp,
    filterDateToTimestamp,
  };
});
