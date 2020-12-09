export default (state = [], action) => {
  switch (action.type) {
    case 'ADD_COORDINATE':
      return [...state, action.payload];
    default:
      return state;
  }
};
