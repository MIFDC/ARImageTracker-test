import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroAnimations,
  ViroText,
  ViroBox,
  ViroSphere,
  ViroMaterials,
  ViroOrbitCamera,
  ViroCamera,
  ViroNode,
  ViroTrackingReason,
  ViroConstants,
  ViroTrackingStateConstants,
} from "@viro-community/react-viro";
import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { transform } from "typescript";


const InitialScene = () => {

  ViroMaterials.createMaterials({
    wood: {
      diffuseTexture: require('./assets/Texture/Wood.jpg')
    }
  })
  ViroAnimations.registerAnimations({
    loopRotate: {
      dureation: 1000,
      properties: {
        rotateX: '+=45'
      }
    }
  })

  const [currentOrientation, setCurrentOrientation] = useState(null);
  const [currentHitResults, setCurrentHitResults] = useState(null);
  const [currentData, setCurrentData] = useState(null);


  function onCameraARHitHandler(transform) {
    const cameraOrientationValue = transform['cameraOrientation'];
    const hitTestResults = transform['hitTestResults'];

    console.log("cameraOrientationValue",cameraOrientationValue);
    console.log("hitTestResults", hitTestResults);
    
  }

  return (
    <ViroARScene
      onCameraARHitTest={(transformInfo) => onCameraARHitHandler(transformInfo)}>
      {/*<ViroText
        text={"Hello World"}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle} />*/}
      <ViroCamera position={[0, 0, 0]} active={true} />
      <ViroBox
        scale={[0.2, 0.2, 0.2]}
        position={[0, 0.5, -1]}
        materials={["wood"]}
      /*animation={{ name: 'loopRotate', loop: true, run: true }}*/
      />
    </ViroARScene>
  )
}

export default () => {

  return (
    <View style={styles.mainView}>
      <ViroARSceneNavigator
        initialScene={{
          scene: InitialScene
        }}
        style={{ flex: 1 }} />
      <View style={styles.controlView}>
        <TouchableOpacity>
          <Text>Get the position</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
};

var styles = StyleSheet.create({
  f1: { flex: 1 },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "red",
    textAlignVertical: "center",
    textAlign: "center",
  },
  mainView: {
    flex: 1
  },
  controlView: {
    height: 100,
    width: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  }

});
