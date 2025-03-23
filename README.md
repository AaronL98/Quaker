# Welcome to Quaker

This is a quick project I've written to plot and visualise real-time earthquake data, provided by [USGS.gov](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php).
![image](https://github.com/user-attachments/assets/dde752de-a593-4a19-85c4-fd4f4569c7f9)

### Supports ☀️ Light and 🌙 Dark mode
![image](https://github.com/user-attachments/assets/f56c2305-ce79-4f5d-b45d-18ccc445fd77)

## Visualisations
- None
- Clustered
- Heatmap
- 3D Magnitudes

## Run Quaker Locally

### Clone this repository

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
