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



run:
npx expo run:android




