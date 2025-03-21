export const getMapStyleThumbnail = (
  styleUsername: string,
  styleId: string,
  lng: number,
  lat: number,
  zoom: number,
  accessToken: string,
) => {
  const url = `https://api.mapbox.com/styles/v1/${styleUsername}/${styleId}/static/${lng},${lat},${zoom}/50x50?access_token=${accessToken}`;

  return url;
};
