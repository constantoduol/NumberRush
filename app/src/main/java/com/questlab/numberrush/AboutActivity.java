package com.questlab.numberrush;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;



public class AboutActivity extends Activity{
    private static WebView wv = null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_about);
        wv = (WebView) findViewById(R.id.about_viewer);
        wv.loadUrl("file:///android_asset/about.html");


    }



}
