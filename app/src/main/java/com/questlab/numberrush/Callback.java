package com.questlab.numberrush;

public interface Callback {
       
   public void doneAtBeginning();
   
   public Object doneInBackground();
   
   public void doneAtEnd(Object result);
   
}
