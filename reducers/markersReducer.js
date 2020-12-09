export default (state = [], action) => {
  switch (action.type) {
    case 'ADD_MARKER':
      return [...state, action.payload];
    default:
      return state;
  }
};
