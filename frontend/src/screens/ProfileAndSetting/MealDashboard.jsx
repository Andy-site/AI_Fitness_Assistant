import axios from 'axios';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [dietaryStats, setDietaryStats] = useState([]);
  const [consumptionStats, setConsumptionStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://<your-backend-url>/meal-plans/stats/', {
          headers: {
            Authorization: `Bearer ${userToken}`, // Replace with your authentication token
          },
        });
        setDietaryStats(response.data.dietary_stats);
        setConsumptionStats(response.data.consumption_stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Dietary Preferences</h2>
      <ul>
        {dietaryStats.map((stat) => (
          <li key={stat.dietary_restriction}>
            {stat.dietary_restriction}: {stat.total} meals
          </li>
        ))}
      </ul>

      <h2>Consumption Stats</h2>
      <ul>
        {consumptionStats.map((stat) => (
          <li key={stat.is_consumed}>
            {stat.is_consumed ? 'Consumed' : 'Not Consumed'}: {stat.total} meals
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;

const sortedMealPlan = [...mealPlan].sort((a, b) =>
    a.dietary_restriction.localeCompare(b.dietary_restriction)
  );
  
  return (
    <ScrollView>
      {sortedMealPlan.map((meal, index) => renderMealPage(meal, index))}
    </ScrollView>
  );