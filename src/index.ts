import { ActionSheetIOSOptions, Platform } from 'react-native';
import { ActionSheetCancelledError } from './ActionSheetCancelledError';
import { CrossActionSheet } from './ActionSheetModule';

export interface ActionSheetOptions {
  title?: string;
  message?: string;
  options: {
    destructive?: boolean;
    text: string;
    onPress: () => void | Promise<void>;
  }[];
  cancel?:
    | {
        text?: string;
        onPress?: () => void | Promise<void>;
      }
    | false;
  tintColor?: string;
  anchor?: number;
}

async function androidOptions(opt: ActionSheetOptions) {
  const index = await CrossActionSheet.options(
    opt.title ?? null,
    opt.message ?? null,
    opt.cancel === false ? null : opt.cancel?.text ? opt.cancel.text : 'Cancel',
    opt.options.map((it) => it.text),
    opt.options.findIndex((it) => it.destructive),
    opt.tintColor ?? null
  );
  if (index === -1) {
    if (opt.cancel && !opt.cancel.onPress) {
      opt.cancel.onPress = () => {};
    }
    if (opt.cancel && opt.cancel.onPress) {
      await opt.cancel?.onPress();
    } else {
      throw new ActionSheetCancelledError();
    }
  } else {
    await opt.options[index]?.onPress();
  }
}

async function iosOptions(opt: ActionSheetOptions) {
  const options = opt.options.map<string>((it) => it.text);
  const cancel =
    opt.cancel === false ? null : opt.cancel?.text ? opt.cancel.text : 'Cancel';
  return new Promise((res, rej) => {
    CrossActionSheet.showActionSheetWithOptions(
      {
        title: opt.title,
        message: opt.message,
        options: cancel ? [...options, cancel] : options,
        destructiveButtonIndex: opt.options.findIndex((it) => it.destructive),
        cancelButtonIndex: cancel ? options.length : undefined,
        tintColor: opt.tintColor,
        anchor: opt.anchor,
      },
      async (buttonIndex: number) => {
        if (opt.cancel && !opt.cancel.onPress) {
          opt.cancel.onPress = () => {};
        }
        if (cancel && buttonIndex === options.length) {
          if (opt.cancel && opt.cancel.onPress) {
            res(await opt.cancel?.onPress());
          } else {
            rej(new ActionSheetCancelledError());
          }
        } else {
          res(opt.options[buttonIndex]?.onPress());
        }
      }
    );
  });
}

const showActionSheetWithOptions = (
  options: ActionSheetIOSOptions,
  callback: (buttonIndex: number) => void
) => {
  if (Platform.OS === 'android') {
    CrossActionSheet.showActionSheetWithOptions(options, callback);
  } else if (Platform.OS === 'ios') {
    CrossActionSheet.showActionSheetWithOptions(options, callback);
  } else {
    throw Error('Unsupported OS. Only Android or iOS is allowed');
  }
};

const options = async (opt: ActionSheetOptions) => {
  if (Platform.OS === 'android') {
    await androidOptions(opt);
  } else if (Platform.OS === 'ios') {
    await iosOptions(opt);
  } else {
    throw Error('Unsupported OS. Only Android or iOS is allowed');
  }
};

const dismiss = () => {
  CrossActionSheet.dismissActionSheet();
};

const ActionSheet = {
  showActionSheetWithOptions,
  options,
  dismiss,
};

export default ActionSheet;
