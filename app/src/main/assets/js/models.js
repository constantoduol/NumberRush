

function Model (){
    //all models inherit from this model
   this.animationDelay = 1000; //in milliseconds
   this.gameDelay = 10000; //10 seconds game delay
   this.playFactorCountMax = 20;
}

ModelInit.prototype = new Model();
ModelInit.prototype.constructor = new ModelInit();

ModelOne.prototype = new Model();
ModelOne.prototype.constructor = new ModelOne();

ModelTwo.prototype = new Model();
ModelTwo.prototype.constructor = new ModelTwo();

ModelThree.prototype = new Model();
ModelThree.prototype.constructor = new ModelThree();

ModelFour.prototype = new Model();
ModelFour.prototype.constructor = new ModelFour();

ModelFive.prototype = new Model();
ModelFive.prototype.constructor = new ModelFive();

Model.prototype.levelData = 
    [
         new ModelOne(),
         new ModelTwo(),
         new ModelThree(),
         new ModelFour(),
         new ModelFive()
    ];
    
function Device(){
    
}

Device.prototype.persistState = function(){
    //persist number one
    //persist number two
    //persist current score
    //persist best score
    //persist after every cycle
    //save according to the level
    var name = game.model.name;
    var currentScore = game.scoreArea.html();
    var bestScore = game.bestScoreArea.html();
    localStorage.setItem(name+"_best-score",bestScore);
    localStorage.setItem(name+"_current-score",currentScore);
    localStorage.setItem(name+"_number-one",game.numberOne);
    localStorage.setItem(name+"_number-two",game.numberTwo);
    localStorage.setItem(name+"_lives",game.lifeArea.html());
};

Device.prototype.recoverState = function(){
   var name = game.model.name;
   var state = game.device.doRecoverState(name);
   game.state = state;
   var currentScore = state[0];
   var bestScore = state[1];
   var numberOne = state[2];
   var numberTwo = state[3];
   var lives = state[4];
   if(currentScore){
     game.scoreArea.html(currentScore);  
   }
   if(bestScore){
     game.bestScoreArea.html(bestScore); 
   }
   if(numberOne){
     game.numberOne = parseInt(numberOne);  
     var profPercent = Math.round( ( currentScore/(game.numberOne*3) )*100 );
     game.setProfLevel(profPercent);
   }
   if(numberTwo){
      game.numberTwo = parseInt(numberTwo); 
   }
   if(lives && lives !== "undefined" && lives !== "null" && parseInt(lives) > 0){
      game.lifeArea.html(lives); 
   }
   else{
     game.lifeArea.html(game.model.lives);   
   }
};


Device.prototype.doRecoverState = function(name){
   var bestScore = localStorage.getItem(name+"_best-score");
   var currentScore = localStorage.getItem(name+"_current-score");
   var numberOne = localStorage.getItem(name+"_number-one");
   var numberTwo = localStorage.getItem(name+"_number-two"); 
   var lives = localStorage.getItem(name+"_lives"); 
   var lvlUnlocked = localStorage.getItem(name+"_level_unlocked"); 
   return [currentScore,bestScore,numberOne,numberTwo,lives,lvlUnlocked];
};

Device.prototype.recoverSettings = function(){
   var soundOn = localStorage.getItem("sound-on");
   var musicOn = localStorage.getItem("music-on");
   if(!soundOn){
       soundOn = "on";
   }
   if(!musicOn){
       musicOn = "on";
   }
   game.settings.sound_on = soundOn;
   game.settings.music_on = musicOn;
};


Device.prototype.showMenu = function(){
    if(game.model.name !== "init"){
        game.pause(false);
    }
    var menu = [
        {
            label: "Sound",
            options: ["off", "on"],
            preset: localStorage.getItem("sound-on")
        },
        {
            label: "Music",
            options: ["off", "on"],
            preset: localStorage.getItem("music-on")
        }
    ];
    game.menuBuilder(menu);  
};

Device.prototype.saveSettings = function(ids){
    var soundOn = $("#" + ids[0]).val();
    var musicOn = $("#" + ids[1]).val();
    localStorage.setItem("sound-on", soundOn);
    localStorage.setItem("music-on", musicOn);
    game.settings.sound_on = soundOn;
    game.settings.music_on = musicOn;
    if(game.model.name !== "init"){
       game.resume(false);
    }
    game.removeMessage();  
};





AndroidDevice.prototype = new Device();
AndroidDevice.prototype.constructor = new AndroidDevice();

function AndroidDevice(){
   this.name = "android";
}

AndroidDevice.prototype.playPopAudio = function(){
  jse.playPopAudio();  
};

AndroidDevice.prototype.persistState = function(){
    var level = game.model.name;
    var currentScore = game.scoreArea.html();
    var bestScore = game.bestScoreArea.html();
    jse.saveStateData(level,"BEST",bestScore);
    jse.saveStateData(level,"CURRENT",currentScore);
    jse.saveStateData(level,"NUMBER_ONE",game.numberOne);
    jse.saveStateData(level,"NUMBER_TWO",game.numberTwo);
    jse.saveStateData(level,"LIVES",game.lifeArea.html());
};


