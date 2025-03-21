<script lang="ts" setup>
import type { Earthquake } from '@/consts/earthquake.types';

const props = defineProps<Earthquake>();
</script>

<template>
  <div class="flex flex-col w-full border-2 border-red-400">
    <div class="font-bold">Earthquake</div>
    <div class="font-bold">{{ props.title }}</div>
    <div class="font-bold">{{ props.place }}</div>
    <div class="font-bold">{{ props.time }}</div>
    <div class="font-bold">{{ props.mag }}</div>
  </div>
</template>
