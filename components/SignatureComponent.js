import React, { useRef } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';

const SignatureComponent = () => {
  const ref = useRef();

  const handleSignature = (signature) => {
    console.log(signature); 
  };

  const handleEmpty = () => {
    console.log('Empty');
  };

  const handleClear = () => {
    ref.current.clearSignature();
  };

  const handleConfirm = () => {
    ref.current.readSignature();
  };

  return (
    <View style={styles.container}>
      <SignatureScreen
        ref={ref}
        onOK={handleSignature}
        onEmpty={handleEmpty}
        descriptionText="Sign"
        clearText="Clear"
        confirmText="Save"
        webStyle={styles.webStyle}
      />
      <View style={styles.buttons}>
        <Button title="Clear" onPress={handleClear} />
        <Button title="SendSignature" onPress={handleConfirm} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webStyle: `
    .m-signature-pad--footer {
      display: none;
      margin: 0px;
    }
  `,
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
});

export default SignatureComponent;
