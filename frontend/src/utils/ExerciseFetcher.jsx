// exerciseOptions.js
export const exerciseOptions = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'ccdb0b4d36msh5724ca5f32971b5p19b47bjsnf46d81526b76',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    },
  };
  
  export const fetchData = async (url, options) => {
    try {
      const response = await fetch(url, options);
      console.log('Response:', response); // Log the response to check
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json(); // Ensure the response is parsed as JSON
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };
  
  
  