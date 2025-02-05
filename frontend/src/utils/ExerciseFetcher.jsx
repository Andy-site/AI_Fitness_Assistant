// exerciseOptions.js
export const exerciseOptions = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '3ad4a2f8admsh440268a18f36360p163235jsne9d005b72609',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    },
  };
  
  export const fetchData = async (url, options) => {
    try {
      const response = await fetch(url, options);
      const data = await response.json();  // Corrected: invoking json() method properly
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };
  