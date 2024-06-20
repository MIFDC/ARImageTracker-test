The index.js should include:


/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);



AppRegistry.registerComponent('main', () => App);

if (Platform.OS === 'web') {
    const rootTag = document.getElementById('root') || document.getElementById('X');
    AppRegistry.runApplication('main', { rootTag });
}


## RUN INSTRUCTIONS
1. Install eas-cli found on expo website
2. Install JAVA 17
3. Install ANDROID SDK 
Just go to the followin website to download android studio and follow the steps.
https://developer.android.com/studio/install#64bit-libs
4. add the following lines to ur ~/.bashrc file
``` sh
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME="${HOME}/Android/Sdk/"
export PATH="${PATH}:${ANDROID_HOME}tools/:${ANDROID_HOME}platform-tools/"
```
5.  Install NINJA 
``` sh
sudo apt update && sudo apt install ninja-build
```

6. Run the following code to activate the virtual environment upon startup
``` sh
source ~/.bashrc
```
7. Upgrade compatible expo. this will fix all the expo compatible SDKs
``` sh
npx expo install --fix
```
8. to install other libraries use, this code below will allow for installing compatible libraries to check for deprecation
``` sh
npx expo install expo-camera expo-sensors expo-contacts
```

9. to clean ur setup from root project
``` sh
cd android && ./gradlew clean && cd .. && npx expo run:android
```