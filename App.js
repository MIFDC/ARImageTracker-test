import {
  ViroARScene,
  ViroARSceneNavigator,
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
import { StyleSheet, View, Text, Touchable} from "react-native";
import { setConstantValue } from "typescript";


const InitialScene = () => {

  ViroMaterials.createMaterials({
    wood: {
      diffuseTexture: require('./assets/Texture/Wood.jpg')
    }
  })

  return (
    <ViroARScene>
      {/*<ViroText
        text={"Hello World"}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle} />*/}
      <ViroCamera active={true} />
      <ViroBox
        scale={[0.2, 0.2, 0.2]}
        position={[0, 0, -1]}
        materials={["wood"]} />
    </ViroARScene>
  )
}

export default () => {
  const [currentPosition, setCurrentPosition] = useState([0, 0, 0]);

  const getPosition = () => {
    setCurrentPosition(ViroOrbitCamera.position)
    console.log(currentPosition);
  }

  return (
    <View style={styles.mainView}>
      <ViroARSceneNavigator
        initialScene={{
          scene: InitialScene
        }}
        style={{ flex: 1 }} />
      <View style={styles.controlView}>
        <Touchable onPress={() => getPosition()}>
          <Text>Get the position</Text>
        </Touchable>
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