AndroidDevice.prototype.doRecoverState = function(level){
   if(level === "init")
       return;
   var index = level - 1;
   var data = JSON.parse(jse.readStateData());
   console.log(data);
   var currentScore = data[index][0];
   var bestScore = data[index][1];
   var numberOne = data[index][2];
   var numberTwo = data[index][3]; 
   var lives = data[index][4]; 
   var lvlUnlocked= data[index][5];
   return [currentScore,bestScore,numberOne,numberTwo,lives,lvlUnlocked];  
};


AndroidDevice.prototype.recoverSettings = function(){
   var settings = JSON.parse(jse.readSettingsData());
   console.log("settings: "+settings);
   var soundOn = settings[0];
   var musicOn = settings[1];
   if(!soundOn){
       soundOn = "off";
   }
   if(!musicOn){
       musicOn = "off";
   }
   game.settings.sound_on = soundOn;
   game.settings.music_on = musicOn; 
  
};


AndroidDevice.prototype.showMenu = function(){
    if(game.model.name !== "init")
        game.pause(false);
   console.log(game.settings.music_on);
   console.log(game.settings.sound_on);
    var menu = [
        {
            label: "Sound",
            options: ["off", "on"],
            preset: game.settings.sound_on
        },
        {
            label: "Music",
            options: ["off", "on"],
            preset: game.settings.music_on
        }
    ];
    game.menuBuilder(menu);  
};

AndroidDevice.prototype.saveSettings = function(ids){
    var soundOn = $("#" + ids[0]).val();
    var musicOn = $("#" + ids[1]).val();
    jse.saveSettingsData("SOUND_ON",soundOn);
    jse.saveSettingsData("MUSIC_ON",musicOn);
    game.settings.sound_on = soundOn;
    game.settings.music_on = musicOn;
    if(game.model.name !== "init"){
       game.resume(false);
    }
    if(musicOn === "on" && game.model.name !== "init"){
       jse.playMusic();
    }
    else{
       jse.pauseMusic();
    }
    game.removeMessage();  
};


WindowsDevice.prototype = new Device();
WindowsDevice.prototype.constructor = new WindowsDevice();

function WindowsDevice(){
    
}

WebDevice.prototype = new Device();
WebDevice.prototype.constructor = new WebDevice();

function WebDevice(){
  
}




function Bubble(firstNum, secondNum,sign){
    this.firstNum = firstNum;
    this.secondNum = secondNum;
    this.sign = sign;
    this.id = "";
}



function ModelInit(){
   this.name = "init";
}



ModelInit.prototype.initAllBubbles = function(){
   var dia = game.bubbleDiameter+"px";
   var img = "<img src='img/lock.png' style='width:"+dia+";height : "+dia+"'>";
   var len = Object.keys(game.model.levelData).length;
   for(var x = 1; x < len + 1; x++){
      var levelPrev =  x === 1 ? 1 : x - 1;
      var previousLevelUnlocked = game.device.doRecoverState(levelPrev)[5];
      var bubble;
      var data = game.model.getRowAndCol(x - 1);
      if(x === 1 || previousLevelUnlocked === "true"){
          bubble = new Bubble(x,"","");
          game.addInitBubble(bubble,data[0],data[1],"ModelInit.prototype.levelHandler("+(x - 1)+")");
      }
      else {
          console.log("level "+x+" locked ");
          bubble = new Bubble(img,"","");  
          game.addInitBubble(bubble,data[0],data[1],"");
      }
      
   } 
};


ModelInit.prototype.levelHandler = function(x){
     $("#scorebar").css("display","block");
     var model = game.model.levelData[x];
     var bubbleGame = new BubbleGame(model);
     window.game = bubbleGame;
     game.device.recoverSettings();
     console.log("level hand : "+game.settings.music_on)
     game.device.recoverState();
     game.showLevelMessage("init");
     if(game.settings.music_on === "on"){
       jse.playMusic();
     }
};





//this is the simplest game model
//it defines the horizontal and vertical velocity of bubbles
//the difficulty of the game, the simple model uses "+" sign only
//the difficulty of the game as the user plays more
//so as the game progresses the model should make the game more difficult
//the model can also specify a different movement pattern for the bubbles
function ModelOne(){
   this.name = 1;
   this.nextLevelScore = 2000; //to get to level 2 your best score must be more than 5000
   this.lives = 3; //you have three chances to fail before game ends
}



