import { createApp } from 'vue';
import './style.css';
import '@mdi/font/css/materialdesignicons.css';
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const app = createApp(App);
app.use(router);

const QuakerPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}',
    },
  },
});

app.use(PrimeVue, {
  theme: {
    preset: QuakerPreset,
    options: {
      darkModeSelector: '.dark-mode',
    },
  },
});
app.mount('#app');
