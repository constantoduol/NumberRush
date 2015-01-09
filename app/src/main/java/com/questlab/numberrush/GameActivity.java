package com.questlab.numberrush;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.media.MediaPlayer;
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

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;

import java.util.ArrayList;


public class GameActivity extends Activity {
    private static WebView wv = null;
    private static MediaPlayer popMediaPlayer;
    private static MediaPlayer musicMediaPlayer;
    private static SQLiteDatabase dbRead;
    private static SQLiteDatabase dbWrite;
    private Database db;
    private static ArrayList stateData = new ArrayList();
    private static ArrayList settingsData = new ArrayList();
    private static int NO_OF_LEVELS = 5;
    private final static int MAX_VOLUME = 100;

    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);
        db = new Database(this);
        dbRead = db.getReadableDatabase();
        dbWrite = db.getWritableDatabase();
        readStateData();
        readSettingsData();
        wv = (WebView) findViewById(R.id.html_viewer);
        WebSettings settings = wv.getSettings();
        settings.setJavaScriptEnabled(true);
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1){
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
        AdView adView = (AdView)this.findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder()
               // .addTestDevice("37DCD3715F54AF6E129098236B4AD153")
                .build();
        adView.loadAd(adRequest);
        popMediaPlayer = MediaPlayer.create(this,R.raw.pop);
        musicMediaPlayer = MediaPlayer.create(this,R.raw.music);
        float musicVol = getVolume(50);
        musicMediaPlayer.setVolume(musicVol,musicVol);
        float soundVol = getVolume(70);
        popMediaPlayer.setVolume(soundVol,soundVol);
    }

    /*
    public void onPause(){
        super.onPause();
        wv.loadUrl("javascript:game.pause(true)");
    }


    public void onResume(){
        super.onResume();
        wv.loadUrl("javascript:game.resume(true)");
    }
*/
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
                startActivity(new Intent(getApplicationContext(),HelpActivity.class));
                return false;
            }
        });

        menu.add("About").setOnMenuItemClickListener(new OnMenuItemClickListener() {

            @Override
            public boolean onMenuItemClick(MenuItem arg0) {
                startActivity(new Intent(getApplicationContext(),AboutActivity.class));
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

        return true;
    }

    public static void playAudio(){
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

                popMediaPlayer.start();
                // TODO Auto-generated method stub

            }
        };
        AsyncHandler handler = new AsyncHandler(cb);
        handler.execute();

    }

    public static void playMusic(){
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
                if(musicMediaPlayer.isPlaying()){
                   Log.i("APPL","Music is playing");
                   return;
                }
                musicMediaPlayer.setLooping(true);
                musicMediaPlayer.start();
                // TODO Auto-generated method stub

            }
        };
        AsyncHandler handler = new AsyncHandler(cb);
        handler.execute();
    }

    public static void stopMusic(){
        musicMediaPlayer.stop();
    }

    public static void pauseMusic(){
        musicMediaPlayer.pause();
    }

    private static float getVolume(int soundVolume){
        return (float) (1 - (Math.log(MAX_VOLUME - soundVolume) / Math.log(MAX_VOLUME)));
    }


    public static void saveSettingsData(final String column, final String value){
        Callback cb = new Callback() {
            @Override
            public Object doneInBackground() {
                dbWrite.execSQL("UPDATE SETTINGS SET " + column + " = '" + value + "' ");
                return null;
            }

            @Override
            public void doneAtEnd(Object result) {

            }

            @Override
            public void doneAtBeginning() {


            }
        };

        AsyncHandler handler = new AsyncHandler(cb);
        handler.execute();

    }


    public static void saveStateData(final String level, final String column, final String value){
        Callback cb = new Callback() {
            @Override
            public Object doneInBackground() {
                String tableName = "GAMEDATA"+level;
                dbWrite.execSQL("UPDATE "+tableName+" SET " + column + " = '" + value + "' ");
                readStateData();
                return null;
            }

            @Override
            public void doneAtEnd(Object result) {

            }

            @Override
            public void doneAtBeginning() {


            }
        };

        AsyncHandler handler = new AsyncHandler(cb);
        handler.execute();

    }




    public void readSettingsData(){
        Callback cb = new Callback() {
            @Override
            public Object doneInBackground() {
                ArrayList<String> list = new ArrayList<String>();
                try{
                    Cursor cs = dbRead.rawQuery("SELECT * FROM SETTINGS", null);
                    while(cs.moveToNext()) {
                        String sOn = cs.getString(0);
                        String mOn = cs.getString(1);
                        list.add("\""+sOn+"\"");
                        list.add("\""+mOn+"\"");
                    }
                    cs.close();
                    return list;
                }
                catch(Exception e){
                    return null;
                }
            }

            @Override
            public void doneAtEnd(Object result) {
                ArrayList<String> list = (ArrayList<String>)result;
                settingsData = list;
            }

            @Override
            public void doneAtBeginning() {


            }
        };

        AsyncHandler handler = new AsyncHandler(cb);
        handler.execute();

    }


    private static void readStateData(){
        Callback cb = new Callback() {
            @Override
            public Object doneInBackground() {
               stateData = new ArrayList();
               for(int x = 1; x < NO_OF_LEVELS + 1 ; x++) {
                   String tableName = "GAMEDATA" + x;
                   ArrayList<String> list = new ArrayList<String>();
                   Cursor cs = dbRead.rawQuery("SELECT * FROM " + tableName, null);
                   while (cs.moveToNext()) {
                           String current = cs.getString(0);
                           String best = cs.getString(1);
                           String nOne = cs.getString(2);
                           String nTwo = cs.getString(3);
                           String lives = cs.getString(4);
                           String lvlUnlocked = cs.getString(5);
                           list.add("\"" + current + "\"");
                           list.add("\"" + best + "\"");
                           list.add("\"" + nOne + "\"");
                           list.add("\"" + nTwo + "\"");
                           list.add("\"" + lives + "\"");
                           list.add("\"" + lvlUnlocked + "\"");
                       }
                    cs.close();
                   stateData.add(list);

               }
               // Log.i("APPL",stateData.toString());
              return stateData;
            }

            @Override
            public void doneAtEnd(Object result) {


            }

            @Override
            public void doneAtBeginning() {

            }
        };

        AsyncHandler handler = new AsyncHandler(cb);
        handler.execute();

    }



    public static ArrayList getStateData(){
        return stateData;
    }

    public static ArrayList getSettingsData(){
        return settingsData;
    }

    public static int getNoOfLevels(){
        return NO_OF_LEVELS;
    }
    public void rateApp(){
        Uri uri = Uri.parse("market://details?id="+getPackageName());
        Intent intent = new Intent(Intent.ACTION_VIEW,uri);
        intent.setData(uri);
        startActivity(intent);
    }


}