ModelOne.prototype.initAllBubbles = function(){
  game.progressRunner();
  var diff = game.numberTwo - game.numberOne;
  var ansOne = game.nextRangeRandom(0,diff);
  var ansTwo = diff - ansOne;
  var randStop = game.nextRandom(game.bubbleDensity);
  for(var x = 0; x < game.bubbleDensity; x++){
      var firstNum,secondNum;
      if(x === randStop){
         firstNum = ansOne;
         secondNum = ansTwo;
      }
      else {
          firstNum =  game.nextRandom(diff);  
          secondNum = game.nextRandom(diff);
      }
      
      var bubble = new Bubble(firstNum,secondNum,"+");
      var data = game.model.getRowAndCol(x);
      var bubbleDivId = "bubble_"+data[0]+"_"+data[1];
      var clickHandler = "game.clickBubble(\""+bubbleDivId+"\")";
      game.addInitBubble(bubble,data[0],data[1],clickHandler);
    }
};






Model.prototype.getRowAndCol = function(x){
    var col = Math.round(Math.abs((Math.floor( (x+1)/game.bubbleNumber)- (x+1)/game.bubbleNumber)/(1/game.bubbleNumber)));
    col = col === 0 ? game.bubbleNumber : col;
    var row = Math.ceil((x+1)/game.bubbleNumber);
    col--;
    row--;
    return [row,col];
};


function ModelTwo(){
   this.name = 2;
   this.nextLevelScore = 3000; //to get to level 3 your best score must be more than 5000
   this.lives = 3; //you have five chances to fail before game ends
   this.playFactorCountMax = 15;
}



ModelTwo.prototype.initAllBubbles = function(){
    game.progressRunner();
    var diff = game.numberTwo - game.numberOne;
    var ansOne = game.nextRangeRandom(diff,2*diff);
    var ansTwo = ansOne - diff;
    var randStop = game.nextRandom(game.bubbleDensity);
    for(var x = 0; x < game.bubbleDensity; x++){
        var firstNum,secondNum;
        if(x === randStop){
            firstNum = ansOne;
            secondNum = ansTwo;
        }
        else {
           var firstNum = game.nextRangeRandom(diff,2*diff);
           var secondNum = game.nextRandom(diff); 
        }
      
      var bubble = new Bubble(firstNum,secondNum,"-");
      var data = game.model.getRowAndCol(x);
      var bubbleDivId = "bubble_"+data[0]+"_"+data[1];
      var clickHandler = "game.clickBubble(\""+bubbleDivId+"\")";
      game.addInitBubble(bubble,data[0],data[1],clickHandler);
    }
};


function ModelThree(){
   this.gameDelay = 12000; //12 seconds game delay
   this.name = 3;
   this.nextLevelScore = 3000; //to get to level 4 your best score must be more than 5000
   this.lives = 3; //you have five chances to fail before game ends
   this.playFactorCountMax = 15;
}



ModelThree.prototype.initAllBubbles = function(){
    game.progressRunner();
    var diff = game.numberTwo - game.numberOne;
    var randStop = game.nextRandom(game.bubbleDensity); //this is a random location to put the answer
    var ansSign = Math.random() > 0.5 ? "+" : "-"; //this tells us whether the answer has a - or +
    var ansOne,ansTwo;
    if(ansSign === "+"){
        ansOne = game.nextRangeRandom(0,diff);
        ansTwo = diff - ansOne;
    }
    else if(ansSign === "-"){
        ansOne = game.nextRangeRandom(diff,2*diff);
        ansTwo = ansOne - diff;
    }
    
    for(var x = 0; x < game.bubbleDensity; x++){
      var firstNum,secondNum;
      if(x === randStop){
         firstNum = ansOne;
         secondNum = ansTwo;
         sign = ansSign;
      }
      else {
          var sign = Math.random() > 0.5 ? "+" : "-";
          var firstNum = sign === "-" ? game.nextRangeRandom(diff,2*diff) : game.nextRandom(diff);  
          var secondNum = game.nextRandom(diff);
          firstNum = firstNum < secondNum  ? secondNum : firstNum; //firstNum is always greater than secondnum incase sign is "-"
          sign = firstNum === secondNum ? "+" : "-";
      }
     
      var bubble = new Bubble(firstNum, secondNum,sign);
      var data = game.model.getRowAndCol(x);
      var bubbleDivId = "bubble_"+data[0]+"_"+data[1];
      var clickHandler = "game.clickBubble(\""+bubbleDivId+"\")";
      game.addInitBubble(bubble,data[0],data[1],clickHandler);
    } 
};


function ModelFour(){
   this.gameDelay = 7000; //7 seconds game delay
   this.name = 4;
   this.playFactorCountMax = 10;
   this.nextLevelScore = 5000; 
   this.lives = 3; //you have five chances to fail before game ends
}


ModelFour.prototype.initAllBubbles = function(){
  ModelOne.prototype.initAllBubbles();
};


function ModelFive(){
   this.gameDelay = 7000; //7 seconds game delay
   this.name = 5;
   this.playFactorCountMax = 10;
   this.nextLevelScore = 5000; 
   this.lives = 3; //you have five chances to fail before game ends
}

ModelFour.prototype.initAllBubbles = function(){
  ModelTwo.prototype.initAllBubbles();
};


