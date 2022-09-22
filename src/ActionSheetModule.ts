import { ActionSheetIOSStatic, NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-cross-action-sheet' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

interface ActionSheetModule {
  options: (
    title: string | null,
    message: string | null,
    cancel: string | null,
    options: string[],
    destructiveIndex: number,
    tintColor: string | null
  ) => Promise<number>;
  showActionSheetWithOptions: ActionSheetIOSStatic['showActionSheetWithOptions'];
  dismissActionSheet: () => void;
}

export const CrossActionSheet: ActionSheetModule =
  NativeModules.CrossActionSheet
    ? NativeModules.CrossActionSheet
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );
