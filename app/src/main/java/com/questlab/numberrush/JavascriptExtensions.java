package com.questlab.numberrush;

import android.util.Log;
import android.webkit.JavascriptInterface;

import java.util.ArrayList;

/**
 * Created by Connie on 07-Dec-14.
 */
public class JavascriptExtensions {
    @JavascriptInterface
    public void playPopAudio(){
       GameActivity.getActivityInstance().playAudio();
    }

    @JavascriptInterface
    public void playMusic(){
        GameActivity.getActivityInstance().playMusic();
    }

    @JavascriptInterface
    public void pauseMusic(){
        GameActivity.getActivityInstance().pauseMusic();
    }


    @JavascriptInterface
    public void share(String msg){
        GameActivity.getActivityInstance().share(msg);
    }


    @JavascriptInterface
    public void showAd(){
        GameActivity.getActivityInstance().showAd();
    }

    @JavascriptInterface
    public void hallOfFame(){
        GameActivity.getActivityInstance().hallOfFame();
    }

    @JavascriptInterface
    public void setItem(String key, String value){
        Database.put(key,value);
    }

    @JavascriptInterface
    public String getItem(String key){
        return Database.get(key);
    }

    @JavascriptInterface
    public void removeItem(String key){
        Database.remove(key);
    }
}
