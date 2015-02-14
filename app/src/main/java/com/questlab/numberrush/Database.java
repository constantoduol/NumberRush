package com.questlab.numberrush;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class Database extends SQLiteOpenHelper{

    private static String DATABASE_NAME = "NUMBER_RUSH";


    public Database(Context cxt){
	  super(cxt,DATABASE_NAME,null,1);
	}
	
	@Override
	public void onCreate(SQLiteDatabase db) {
		//create the tables we will need currently
        //CURRENT,BEST, NUMBER_ONE,NUMBER_TWO,LIVES,SOUND_ON,MUSIC_ON
        /*
        db.execSQL("create table SETTINGS (SOUND_ON TEXT, MUSIC_ON TEXT)");
        ContentValues values = new ContentValues();
        values.put("SOUND_ON","off");
        values.put("MUSIC_ON","off");
        db.insert("SETTINGS", null, values);
        int levels = GameActivity.getNoOfLevels() + 1 ;
        for(int x = 1; x < levels; x++){
            ensureTableExists("GAMEDATA"+x,db);
        }
        */
	}


    private static void ensureTableExists(String tableName,SQLiteDatabase db){
        db.execSQL("create table "+tableName+" (CURRENT TEXT, BEST TEXT, NUMBER_ONE TEXT,NUMBER_TWO TEXT,LIVES TEXT, LEVEL_UNLOCKED TEXT,PLAY_FACTOR TEXT,BRONZE TEXT, SILVER TEXT, GOLD TEXT)");
        ContentValues values = new ContentValues();
        values.put("CURRENT", "0");
        values.put("BEST","0");
        values.put("NUMBER_ONE","0");
        values.put("NUMBER_TWO","10");
        values.put("LIVES","null");
        values.put("LEVEL_UNLOCKED","false");
        values.put("PLAY_FACTOR","10");
        values.put("BRONZE","false");
        values.put("SILVER","false");
        values.put("GOLD","false");
        db.insert(tableName, null, values);
    }

	@Override
	public void onUpgrade(SQLiteDatabase db, int arg1, int arg2) {
		// TODO Auto-generated method stub
		
	}
	
   public boolean ifValueExists(String value, String column, String table){
	  Cursor cs=getReadableDatabase().rawQuery("SELECT "+column+" FROM "+table+" WHERE "+column+"='"+value+"'",null);
	  String exists=null;
	  try{
			while(cs.moveToNext()){
			   exists=cs.getString(cs.getColumnIndex(column));
			}
		  cs.close();
		  if(exists!=null && exists.length()>0 ){
			  return true;
		  }
		 return false;
    }
    catch(Exception e){
      e.printStackTrace();
   	  return false;
    }
   }
	

}
