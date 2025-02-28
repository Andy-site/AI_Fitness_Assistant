package com.awesomeproject // your actual package name

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
import android.content.Intent
>>>>>>> Nutrition
import android.os.Bundle
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "AwesomeProject" // replace with your actual project name

<<<<<<< HEAD
<<<<<<< HEAD
    /**
     * Returns the instance of the [ReactActivityDelegate]. We use DefaultReactActivityDelegate.
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName)
}
=======
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "AwesomeProject"
=======
    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "AwesomeProject"
>>>>>>> Nutrition

    /**
     * Ensures React Native receives the new intent when the app is opened from a notification
     */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent) // Ensures the new intent is stored and can be accessed in React Native
    }

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flag [fabricEnabled]
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
>>>>>>> 39bad6ba8f3b37b79b679f0e3837b0988915940d
