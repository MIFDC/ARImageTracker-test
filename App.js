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
import * as math from 'mathjs';

import image from './assets/BarCode/qrcode_www.bing.com.png'

export default () => {
  const [text, setText] = useState("Initializing AR...");
  const [currentCameraOrientation, setCurrentCameraOrientation] = useState(null);
  const [currentBarCodePosition, setCurrentBarCodePosition] = useState(null);
  const [currentBarCodeRotation, setCurrentBarCodeRotation] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);
  const [isAnchorFound, setIsAnchorFound] = useState(false);

  const [isObjectDisplayed, setIsObjectDisplayed] = useState(false);
  const [barCodeGlobalPosition, setBarCodeGlobalPosition] = useState([0, 0, 0]);
  const [objectGlobalPosition, setObjectGlobalPosition] = useState([0, 0, 0]);
  const [objectDisplayedPosition, setObjectDisplayedPosition] = useState(null);
  const [objectKey, setObjectKey] = useState(0);

  const [isCameraTransformHandled, setIsCameraTransformHandled] = useState(false);
  const [isBarCodeFoundHandled, setIsBarCodeFoundHandled] = useState(false);


  const imageSource = Image.resolveAssetSource(image);
  const imageUrl = imageSource["uri"];

  ViroARTrackingTargets.createTargets({
    "BarCode": {
      source: image,
      orientation: "Up",
      type: 'Image',
      physicalWidth: 0.10
    },
  });

  ViroMaterials.createMaterials({
    wood: {
      diffuseTexture: require('./assets/Texture/Wood.jpg')
    }
  })


  const checkAndRunCalculateHandler = () => {
    if (isCameraTransformHandled && isBarCodeFoundHandled) {
      calculateHandler();
      setIsCameraTransformHandled(false);
      setIsBarCodeFoundHandled(false);
    }
  };


  const onCameraTransformHandler = (transform) => {

    setIsCameraTransformHandled(true);

    const cameraOrientationValue = transform;
    //console.log(transform);
    //console.log("cameraOrientationValue:", cameraOrientationValue);
    setCurrentCameraOrientation(cameraOrientationValue);
  };

  function getBarcodeGlobalCoordinates() {
    return [1, 2, 3]
  }

  function getNonComplianceGlobalCoordinates() {
    return [[1, 2, 4], [1, 0, 0]]
  }



  const scanQRCodeFromImage = async (imagePath) => {
    const scanResult = await Camera.scanFromURLAsync(imagePath);
    const scanResultnew = scanResult[0];
    const scanResultData = scanResultnew["data"];
    console.log("scanResultData:", scanResultData);
    setScannedResult(scanResultData);
  };

  const onBarCodeFoundMarker = (transform) => {

    setIsBarCodeFoundHandled(true);

    // console.log("currentCameraOrientation in app", currentCameraOrientation);
    scanQRCodeFromImage(imageUrl);
    const barCodePosition = transform["position"];
    const barCodeRotation = transform["rotation"];
    setCurrentBarCodePosition(barCodePosition);
    setCurrentBarCodeRotation(barCodeRotation);
    //console.log("barcodePosition:", barCodePosition);
    //console.log(cameraOrientation)
    setIsAnchorFound(true);
    const barCodeGlobalCoordinates = getBarcodeGlobalCoordinates();
    const listOfNonComplianceCoordinates = getNonComplianceGlobalCoordinates();
    setBarCodeGlobalPosition(barCodeGlobalCoordinates);
    setObjectGlobalPosition(listOfNonComplianceCoordinates[0]);
    console.log("listOfNonComplianceCoordinates[0]", listOfNonComplianceCoordinates[0])
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

  const normalize = (vector) => {
    const out = vec3.create();
    vec3.normalize(out, vector);
    return out;
  };

  // 计算仿射变换矩阵的函数
  const calculateAffineTransformation = (localMarkerCoords, globalMarkerCoords, localToMarkerVector, globalToMarkerVector) => {
    const localDirVector = normalize(localToMarkerVector);
    const globalDirVector = normalize(globalToMarkerVector);

    //calculate cross product
    const crossProduct = vec3.create();
    vec3.cross(crossProduct, localDirVector, globalDirVector);

    const s = vec3.length(crossProduct);

    //calculate dot product
    const dotProduct = vec3.dot(localDirVector, globalDirVector);

    const mx = mat4.fromValues(
      0, -crossProduct[2], crossProduct[1], 0,
      crossProduct[2], 0, -crossProduct[0], 0,
      -crossProduct[1], crossProduct[0], 0, 0,
      0, 0, 0, 1
    );

    const mx2 = mat4.create();
    mat4.multiply(mx2, mx, mx);
    const mx3 = mat4.create();
    mat4.multiplyScalar(mx3, mx2, (1 - dotProduct) / (s ** 2))

    const rotationMatrix = mat4.create();
    mat4.identity(rotationMatrix);
    mat4.add(rotationMatrix, rotationMatrix, mx);
    mat4.add(rotationMatrix, rotationMatrix, mx3);

    //apply rotation martrix to the local coordinates of Barcode
    const rotatedLocalMarkerCoords = vec3.create();
    vec3.transformMat4(rotatedLocalMarkerCoords, localMarkerCoords, rotationMatrix);

    //calculate translation vector
    const translationVector = vec3.create();
    vec3.sub(translationVector, globalMarkerCoords, rotatedLocalMarkerCoords);

    //combine translation vector and rotation martrix to get the translation martrix
    const affineTransformationMatrix = mat4.create();
    mat4.copy(affineTransformationMatrix, rotationMatrix);
    affineTransformationMatrix[12] = translationVector[0];
    affineTransformationMatrix[13] = translationVector[1];
    affineTransformationMatrix[14] = translationVector[2];

    return affineTransformationMatrix;
  };


  // 将点从全局坐标系转换到局部坐标系的函数
  const transformGlobalToLocal = (point, affineTransformationMatrix) => {
    const inverseMatrix = mat4.create();
    //invert the transformation martriex
    mat4.invert(inverseMatrix, affineTransformationMatrix);

    const pointHomogeneous = vec3.fromValues(point[0], point[1], point[2]);

    const transformedPointHomogeneous = vec3.create();
    vec3.transformMat4(transformedPointHomogeneous, pointHomogeneous, inverseMatrix);
    console.log("transformedPointHomogeneous:", transformedPointHomogeneous);
    return transformedPointHomogeneous;
  };


  const calculateHandler = useCallback(() => {
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

    const transformationMartix = calculateAffineTransformation(barCodeTranslationPosition, barCodeGlobalPosition, barCodeTranslationPosition, barCodeGlobalPosition)

    const objectCurrentDisplayedPosition = transformGlobalToLocal(objectGlobalPosition, transformationMartix)
    console.log("transformationMartrix:", transformationMartix)
    console.log("objectGlobalPosition:", objectGlobalPosition)
    //setObjectDisplayedPosition([...objectCurrentDisplayedPosition]);
    setObjectDisplayedPosition([...objectCurrentDisplayedPosition]);
    setObjectKey(prevKey => prevKey + 1);
    setIsObjectDisplayed(true);
  }, [currentCameraOrientation, currentBarCodePosition, currentBarCodeRotation, barCodeGlobalPosition, objectGlobalPosition]);

  // const toggleObjectStatus = () => {
  //   setIsObjectDisplayed(true);
  // }


  /*useEffect(() => {
    if (isAnchorFound) {
      //console.log("currentCameraOrientation in useEffect:",currentCameraOrientation);
      calculateHandler();
      setIsAnchorFound(false);
    }

    return;
  }, [currentCameraOrientation, isAnchorFound]);*/

  useEffect(() => {
    if (objectDisplayedPosition != null) {
      console.log("objectDisplayedPosition changed: ", objectDisplayedPosition);
      console.log("New position: ", JSON.stringify(objectDisplayedPosition));
      setObjectKey(prevKey => prevKey + 1);
    }
  }, [objectDisplayedPosition])

  const printHandler = () => {
    const cameraRotationAngle = currentCameraOrientation["rotation"];
    console.log("cameraRotationAngle", cameraRotationAngle);
  }

  /*const handleAnchorFound = async (transformInfo) => {
    onBarCodeFoundMarker(transformInfo);
    calculateHandler();
  };*/

  const initialScene = (props) => {
    const handleNavigation = () => {
      props.sceneNavigator.jump({ scene: secondScene })
    }

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
            key={objectKey}
            source={require("./assets/Diamond/diamond.obj")}
            resources={[
              require('./assets/Diamond/diamond.fbx'),
            ]}
            materials={["wood"]}
            highAccuracyEvents={true}
            position={objectDisplayedPosition || [0, 0, 0]}
            scale={[0.1, 0.1, 0.1]}
            rotation={[-45, 0, 0]}
            type="OBJ"
            transformBehaviors={["billboard"]}
            onTransformUpdate={(objectTransformInfo) =>
              objectTransformHandler(objectTransformInfo)
            }
            onLoadStart={() =>
              objectOnloadStartHandler()
            }
            onLoadEnd={() =>
              objectOnloadEndHandler()
            }
            onClick={() => onClickHandler()}
          />
        </ViroARImageMarker>
      </ViroARScene>
    )
  }

  const secondScene = (props) => {
    console.log("secondScene")
    return (
      <ViroARScene>

      </ViroARScene>

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
        <TouchableOpacity onPress={() => {
          checkAndRunCalculateHandler()
        }}>
          <Text>print</Text>
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
