export const capitalizeWords = (str = '') => {
  if (typeof str !== 'string') {
    return ''; // Return an empty string if the input is not a string
  }
  
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
