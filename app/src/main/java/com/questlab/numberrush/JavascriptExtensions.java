package com.questlab.numberrush;

import android.util.Log;

import java.util.ArrayList;

/**
 * Created by Connie on 07-Dec-14.
 */
public class JavascriptExtensions {
    public void playPopAudio(){
      GameActivity.playAudio();
    }


    public void saveStateData(String level,String column,String value){
        GameActivity.saveStateData(level, column, value);
    }

    public void saveSettingsData(String column,String value){
        GameActivity.saveSettingsData(column, value);
    }

    public ArrayList readStateData(){
       return  GameActivity.getStateData();
    }

    public ArrayList readSettingsData(){
       return GameActivity.getSettingsData();
    }

    public void playMusic(){
       GameActivity.playMusic();
    }

    public void stopMusic(){
       GameActivity.stopMusic();
    }

    public void pauseMusic(){
        GameActivity.pauseMusic();
    }
}
