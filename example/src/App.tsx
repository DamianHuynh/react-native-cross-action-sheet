import * as React from 'react';

import { StyleSheet, View, Text, Button, AppState } from 'react-native';
import ActionSheet from 'react-native-cross-action-sheet';

export default function App() {
  const onPress = () => {
    ActionSheet.options({
      options: [],
      cancel: { text: 'Cancel', onPress: () => {} },
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Show Action Sheet" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
