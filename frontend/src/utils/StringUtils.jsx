export const capitalizeWords = (str) => {
  if (Array.isArray(str)) {
    // If input is an array, join the array and then capitalize words
    return str
      .join(' ') // Join array elements into a string
      .split(' ') // Split string into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
      .join(' '); // Join words back into a string
  }

  if (typeof str !== 'string') return str; // Ensure it's a string
  return str
    .split(' ') // Split string into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(' '); // Join words back into a string
};
