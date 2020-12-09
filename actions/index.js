export const addMarker = marker => ({
  type: 'ADD_MARKER',
  payload: marker,
});

export const addCoordinate = coordinate => ({
  type: 'ADD_COORDINATE',
  payload: coordinate,
});
