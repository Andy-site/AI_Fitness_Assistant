import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onNotification: function (notification) {
    console.log("Notification received:", notification);
  },
  popInitialNotification: true,
  requestPermissions: true,
});

PushNotification.createChannel(
  {
    channelId: "meal-reminder", // Unique ID
    channelName: "Meal Reminder Channel",
    channelDescription: "A channel to send meal reminders",
    importance: 4, 
    vibrate: true,
  },
  (created) => console.log(`Channel created: ${created}`) // Logs if channel was created
);

export default PushNotification;
