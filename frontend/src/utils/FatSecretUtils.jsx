import axios from 'axios';
import base64 from 'base-64';

const CLIENT_ID = "74b47e4faae14e88bb83121de55b6efa";
const CLIENT_SECRET = "6c0f7a1d0f6949ba8ac6998096000a49";
const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';

let accessToken = null;
let tokenExpiration = null;

const getAccessToken = async () => {
    try {
      console.log('Attempting to get access token...');
      
      // Use cached token if still valid
      if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
        console.log('Using cached token:', accessToken);
        return accessToken;
      }
  
      const authString = base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`);
      console.log('Making token request with auth:', authString);
  
      const response = await axios({
        method: 'post',
        url: TOKEN_URL,
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials'  // 🔥 Removed scope
      });
  
      console.log('Token response:', response.data);
  
      if (response.data && response.data.access_token) {
        accessToken = response.data.access_token;
        tokenExpiration = Date.now() + ((response.data.expires_in - 60) * 1000);
        console.log('New token acquired:', accessToken);
        return accessToken;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Token Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  };
  

const searchFood = async (query) => {
  try {
    console.log('Searching for food:', query);
    const token = await getAccessToken();
    
    if (!token) {
      console.error('No token available for food search');
      return null;
    }

    console.log('Making food search request...');
    const response = await axios({
      method: 'get',
      url: 'https://platform.fatsecret.com/rest/server.api',
      params: {
        method: 'foods.search',
        search_expression: query,
        format: 'json',
        max_results: 50  // Increased to get more results
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Food search response:', JSON.stringify(response.data, null, 2));
    return response.data;
    
  } catch (error) {
    console.error('Food Search Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return null;
  }
};

const fetchFoodDetails = async (foodId, accessToken) => {
  if (!foodId) {
    console.warn('Food ID is missing, skipping API request');
    return null;
  }
  // Proceed with the request if food_id is valid
  const response = await fetch(`https://api.example.com/food/${foodId}?access_token=${accessToken}`);
  const data = await response.json();
  return data;
};


// Simplified to just fetch food data without categorization
const fetchMealPlanFromAPI = async () => {
  try {
    console.log('Starting meal plan fetch...');
    
    // Search for some common foods
    const searchResponse = await searchFood('chicken');
    console.log('Search complete. Found foods:', searchResponse);

    if (!searchResponse?.foods?.food) {
      console.error('No foods found in search');
      return null;
    }

    // Get the raw search results
    const foods = Array.isArray(searchResponse.foods.food) 
      ? searchResponse.foods.food 
      : [searchResponse.foods.food];

    console.log('Processing', foods.length, 'foods');

    // Get details for each food
    const foodDetails = await Promise.all(
      foods.slice(0, 10).map(async (food) => {
        console.log('Fetching details for:', food.food_name);
        return await fetchFoodDetails(food.food_id);
      })
    );

    console.log('All food details fetched:', foodDetails);
    return foodDetails;

  } catch (error) {
    console.error('Meal Plan Error:', {
      message: error.message,
      stack: error.stack
    });
    return null;
  }
};

export { 
  getAccessToken, 
  searchFood, 
  fetchFoodDetails, 
  fetchMealPlanFromAPI 
};