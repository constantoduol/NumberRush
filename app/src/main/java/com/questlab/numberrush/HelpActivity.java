package com.questlab.numberrush;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;



public class HelpActivity extends Activity{
    private static WebView wv = null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_help);
        wv = (WebView) findViewById(R.id.help_viewer);
        wv.loadUrl("file:///android_asset/help.html");

    }



}
