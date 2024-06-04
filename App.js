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
import { StyleSheet, View, Text, TouchableOpacity, Image} from "react-native";
import { transform } from "typescript";
import { Camera } from "expo-camera";

export default () => {

  const image = require('./assets/BarCode/qrcode_www.bing.com.png');

  const imageSource = Image.resolveAssetSource(image);
  const imageUrl = imageSource["uri"];

  useEffect(() => {
    console.log("imageUrl:",typeof imageUrl);
    return;
  }, []);

  const [cameraOrientation, setCameraOrientation] = useState(null);
  const [currentCameraOrientation, setCurrentCameraOrientation] = useState(null);
  const [hitTestResults, setHitTestResults] = useState(null);
  const [currentBarCodePosition, setCurrentBarCodePosition] = useState(null);
  const [currentBarCodeRotation, setCurrentBarCodeRotation] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);

  ViroARTrackingTargets.createTargets({
    "BarCode": {
      source: image,
      orientation: "Up",
      type: 'Image',
      physicalWidth: 0.05
    },
  });


  const onCameraARHitHandler = (transform) => {

    const cameraOrientationValue = transform['cameraOrientation'];
    const hitTestResults = transform['hitTestResults'];
    //console.log(cameraOrientationValue);
    setCameraOrientation(cameraOrientationValue);
    setHitTestResults(hitTestResults);
    //console.log(hitTestResult);

  }


  const scanQRCodeFromImage = async (imagePath) => {
    try {
      const scanResult = await Camera.scanFromURLAsync(imagePath);
      const scanResultnew = scanResult[0];
      const scanResultData = scanResultnew["data"];
      console.log("scanResultData:", scanResultData);
      setScannedResult(scanResultData);
    }
    catch (error) {
      console.error("Error scanning QR code:", error);
    }

  }


  const barCodeImageDetector = (transform) => {
    console.log("BarCode Found")
    scanQRCodeFromImage(imageUrl);
    const barCodePosition = transform['position'];
    const barCodeRotation = transform['rotation']
    setCurrentBarCodePosition(barCodePosition);
    setCurrentBarCodeRotation(barCodeRotation);
    setCurrentCameraOrientation(cameraOrientation);
    // console.log(barCodePosition);
    //console.log(cameraOrientation)
  }

  useEffect(() => {
    if (currentCameraOrientation !== null) {
      console.log('currentCameraOrientation:', currentCameraOrientation);
    }
  }, [currentCameraOrientation]);

  useEffect(() => {
    if (scannedResult !== null) {
      console.log('Scanned Result:', scannedResult);
    }
  }, [scannedResult]);



  function calculateDistance(pos1, pos2) {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  function calculateVectors(cameraPos, objectPos) {
    return [
      cameraPos[0] - objectPos[0],
      cameraPos[1] - objectPos[1],
      cameraPos[2] - objectPos[2]
    ];
  }

  const calculateHandler = () => {


    //console.log("Camera Orientation position: ", cameraOrientation.position);
    //const hitTestResultsPosition = hitTestResults[0];
    //console.log("Hit Test Result", hitTestResultsPosition);
    //console.log("BarCode Position: ", currentBarCodePosition);
    //console.log("BarCode Rotation: ", currentBarCodeRotation)
    console.log(currentCameraOrientation);
    const distance = calculateDistance(currentCameraOrientation.position, currentBarCodePosition);
    const direction = calculateVectors(currentCameraOrientation.position, currentBarCodePosition);
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
        <ViroARImageMarker target={"BarCode"} onAnchorFound={(transformInfo) => barCodeImageDetector(transformInfo)}>
        </ViroARImageMarker>
        <ViroBox
          scale={[0.2, 0.2, 0.2]}
          position={[-1, 0, -1]}
          materials={["wood"]}
          animation={{ name: 'loopRotate', loop: true, run: true }}
        />
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