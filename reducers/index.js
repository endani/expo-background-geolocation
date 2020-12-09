import { combineReducers } from 'redux';
import markersReducer from './markersReducer';
import coordinatesReducer from './coordinatesReducer';

export default combineReducers({
  markers: markersReducer,
  coordinates: coordinatesReducer,
});
