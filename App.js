import {
  ViroARScene,
  ViroARSceneNavigator,
  Viro3DSceneNavigator,
  ViroAnimations,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroText,
  ViroBox,
  Viro3DObject,
  ViroAmbientLight,
  ViroMaterials,
  ViroOrbitCamera,
  ViroCamera,
  ViroNode,
  ViroTrackingReason,
  ViroConstants,
  ViroTrackingStateConstants,
} from "@viro-community/react-viro";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { transform } from "typescript";
import { Camera } from "expo-camera";
import { mat4, vec3, quat } from 'gl-matrix';
import {Asset} from 'expo-asset';


export default () => {
  const imageUrl = "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB1msMIy.img";

  const [currentCameraOrientation, setCurrentCameraOrientation] = useState(null);
  const [cameraOrientationFound, setCameraOrientationFound] = useState(null);
  const [currentBarCodePosition, setCurrentBarCodePosition] = useState(null);
  const [currentBarCodeRotation, setCurrentBarCodeRotation] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);
  const [isAnchorFound, setIsAnchorFound] = useState(false);
  const [objectUri, setObjectUri] = useState(null);

  useEffect(() => {
    const loadAsset = async () => {
      const asset = Asset.fromModule(require('./assets/Diamond/diamond.obj'));
      await asset.downloadAsync();
      setObjectUri(asset.uri);
    };

    loadAsset();
  }, []);

  useEffect(() => {
    console.log(objectUri);
  }, [objectUri]);


  const onCameraTransformHandler = (transform) => {

    const cameraOrientationValue = transform;
    //console.log(transform);
    // console.log("cameraOrientationValue:", cameraOrientationValue);
    setCurrentCameraOrientation(cameraOrientationValue);
    // console.log("cameraOrientationValue in onCameraHandler:", cameraOrientationValue);
  }

  useEffect(() => {
    if (isAnchorFound) {
      setCameraOrientationFound(currentCameraOrientation);
      console.log("currentCameraOrientation in useEffect:", currentCameraOrientation);
      setIsAnchorFound(false);
    }

    return;
  }, [currentCameraOrientation, isAnchorFound]);

  const scanQRCodeFromImage = async (imagePath) => {

    const scanResult = await Camera.scanFromURLAsync(imagePath);
    const scanResultnew = scanResult[0];
    const scanResultData = scanResultnew["data"];
    console.log("scanResultData:", scanResultData);
    setScannedResult(scanResultData);

  }


  const onBarCodeFoundMarker = (transform) => {
    // console.log("currentCameraOrientation in app", currentCameraOrientation);
    setCameraOrientationFound(currentCameraOrientation);
    scanQRCodeFromImage(imageUrl);
    const barCodePosition = transform['position'];
    const barCodeRotation = transform['rotation']
    setCurrentBarCodePosition(barCodePosition);
    setCurrentBarCodeRotation(barCodeRotation);
    // console.log(barCodePosition);
    //console.log(cameraOrientation)
    setIsAnchorFound(true);
    // console.log("onBarCodeFound transformInfo Marker", transform)
  }


  // useEffect(() => {
  //   if (scannedResult !== null) {
  //     console.log('Scanned Result:', scannedResult);
  //   }
  // }, [scannedResult]);



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

  // rad for calculate
  const degreeToRadian = (degree) => degree * (Math.PI / 180);

  // eula to 4 quad
  const eulerToQuat = (euler) => {
    const q = quat.create();
    quat.fromEuler(q, euler[0], euler[1], euler[2]);
    return q;
  };

  // generate matrix
  const createTransformationMatrix = (position, rotation) => {
    const translation = vec3.fromValues(...position);
    const quaternion = eulerToQuat(rotation.map(degreeToRadian));

    const matrix = mat4.create();
    mat4.fromRotationTranslation(matrix, quaternion, translation);

    return matrix;
  };


  const calculateHandler = () => {

    const cameraPosition = cameraOrientationFound["position"]
    const cameraRotation = cameraOrientationFound["rotation"]
    //console.log("Camera Orientation position: ", cameraOrientation.position);

    //console.log("cameraOrientationFound:", cameraOrientationFound);
    //console.log("Camera Position:", cameraPosition);
    //console.log("Camera Rotation", cameraRotation);
    //console.log("BarCode Position: ", currentBarCodePosition);
    //console.log("BarCode Rotation: ", currentBarCodeRotation);
    const cameraMatrix = createTransformationMatrix(cameraPosition, cameraRotation);
    const barCodeMatrix = createTransformationMatrix(currentBarCodePosition, currentBarCodeRotation);

    // the calculate using eula angle
    const cameraGlobalPosition = vec3.create();
    mat4.getTranslation(cameraGlobalPosition, cameraMatrix);

    const barCodeGlobalPosition = vec3.create();
    mat4.getTranslation(barCodeGlobalPosition, barCodeMatrix);

    const accurateVector = vec3.create();
    vec3.subtract(accurateVector, barCodeGlobalPosition, cameraGlobalPosition);
    const accurateDistance = vec3.length(accurateVector);
    console.log('vector considering rotation:', accurateVector);
    console.log('distance considering rotation:', accurateDistance);

    //distance calculated simply with position
    const distance = calculateDistance(cameraPosition, currentBarCodePosition);
    const direction = calculateVectors(cameraPosition, currentBarCodePosition);
    console.log("distance: ", distance);
    console.log("verctor between camera and barcode: ", direction);
  }



  const InitialScene = () => {


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
        onCameraTransformUpdate={(orientationInfo) => onCameraTransformHandler(orientationInfo)}
      >
        {/*<ViroText
        text={"Hello World"}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle} />*/}
        <ViroARImageMarker target={"BarCode"} onAnchorFound={(transformInfo) => {
          onBarCodeFoundMarker(transformInfo);
        }
        }>
        </ViroARImageMarker>
        <ViroAmbientLight color="#ffffff" />
        <Viro3DObject
          source={objectUri}
          highAccuracyEvents={true}
          position={[0, 0, -2]}
          scale={[1, 1, 1]}
          type="OBJ"
        />
      </ViroARScene>
    )
  }


  return (
    <View style={styles.mainView}>
      <Viro3DSceneNavigator
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