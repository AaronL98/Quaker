# Welcome to Quaker

Quaker is a Mapbox-driven app for exploring and visualising real-time earthquake data from the past 30 days, provided by [USGS.gov](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php). ![image](https://github.com/user-attachments/assets/dde752de-a593-4a19-85c4-fd4f4569c7f9)

## Features

### 📈 Visualisations

The following integrations are available in the app, using the visualisation button.

- None
- Clustered
- Heatmap
- 3D Magnitudes
<details>
    <summary>See more</summary>
    <img src="https://github.com/user-attachments/assets/93c79bd6-c65e-4b9c-ad81-a0f1758f7283"></img>
    

</details>

### 🔎 Advanced filters

You can refine the earthquakes shown on the map and in the list using place names and date ranges, a future addition could be a range slider for magnitude.

<details>
    <summary>See more</summary>
    <img src="https://github.com/user-attachments/assets/e0d51ce6-c9f2-44fc-a188-e8c641f13c7a"></img>
</details>

### 🎨 Map style selector

Using the style selector, the map style can be changed to any of the following:

- Streets
- Light
- Dark
- Satellite
<details>
    <summary>See more</summary>
    <img src="https://github.com/user-attachments/assets/8bad1fe4-efa5-4dc9-a32f-fa321fa4a377"></img>
</details>

### 🌙 Light or dark mode

Seamlessly switch between light or dark interfaces using the theme toggle.

<details>
    <summary>See more</summary>
    <img src="https://github.com/user-attachments/assets/f56c2305-ce79-4f5d-b45d-18ccc445fd77"></img>
</details>

## Run Quaker Locally

### Clone this repository

```shell
git clone https://github.com/AaronL98/Quaker.git
```

### Navigate to this repository

```shell
cd path/to/files
```

### Add a Mapbox API key

- Create a file named `.env` in the root directory of this project
- Add an entry for `VITE_MAPBOX_API_KEY` and set it to your public Mapbox API key
- Save the file

The file should look like:

```
VITE_MAPBOX_API_KEY=pk.xxxxxxxxxx
```

### Install dependencies

```shell
npm install
```

### Run the app

```shell
npm run dev
```

Vite should give you a `localhost` URL where you can access the app.

## The detailed stuff

### UX and UI approach

I decided to go for a 'floating module' approach, where the full application is just a single page; the map. Using an absolute and full-screen layout to position the map, I was able to add a flex box ontop of the entire screen to position any floating elements. By disabling pointer-events on the flexbox, users can still interact with the map, and re-enabling pointer events on any of the components that are within the flexbox keeps clicks valid on UI elements.

The layout consists of:

- A list of earthquakes
  - Users can filter and refine the earthquakes both on the map and in the list
  - Users can select an earthquake from the list and see more information about it on the map
  - Users can select an earthquake on the map, and find the list will scroll to show it.
- Visualisation selector
  - The only 'primary' colour button, with a clear call to action for the user that this is a key functionality of the app
  - Users can select from a range of different visualisations to better understand the data on the map
  - A simple button with a menu within a popover
- Map style selector
  - Easily change the map style, with 4 different styles implemented
  - Changing the style automatically keeps the layers, sources, and visualisations on the map.
- Theme switcher
  - The app is in light mode by default but can be switched to dark mode with the click of a button
  - All UI elements will shift colour to the light or dark variant

### Technologies and packages used

The application is built with Vite using Vue.js

Packages used:

- `Material Design Icons` - Material Design Icons font, for a wide range of icons that can be used in any component.
- `Tailwind CSS` - The superior styling framework, easy to style elements quickly, and easy to switch classes based on app theme (light/dark).
- `Turf` - Used to convert (buffer) earthquake points, to circle polygons in order to extrude them for the 3D Magnitude visualisation.
- `Axios` - For fetching the remote earthquake data from USGS.gov.
- `Mapbox-gl` - Map platform, the best option out there.
- `Pinia` - To create stores, that hold reference to the map, applied filters, filtered source data, etc.
  - I only previously had experience with VueX before this. After using Pinia, I'll be switching straight away!
- `PrimeVue` - Vue.js component framework, with beautiful and simple components.
  - I've been using this for the past few months and thoroughly enjoying it.
- `tailwindcss-primeui` - PrimeVue's tailwind extension, which allows usage of PrimeVue theme colours inside Tailwind classes.
- `vue-router` - Probably did not need to set this up since the application is only one page, but it's just common practice at this point.

### Performance considerations

Initially, I considered using USGS.gov's 7-day earthquake data source purely due to the volume of data, and started implementing that initially. I noticed the 30-day data source was proving underperformant when rendering the list of earthquakes (typically over 10,000). I virtualised the Listbox holding the earthquake items and noticed an instant performance improvement.

The only consideration I have is sometimes clicking an earthquake on the map, the virtual list box will attempt to scroll to that earthquake and there is a slight delay. This could be a future improvement.

The map itself performs well with lots of features added.
