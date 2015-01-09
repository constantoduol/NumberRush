package com.questlab.numberrush;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;

public class AboutActivity extends Activity{
    private static WebView wv = null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_about);
        wv = (WebView) findViewById(R.id.about_viewer);
        wv.loadUrl("file:///android_asset/about.html");
        AdView adView = (AdView)this.findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder()
                .addTestDevice("37DCD3715F54AF6E129098236B4AD153")
                .build();
        adView.loadAd(adRequest);
    }



}
