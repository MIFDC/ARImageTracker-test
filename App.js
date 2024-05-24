import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroAnimations,
  ViroARImageMarker,
  ViroARTrackingTargets,
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
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { transform } from "typescript";



const imageUrl = './assets/BarCode/qrcode_www.bing.com.png'


function onCameraARHitHandler(transform) {

  const cameraOrientationValue = transform['cameraOrientation'];
  const hitTestResults = transform['hitTestResults'];

  //console.log("cameraOrientationValue", cameraOrientationValue);
  //console.log("hitTestResults", hitTestResults);
}

const barCodeHandler = () => {
  console.log(imageUrl)

}

const InitialScene = () => {

  ViroMaterials.createMaterials({
    wood: {
      diffuseTexture: require('./assets/Texture/Wood.jpg')
    }
  })
  ViroAnimations.registerAnimations({
    loopRotate: {
      duration: 1000,
      properties: {
        rotateY: '+=45'
      }
    }
  })


  return (
    <ViroARScene
      onCameraARHitTest={(transformInfo) => onCameraARHitHandler(transformInfo)}>
      {/*<ViroText
        text={"Hello World"}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle} />*/}
      <ViroARImageMarker target={"BarCode"} onAnchorFound={() => barCodeHandler}>

      </ViroARImageMarker>
      <ViroBox
        scale={[0.2, 0.2, 0.2]}
        position={[0, 0.5, -1]}
        materials={["wood"]}
        animation={{ name: 'loopRotate', loop: true, run: true }}
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
        <TouchableOpacity onPress={() => barCodeHandler()}>
          <Text>Get the position</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
};


ViroARTrackingTargets.createTargets({
  "BarCode": {
    source: require(imageUrl),
    orientation: "Up",
    type: 'Image',
    physicalWidth: 0.05
  },
});

var styles = StyleSheet.create({
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
