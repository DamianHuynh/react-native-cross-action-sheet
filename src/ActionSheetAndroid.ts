import { Platform } from 'react-native';
import { CrossActionSheet } from './ActionSheetModule';

export interface ActionSheetAndroidOptions {
  title?: string;
  message?: string;
  options: string[];
  cancelButtonIndex?: number;
  destructiveButtonIndex?: number;
  tintColor?: string;
}

export const ActionSheetAndroid = new (class {
  showActionSheetWithOptions(
    options: ActionSheetAndroidOptions,
    callback: (buttonIndex: number) => void
  ) {
    if (Platform.OS === 'android') {
      const optionsWithoutCancel = options.options.filter(
        (_, index) => index !== options.cancelButtonIndex
      );
      let destructiveButtonIndex = options.destructiveButtonIndex ?? -1;
      if (
        destructiveButtonIndex != null &&
        options.cancelButtonIndex != null &&
        destructiveButtonIndex > options.cancelButtonIndex
      ) {
        destructiveButtonIndex = destructiveButtonIndex - 1;
      }
      CrossActionSheet.options(
        options.title ?? null,
        options.message ?? null,
        //@ts-ignore
        options.cancelButtonIndex
          ? options.options[options.cancelButtonIndex]
          : null,
        optionsWithoutCancel,
        destructiveButtonIndex,
        options.tintColor ?? null
      ).then((index) => {
        if (options.cancelButtonIndex != null) {
          if (index === -1) {
            callback(options.cancelButtonIndex);
          } else if (index >= options.cancelButtonIndex) {
            callback(index + 1);
          } else {
            callback(index);
          }
        } else {
          callback(index);
        }
      });
    }
  }
})();
