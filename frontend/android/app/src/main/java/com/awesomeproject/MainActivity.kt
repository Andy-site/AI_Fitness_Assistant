package com.awesomeproject

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun getMainComponentName(): String {
        return "AwesomeProject" // Replace with your app name
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegate(this, mainComponentName)
    }
}
