import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SourceData } from '@/consts/sourceData.types';

//This store will hold source data that can be added to the map
export const useSourceDataStore = defineStore('sources', () => {
  const sourceData = ref<SourceData[]>([]);

  //Actions
  const addSourceData = (data: SourceData) => {
    sourceData.value.push(data);
  };

  const deleteSourceData = (data: SourceData) => {
    sourceData.value = sourceData.value.filter((s) => s.id !== data.id);
  };

  //Getters
  const getSourceData = (sourceDataId: SourceData['id']): SourceData | undefined => {
    return sourceData.value.find((s) => s.id === sourceDataId);
  };

  return { sourceData, addSourceData, deleteSourceData, getSourceData };
});
