package com.reactnativecrossactionsheet;

import android.content.Context;
import android.content.res.Configuration;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.List;

public class ActionSheetListAdapter extends ArrayAdapter<String> {
  OnItemClickListener listener;
  String tintColor;
  int destructive;

  public ActionSheetListAdapter(Context context, List<String> users, int destructive, String tintColor, OnItemClickListener listener) {
    super(context, 0, users);
    this.tintColor = tintColor;
    this.listener = listener;
    this.destructive = destructive;
  }

  @Override
  public View getView(int position, View rowView, ViewGroup parent) {
    if (rowView == null) {
      rowView = LayoutInflater.from(getContext()).inflate(R.layout.actionsheet_list_item,  parent, false);
    }
    TextView text = (TextView) rowView.findViewById(R.id.actionsheet_item_text);
    text.setText(getItem(position));
    switch (getContext().getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) {
      case Configuration.UI_MODE_NIGHT_YES:
        rowView.setBackgroundColor(Color.parseColor("#333333"));
        text.setTextColor(Color.parseColor("#dfe2e5"));
        break;
      case Configuration.UI_MODE_NIGHT_NO:
        rowView.setBackgroundColor(Color.parseColor("#F9F9F9"));
        text.setTextColor(Color.parseColor("#222222"));
        break;
    }
    if (tintColor != null) {
      text.setTextColor(Color.parseColor(tintColor));
    }
    if (destructive == position) {
      text.setTextColor(Color.parseColor("#ff3b3a"));
    }
    LinearLayout ll= (LinearLayout) rowView.findViewById(R.id.actionsheet_item);
    ll.setOnClickListener(v -> {
      listener.onItemClick(position);
    });

    return rowView;
  }

  public interface OnItemClickListener {
    void onItemClick(int position);
  }
}
