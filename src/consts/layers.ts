interface LayerConsts {
  [key: string]: mapboxgl.Layer;
}

export const LAYERS: LayerConsts = {
  EARTHQUAKES: {
    id: 'EARTHQUAKES',
    type: 'circle',
    source: 'earthquakes',
    paint: {
      'circle-color': '#f00',
      'circle-radius': 6,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
    },
  },
  THREE_D_MAGNITUDES: {
    id: 'THREE_D_MAGNITUDES',
    type: 'fill-extrusion',
    source: 'earthquakes-magnitude-polygons',
    paint: {
      'fill-extrusion-base': 0,
      //Height based on magnitude
      'fill-extrusion-height': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        0,
        0,
        2,
        50000,
        4,
        150000,
        6,
        400000,
        8,
        650000,
        10,
        1500000,
      ],

      //Colour based on magnitude, green -> yellow -> red
      'fill-extrusion-color': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        0,
        '#fff',
        2,
        '#0f0',
        4,
        '#ff0',
        6,
        '#f90',
        8,
        '#f60',
        10,
        '#f00',
      ],
      'fill-extrusion-vertical-gradient': false,
    },
  },
};
