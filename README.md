# Welcome to Quaker

This is a quick project I've written to plot and visualise real-time earthquake data, provided by [USGS.gov](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php).

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
