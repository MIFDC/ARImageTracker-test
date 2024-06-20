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
``` sh
sudo apt update && sudo apt install android-sdk -y
```
4. add the following lines to ur ~/.bashrc file
``` sh
export ANDROID_HOME="/usr/lib/android-sdk/"
export PATH="${PATH}:${ANDROID_HOME}tools/:${ANDROID_HOME}platform-tools/"
```
5. Run the following code to activate the virtual environment upon startup
``` sh
source ~/.bashrc
```
6. If step 3-5 having issues, just go to the followin website to download android studio and follow the steps.
https://developer.android.com/studio/install#64bit-libs




run:
npx expo run:android
Please make sure to install 