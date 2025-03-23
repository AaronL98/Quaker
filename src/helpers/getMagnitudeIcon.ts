//A function that takes an earthquake magnitude value and returns a corresponding cellular signal icon and colour

export const getMagnitudeIcon = (magnitude: number) => {
  if (magnitude < 3) {
    return 'mdi-signal-cellular-1 text-green-700 dark:text-green-300';
  } else if (magnitude < 5) {
    return 'mdi-signal-cellular-2 text-yellow-600 dark:text-yellow-300';
  } else {
    return 'mdi-signal-cellular-3 text-red-700 dark:text-red-300';
  }
};
