import {
  ViroARScene,
  ViroARPlane,
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
} from "@reactvision/react-viro";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
// import { transform } from "typescript";
import { Camera, CameraView } from "expo-camera";
import { mat4, vec3, quat } from "gl-matrix";
import { Asset } from "expo-asset";

import image from './assets/BarCode/qrcode_www.bing.com.png'

export default () => {
  const [text, setText] = useState("Initializing AR...");
  const [currentCameraOrientation, setCurrentCameraOrientation] = useState(null);
  const [currentBarCodePosition, setCurrentBarCodePosition] = useState(null);
  const [currentBarCodeRotation, setCurrentBarCodeRotation] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);
  const [isAnchorFound, setIsAnchorFound] = useState(false);

  const [isObjectDisplayed, setIsObjectDisplayed] = useState(false);
  const [barcodeGlobalPosition, setBarcodeGlobalPosition] = useState([0, 0, 0]);
  const [objectGlobalPosition, setObjectGlobalPosition] = useState([0, 0, 0]);
  const [objectDisplayedPosition, setObjectDisplayedPosition] = useState(null);

  const imageSource = Image.resolveAssetSource(image);
  const imageUrl = imageSource["uri"];

  ViroARTrackingTargets.createTargets({
    "BarCode": {
      source: image,
      orientation: "Up",
      type: 'Image',
      physicalWidth: 0.06
    },
  });

  ViroMaterials.createMaterials({
    wood: {
      diffuseTexture: require('./assets/Texture/Wood.jpg')
    }
  })


  const onCameraTransformHandler = (transform) => {
    const cameraOrientationValue = transform;
    //console.log(transform);
    // console.log("cameraOrientationValue:", cameraOrientationValue);
    setCurrentCameraOrientation(cameraOrientationValue);
    // console.log("cameraOrientationValue in onCameraHandler:", cameraOrientationValue);
  };

  useEffect(() => {
    if (isAnchorFound) {
      console.log(
        "currentCameraOrientation in useEffect:",
        currentCameraOrientation
      );
      calculateHandler();
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
  };

  const onBarCodeFoundMarker = (transform) => {
    // console.log("currentCameraOrientation in app", currentCameraOrientation);
    scanQRCodeFromImage(imageUrl);
    const barCodePosition = transform["position"];
    const barCodeRotation = transform["rotation"];
    setCurrentBarCodePosition(barCodePosition);
    setCurrentBarCodeRotation(barCodeRotation);
    console.log("barcodePosition:", barCodePosition);
    //console.log(cameraOrientation)
    setIsAnchorFound(true);
    setBarcodeGlobalPosition([100, 100, 2]);
    setObjectGlobalPosition([100, 100, 0]);
    // console.log("onBarCodeFound transformInfo Marker", transform)
  };

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
    const cameraPosition = currentCameraOrientation["position"];
    const cameraRotation = currentCameraOrientation["rotation"];
    //console.log("Camera Orientation position: ", cameraOrientation.position);

    //console.log("cameraOrientationFound:", cameraOrientationFound);
    //console.log("Camera Position:", cameraPosition);
    //console.log("Camera Rotation", cameraRotation);
    //console.log("BarCode Position: ", currentBarCodePosition);
    //console.log("BarCode Rotation: ", currentBarCodeRotation);
    const cameraMatrix = createTransformationMatrix(
      cameraPosition,
      cameraRotation
    );
    const barCodeMatrix = createTransformationMatrix(
      currentBarCodePosition,
      currentBarCodeRotation
    );

    // the calculate using rotation
    const cameraTranslationPosition = vec3.create();
    mat4.getTranslation(cameraTranslationPosition, cameraMatrix);

    const barCodeTranslationPosition = vec3.create();
    mat4.getTranslation(barCodeTranslationPosition, barCodeMatrix);

    const accurateVector = vec3.create();
    vec3.subtract(accurateVector, cameraTranslationPosition, barCodeTranslationPosition);
    const accurateDistance = vec3.length(accurateVector);
    console.log("vector: ", accurateVector);
    console.log("distance considering rotation:", accurateDistance);


    const objectToBarcodeVector = vec3.create();
    vec3.subtract(objectToBarcodeVector, objectGlobalPosition, barcodeGlobalPosition);
    const objectCurrentDisplayedPosition = vec3.create();
    vec3.add(objectCurrentDisplayedPosition, currentBarCodePosition, objectToBarcodeVector);
    setObjectDisplayedPosition(objectCurrentDisplayedPosition);
    console.log("objectCurrentDisplayedPosition: ", objectCurrentDisplayedPosition);
    setIsObjectDisplayed(true);

  };

  // const toggleObjectStatus = () => {
  //   setIsObjectDisplayed(true);
  // }

  useEffect(() => {
    if (isObjectDisplayed && objectDisplayedPosition != null) { console.log("objectDisplayedPosition: ", objectDisplayedPosition) }
  }, [objectDisplayedPosition])

  const initialScene = (props) => {

    return (
      <ViroARScene
        onCameraTransformUpdate={(orientationInfo) =>
          onCameraTransformHandler(orientationInfo)
        }
      >
        <ViroARImageMarker
          target={"BarCode"}
          onAnchorFound={(transformInfo) => {
            onBarCodeFoundMarker(transformInfo);
          }}
        >
          <ViroAmbientLight color="#ffffff" />
          <Viro3DObject
            source={require("./assets/Diamond/diamond.obj")}
            resources={[
              require('./assets/Diamond/diamond.fbx'),
            ]}
            materials={["wood"]}
            highAccuracyEvents={true}
            position={objectDisplayedPosition}
            scale={[0.2, 0.2, 0.2]}
            type="OBJ"
          />
        </ViroARImageMarker>

      </ViroARScene>
      // <ViroARScene onTrackingUpdated={onInitialized}>
      //   <ViroText
      //     text={text}
      //     scale={[0.5, 0.5, 0.5]}
      //     position={[0, 0, -1]}
      //     style={styles.helloWorldTextStyle}
      //   />
      // </ViroARScene>
    )
  }

  return (
    <View style={styles.mainView}>
      <ViroARSceneNavigator
        initialScene={{
          scene: initialScene,
        }}
        style={{ flex: 1 }}
      />
      <View style={styles.controlView}>
        <TouchableOpacity onPress={() => calculateHandler()}>
          <Text>Calculate the Distance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
// export default () => {
//   return (
//     <ViroARSceneNavigator
//       autofocus={true}
//       initialScene={{
//         scene: HelloWorldSceneAR,
//       }}
//       style={styles.f1}
//     />
//   );
// };

var styles = StyleSheet.create({
  f1: { flex: 1 },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
  mainView: {
    display: "flex",
    width: "auto",
    height: "auto",
    flex: 1,
  },
  controlView: {
    height: 100,
    width: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
