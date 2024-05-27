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

export default () => {

  const imageUrl = './assets/BarCode/qrcode_www.bing.com.png'

  const [currentOrientation, setCurrentOrientation] = useState(null);
  const [currentHitTest, setCurrentHitTest] = useState(null);
  const [currentBarCodePosition, setCurrentBarCodePosition] = useState(null);
  const [currentBarCodeRotation, setCurrentBarCodeRotation] = useState(null);

  ViroARTrackingTargets.createTargets({
    "BarCode": {
      source: require(imageUrl),
      orientation: "Up",
      type: 'Image',
      physicalWidth: 0.05
    },
  });


  const onCameraARHitHandler = (transform) => {

    const cameraOrientationValue = transform['cameraOrientation'];
    const hitTestResults = transform['hitTestResults'];
    setCurrentOrientation(cameraOrientationValue);
    setCurrentHitTest(hitTestResults);
    //console.log(hitTestResult);
    //console.log(cameraOrinetationValue);
  }

  const barCodeHandler = (transform) => {
    console.log(imageUrl);
    const barCodePosition = transform['position'];
    const barCodeRotation = transform['rotation']
    setCurrentBarCodePosition(barCodePosition);
    setCurrentBarCodeRotation(barCodeRotation);
    console.log(barCodePosition);
  }


  function calculateDistance(pos1, pos2) {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  function calculateDirection(cameraPos, objectPos) {
    return [
      objectPos[0] - cameraPos[0],
      objectPos[1] - cameraPos[1],
      objectPos[2] - cameraPos[2]
    ];
  }

  const calculateHandler = () => {
    console.log("Camera Orientation position: ", currentOrientation.position);
    //const hitTestResultsPosition = currentHitTest[0];
    //console.log("Hit Test Result", hitTestResultsPosition);
    console.log("BarCode Position: ", currentBarCodePosition);
    //console.log("BarCode Rotation: ", currentBarCodeRotation)
    const distance = calculateDistance(currentOrientation.position, currentBarCodePosition);
    const direction = calculateDirection(currentOrientation.position, currentBarCodePosition);
    console.log("distance: ", distance);
    console.log("direction: ", direction);
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
        <ViroARImageMarker target={"BarCode"} onAnchorFound={(transformInfo) => barCodeHandler(transformInfo)}>
          <ViroBox
            scale={[0.2, 0.2, 0.2]}
            position={[0, 0.5, -1]}
            materials={["wood"]}
            animation={{ name: 'loopRotate', loop: true, run: true }}
          />
        </ViroARImageMarker>

      </ViroARScene>
    )
  }



  return (
    <View style={styles.mainView}>
      <ViroARSceneNavigator
        initialScene={{
          scene: InitialScene
        }}
        style={{ flex: 1 }} />
      <View style={styles.controlView}>
        <TouchableOpacity onPress={() => calculateHandler()}>
          <Text>Calculate the Distance</Text>
        </TouchableOpacity>
      </View>
    </View>

  );

};




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