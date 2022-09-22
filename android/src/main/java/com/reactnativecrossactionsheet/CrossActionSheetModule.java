package com.reactnativecrossactionsheet;

import android.content.res.Configuration;
import android.graphics.Color;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.google.android.material.bottomsheet.BottomSheetDialog;

import java.util.ArrayList;
import java.util.List;

public class CrossActionSheetModule extends ReactContextBaseJavaModule {
    public static final String NAME = "CrossActionSheet";
    private final ReactApplicationContext reactContext;
    private boolean isShowingDialog = false;
    BottomSheetDialog dialog;

    public CrossActionSheetModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return NAME;
    }


     @ReactMethod
    public void options(String title, String message, String cancel, ReadableArray option, int destructiveIndex,  String tintColor, Promise promise) {
        if (!isShowingDialog) {
            List<Object> messageStrList = option.toArrayList();
            List<String> strList = new ArrayList<String>();

            for (Object msg: messageStrList) {
                if (msg instanceof String) {
                    strList.add((String) msg);
                }
            }


            dialog = new BottomSheetDialog(getCurrentActivity(), R.style.BottomSheetDialog);
            dialog.setContentView(R.layout.actionsheet);

            if (title != null || message != null) {
                LinearLayout header = dialog.findViewById(R.id.actionsheet_header);
                header.setPadding(0, 24, 0, 24);
                if (title != null) {
                    TextView titleText = dialog.findViewById(R.id.actionsheet_title);
                    titleText.setText(title);
                    titleText.setVisibility(View.VISIBLE);
                }

                if (message != null) {
                    TextView messageText = dialog.findViewById(R.id.actionsheet_message);
                    messageText.setText(message);
                    messageText.setPadding(0, 12, 0, 0);
                    messageText.setVisibility(View.VISIBLE);
                }
            }

            if (cancel == null) {
                dialog.setCancelable(false);
            } else {
                dialog.setOnCancelListener(dialog1 -> {
                    isShowingDialog = false;
                    promise.resolve(-1);
                });
            }

            ListView listView = dialog.findViewById(R.id.actionsheet_list);
            ActionSheetListAdapter adapter = new ActionSheetListAdapter(reactContext, strList, destructiveIndex, tintColor, position -> {
                dialog.dismiss();
                isShowingDialog = false;
                promise.resolve(position);
            });
            listView.setAdapter(adapter);

            if (cancel != null) {
                dialog.findViewById(R.id.actionsheet_list);
                TextView cancelText = dialog.findViewById(R.id.actionsheet_cancel);
                cancelText.setText(cancel);
                LinearLayout cancelView = dialog.findViewById(R.id.actionsheet_cancel_view);
                if (isSystemDarkMode()) {
                    cancelView.setBackgroundColor(Color.parseColor("#333333"));
                    cancelText.setTextColor(Color.parseColor("#dfe2e5"));
                } else {
                    cancelView.setBackgroundColor(Color.parseColor("#F9F9F9"));
                    cancelText.setTextColor(Color.parseColor("#222222"));
                }
                if (tintColor != null) {
                    cancelText.setTextColor(Color.parseColor(tintColor));
                }
                cancelView.setVisibility(View.VISIBLE);
                cancelView.setOnClickListener(v -> {
                    dialog.dismiss();
                    isShowingDialog = false;
                    promise.resolve(-1);
                });
            }

            isShowingDialog = true;
            dialog.show();
        }
    }

    boolean isSystemDarkMode() {
        boolean isDarkMode = false;
        switch (reactContext.getApplicationContext().getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) {
        case Configuration.UI_MODE_NIGHT_YES:
            isDarkMode = true;
            break;
        case Configuration.UI_MODE_NIGHT_NO:
            isDarkMode = false;
            break;
        }
        return isDarkMode;
    }

    @ReactMethod
    public void dismissActionSheet() {
        dialog.dismiss();
        isShowingDialog = false;
    }
}
