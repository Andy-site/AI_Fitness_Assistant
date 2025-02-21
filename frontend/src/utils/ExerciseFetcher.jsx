// exerciseOptions.js
export const exerciseOptions = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '7226c219d7msh914306b69e1c1c5p180ff6jsn9bb0fccda471',
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



  
  
  