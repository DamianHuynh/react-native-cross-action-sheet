import * as React from 'react';

import { StyleSheet, View, Button, AppState } from 'react-native';
import ActionSheet from 'react-native-cross-action-sheet';

export default function App() {
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') ActionSheet.dismiss();

      return () => sub.remove();
    });
  }, []);

  const onPress = () => {
    ActionSheet.options({
      options: [{ text: 'Option 1', onPress: () => {} }],
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
