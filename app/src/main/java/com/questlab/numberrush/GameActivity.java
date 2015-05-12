package com.questlab.numberrush;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.SoundPool;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.MenuItem.OnMenuItemClickListener;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.InterstitialAd;
import com.google.android.gms.games.Game;

import java.io.IOException;
import java.util.ArrayList;


public class GameActivity extends Activity implements InterstitialListener {

    private static WebView wv = null;
    private static GameActivity activityInstance;
    private static SoundPool pool = new SoundPool(1, AudioManager.STREAM_MUSIC, 0);
    private static MediaPlayer mPlayer;
    private static int popId;
    private InterstitialAd interstitial;
    private String AD_UNIT_ID = "ca-app-pub-2739675128716980/5370388755";
    private Database db;


    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);
        wv = (WebView) findViewById(R.id.html_viewer);
        WebSettings settings = wv.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabasePath("/data/data/" + wv.getContext().getPackageName() + "/databases/");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
        WebChromeClient webChrome = new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.i("JCONSOLE", consoleMessage.lineNumber()
                        + ": " + consoleMessage.message());
                return true;
            }
        };
        wv.addJavascriptInterface(new JavascriptExtensions(), "jse");
        wv.setWebChromeClient(webChrome);
        wv.loadUrl("file:///android_asset/index.html");
        AdView adView = (AdView) this.findViewById(R.id.adView);

        popId = pool.load(this, R.raw.pop, 1);
        mPlayer = MediaPlayer.create(this, R.raw.music);
        activityInstance = this;

        interstitial = new InterstitialAd(this);
        interstitial.setAdUnitId(AD_UNIT_ID);
        reloadInterstitials();
        AdRequest.Builder adRequestBuilder = new AdRequest.Builder();
        interstitial.loadAd(adRequestBuilder.build());

        db = new Database(this);

    }


    public void onPause() {
        super.onPause();
        wv.loadUrl("javascript:game.pause(true)");
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        super.onCreateOptionsMenu(menu);
        menu.add("Settings").setOnMenuItemClickListener(new OnMenuItemClickListener() {

            @Override
            public boolean onMenuItemClick(MenuItem arg0) {
                wv.loadUrl("javascript:game.device.showMenu()");
                return false;
            }
        });

        menu.add("Help").setOnMenuItemClickListener(new OnMenuItemClickListener() {

            @Override
            public boolean onMenuItemClick(MenuItem arg0) {
                startActivity(new Intent(getApplicationContext(), HelpActivity.class));
                return false;
            }
        });

        menu.add("About").setOnMenuItemClickListener(new OnMenuItemClickListener() {

            @Override
            public boolean onMenuItemClick(MenuItem arg0) {
                startActivity(new Intent(getApplicationContext(), AboutActivity.class));
                return false;
            }
        });

        menu.add("Rate").setOnMenuItemClickListener(new OnMenuItemClickListener() {

            @Override
            public boolean onMenuItemClick(MenuItem arg0) {
                rateApp();
                return false;
            }
        });

        menu.add("Hall of Fame").setOnMenuItemClickListener(new OnMenuItemClickListener() {

            @Override
            public boolean onMenuItemClick(MenuItem arg0) {
                startActivity(new Intent(getApplicationContext(), HallActivity.class));
                return false;
            }
        });

        return true;
    }

    public void playAudio() {
        Callback cb = new Callback() {
            @Override
            public Object doneInBackground() {
                return null;
            }

            @Override
            public void doneAtEnd(Object result) {

            }

            @Override
            public void doneAtBeginning() {
                pool.play(popId, 1.0f, 1.0f, 1, 0, 1.0f);
            }
        };
        AsyncHandler handler = new AsyncHandler(cb);
        handler.execute();

    }

    public void playMusic() {
        Callback cb = new Callback() {
            @Override
            public Object doneInBackground() {
                return null;
            }

            @Override
            public void doneAtEnd(Object result) {

            }

            @Override
            public void doneAtBeginning() {
                mPlayer.setLooping(true);
                mPlayer.start();
            }
        };
        AsyncHandler handler = new AsyncHandler(cb);
        handler.execute();
    }


    public void pauseMusic() {
        mPlayer.pause();
    }


    public void rateApp() {
        Uri uri = Uri.parse("market://details?id=" + getPackageName());
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.setData(uri);
        startActivity(intent);
    }

    public void share(String msg) {
        Intent sendIntent = new Intent();
        sendIntent.setAction(Intent.ACTION_SEND);
        sendIntent.putExtra(Intent.EXTRA_TEXT, msg);
        sendIntent.setType("text/plain");
        startActivity(Intent.createChooser(sendIntent, "Share Using"));
    }

    public static GameActivity getActivityInstance() {
        return activityInstance;
    }



    public void hallOfFame(){
        startActivity(new Intent(getApplicationContext(), HallActivity.class));
    }


    private void reloadInterstitials() {
        interstitial.setAdListener(new AdListener() {
            @Override
            public void onAdLoaded() {
                // TODO Auto-generated method stub
                super.onAdLoaded();
                Log.i("JCONSOLE","AD LOADED");
            }

            @Override
            public void onAdFailedToLoad(int errorCode) {
                // TODO Auto-generated method stub
                super.onAdFailedToLoad(errorCode);
                interstitial = new InterstitialAd(GameActivity.this);
                interstitial.setAdUnitId(AD_UNIT_ID);
                // Begin loading your interstitial
                interstitial.loadAd(new AdRequest.Builder().build());
                // loadInterCallBacks();
                reloadInterstitials();
            }

            @Override
            public void onAdOpened() {
                // TODO Auto-generated method stub
                super.onAdOpened();
                wv.loadUrl("javascript:goHome()");
            }

            @Override
            public void onAdClosed() {
                // TODO Auto-generated method stub
                super.onAdClosed();
                wv.loadUrl("javascript:goHome()");
                interstitial = new InterstitialAd(GameActivity.this);
                interstitial.setAdUnitId(AD_UNIT_ID);
                //loadInterCallBacks();
                // Begin loading your interstitial
                interstitial.loadAd(new AdRequest.Builder().build());
                reloadInterstitials();
            }

            @Override
            public void onAdLeftApplication() {
                // TODO Auto-generated method stub
                super.onAdLeftApplication();
                wv.loadUrl("javascript:goHome()");
            }
        });

    }


    @Override
    public void showAd() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                showInterstitial();
            }
        });
    }

    public void showInterstitial() {
        if (interstitial.isLoaded()) {
            interstitial.show();
        } else {
            wv.loadUrl("javascript:goHome()");
        }
    }
}
