
function Model (){
    //all models inherit from this model
   this.animationDelay = 1000; //in milliseconds
   this.gameDelay = 10000; //10 seconds game delay
   this.playFactorCountMax = 20;
   this.silverScore = 6000; //6000
   this.goldScore = 10000;  //10000
   this.bubbleNumber = 4;
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

ModelSix.prototype = new Model();
ModelSix.prototype.constructor = new ModelSix();

ModelSeven.prototype = new Model();
ModelSeven.prototype.constructor = new ModelSeven();

ModelEight.prototype = new Model();
ModelEight.prototype.constructor = new ModelEight();

ModelNine.prototype = new Model();
ModelNine.prototype.constructor = new ModelNine();

Model.prototype.levelData = 
    [
         new ModelOne(),
         new ModelTwo(),
         new ModelThree(),
         new ModelFour(),
         new ModelFive(),
         new ModelSix(),
         new ModelSeven(),
         new ModelEight(),
         new ModelNine()
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
    jse.setItem(name+"_best-score",bestScore);
    jse.setItem(name+"_current-score",currentScore);
    jse.setItem(name+"_number-one",game.numberOne);
    jse.setItem(name+"_number-two",game.numberTwo);
    jse.setItem(name+"_lives",game.lifeArea.html());
    jse.setItem(name+"_play_factor",game.playFactor);
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
   var pFactor = state[6];
   if(pFactor){
      game.playFactor = parseInt(pFactor); 
   }
   else {
     game.playFactor = 10;  
   }
  
   if(currentScore){
     game.scoreArea.html(currentScore);  
   }
   else {
      game.scoreArea.html("0"); 
   }
   
   if(bestScore){
     game.bestScoreArea.html(bestScore); 
   }
   else {
     game.bestScoreArea.html("0");  
   }
   
   if(numberOne){
     game.numberOne = parseInt(numberOne);  
     var profPercent = Math.round( ( currentScore/(game.numberOne*3) )*100 );
     game.setProfLevel(profPercent);
   }
   
   if(numberTwo){
      game.numberTwo = parseInt(numberTwo); 
   }
   else {
      game.numberTwo = game.nextRangeRandom(5,10); 
   }
   
   if(lives && lives !== "undefined" && lives !== "null" && parseInt(lives) > 0){
      game.lifeArea.html(lives); 
   }
   else{
     game.lifeArea.html(game.model.lives);   
   }
};

Device.prototype.firstRunInit = function(){
   var userId = Math.random()*10000000000000000+"";
   jse.setItem("user_id",userId);
   jse.setItem("music_on","on");
   jse.setItem("sound_on","on");
   return [userId];
};

Device.prototype.firstRunHomeScreen = function(){
       $('#td_0_0').webuiPopover({
           title:'Level 1',
           content:'Click to start playing level one,respond faster to get higher scores',
           style : 'inverse',
           placement:'right-bottom',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
            height:'auto'//can be set with  number
       });
       $('#td_0_0').click();
};



Device.prototype.firstRunStart = function(){
  game.device.firstRunInit();
  game.showMessage("You can now start... good luck!",2000,game.doRestart);  
};

Device.prototype.clearHelpTrail = function(id){
  $( "#"+id).unbind( "click" );
};

Device.prototype.firstRunNumberOne = function(){
     $('#number-area-left').webuiPopover({
           title:'Number One',
           content:"This is the first number, you should look for a sum from the blue circles that will make it equal to the second number\n\
                    <br/><br/><a href=# onclick=$('#number-area-left').removeClass('help-highlight');game.device.firstRunNumberTwo();>Next</a>",
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       });
    game.runLater(10,function(){
       $('#number-area-left').click();
       $('#number-area-left').addClass("help-highlight");
       game.glow($('#number-area-left'),3000);
       game.device.clearHelpTrail('number-area-left');
    });
};

Device.prototype.firstRunNumberTwo = function(){
    $('#number-area-right').webuiPopover({
           title:'Number Two',
           content:"This is the second number.\n\
                     <br/><br/><a href='#' onclick=$('#number-area-right').removeClass('help-highlight');game.device.firstRunBubble();>Next</a>" ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
     });
    game.runLater(10,function(){
        $('#number-area-right').click();
        $('#number-area-right').addClass("help-highlight");
        game.glow($('#number-area-right'),3000);
        game.device.clearHelpTrail('number-area-right');
        
    });  
};

Device.prototype.firstRunBubble = function(){
    var data = game.model.getRowAndCol(game.solution);
    var solId = "td_"+data[0]+"_"+data[1];
    $("#"+solId+"").webuiPopover({
           title:'Correct Answer',
           content:"This is the correct answer because the first number "+game.numberOneArea.html()+" plus the sum of numbers in this circle,\n\
                    equals the second number "+game.numberTwoArea.html()+"\n\
                     <br/><br/><a href='#' onclick=$('#"+solId+"').removeClass('help-highlight');game.device.firstRunScores()>Next</a>"  ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       });
    game.runLater(10,function(){
        $("#"+solId).click();
        $("#"+solId).addClass("help-highlight");
        game.device.clearHelpTrail(solId);
    });  
};


Device.prototype.firstRunScores = function(){
    $('#score-table').webuiPopover({
           title:'Scores',
           content:"This is your current and best score, responding faster earns you a higher score\n\
                     <br/><br/><a href='#' onclick=$('#score-table').removeClass('help-highlight');game.device.firstRunProf();>Next</a>" ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       }); 
    game.runLater(10,function(){
        $('#score-table').click();
        $("#score-table").addClass("help-highlight");
        game.device.clearHelpTrail('score-table');
    });  
};

Device.prototype.firstRunProf = function(){
    $('#prof-table').webuiPopover({
           title:'Proficiency',
           content:"This is your degree of responsiveness, it is measured out of 100%. \n\
                The lowest proficiency is amateur then novice,expert,pro and the highest is genius\n\
                 <br/><br/><a href='#' onclick=$('#prof-table').removeClass('help-highlight');game.device.firstRunPause();>Next</a>" ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       });
       
    game.runLater(10,function(){
        $('#prof-table').click();
        $("#prof-table").addClass("help-highlight");
        game.device.clearHelpTrail('prof-table');
    });  
};

Device.prototype.firstRunPause = function(){
    $('#pause_link').webuiPopover({
           title:'Pause',
           content:"Press here to pause game play any moment you wish to\n\
                    <br/><br/><a href='#' onclick=$('#pause_link').removeClass('help-highlight');game.device.firstRunShare();>Next</a>" ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       });
    game.runLater(10,function(){
        $('#pause_link').click();
        $("#pause_link").addClass("help-highlight");
        game.device.clearHelpTrail('pause_link');
        
    });  
};

Device.prototype.firstRunRestart = function(){
    $('#replay_link').webuiPopover({
           title:'Replay',
           content:"Press here to restart the game\n\
                   <br/><br/> <a href='#' onclick=$('#replay_link').removeClass('help-highlight');game.device.firstRunLife();>Next</a>" ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       });
    game.runLater(10,function(){
        $('#replay_link').click();
        $("#replay_link").addClass("help-highlight");
        game.device.clearHelpTrail('replay_link');
    });  
};


Device.prototype.firstRunLife = function(){
    $('#life-heart').webuiPopover({
           title:'Lives',
           content:"These are the number of lives you have, when you get an answer wrong you lose a life. \n\
                    When lives run out the game ends\n\
                    <br/><br/><a href='#' onclick=$('#life-heart').removeClass('help-highlight');$('#life-heart').click();game.device.firstRunStart();>Got it!</a>" ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       });
    game.runLater(10,function(){
        $('#life-heart').click();
        $("#life-heart").addClass("help-highlight");
        game.device.clearHelpTrail('life-heart');
        game.doRestart();
        game.pause(false);
    });  
};

Device.prototype.firstRunShare = function(){
    $('#share_icon').webuiPopover({
           title:'Share',
           content:"Click here to share your score with your friends\n\
                    <br/><br/><a href='#' onclick=$('#share_icon').removeClass('help-highlight');game.device.firstRunPlay();>Next</a>" ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       });
    game.runLater(10,function(){
        var icon = $('#share_icon');
        var onclick = icon[0].getAttribute("onclick");
        icon[0].removeAttribute("onclick");
        icon.click();
        icon[0].setAttribute("onclick",onclick);
        icon.addClass("help-highlight");
        game.device.clearHelpTrail('share_icon');
    });  
};

Device.prototype.firstRunPlay = function(){
    $('#play_icon').webuiPopover({
           title:'Resume Game',
           content:"Click here to resume the game\n\
                    <br/><br/><a href='#' onclick=$('#play_icon').removeClass('help-highlight');game.device.firstRunHome();>Next</a>" ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       });
    game.runLater(10,function(){
        var icon = $('#play_icon')
        var onclick = icon[0].getAttribute("onclick");
        icon[0].removeAttribute("onclick");
        icon.click();
        icon[0].setAttribute("onclick",onclick);
        icon.addClass("help-highlight");
        game.device.clearHelpTrail('play_icon');
    });  
};

Device.prototype.firstRunHome = function(){
    $('#home_icon').webuiPopover({
           title:'Home',
           content:"Click here to go back home and select another level\n\
                    <br/><br/><a href='#' onclick=$('#home_icon').removeClass('help-highlight');game.device.firstRunRestart()>Next</a>" ,
           style : 'inverse',
           arrow : false,
           placement:'auto',//values: auto,top,right,bottom,left,top-right,top-left,bottom-right,bottom-left
           width:'auto',//can be set with  number
           height:'auto'//can be set with  number
       });
    game.runLater(10,function(){
        var icon = $('#home_icon');
        var onclick = icon[0].getAttribute("onclick");
        icon[0].removeAttribute("onclick");
        icon.click();
        icon[0].setAttribute("onclick",onclick);
        icon.addClass("help-highlight");
        game.device.clearHelpTrail('home_icon');
    });  
};

Device.prototype.doRecoverState = function(name){
   var bestScore = jse.getItem(name+"_best-score");
   var currentScore = jse.getItem(name+"_current-score");
   var numberOne = jse.getItem(name+"_number-one");
   var numberTwo = jse.getItem(name+"_number-two"); 
   var lives = jse.getItem(name+"_lives"); 
   var lvlUnlocked = jse.getItem(name+"_level_unlocked"); 
   var pFactor = jse.getItem(name+"_play_factor"); 
   var userId = jse.getItem("user_id");
   var firstRun = game.device.isFirstRun();
   var data = [currentScore,bestScore,numberOne,numberTwo,lives,lvlUnlocked,pFactor,userId,firstRun];
   game.state = data;
   return data;
};

Device.prototype.isFirstRun = function(){
   var userId = jse.getItem("user_id");
   if(!userId){
      return true;
   }  
   else {
     return false;
   }
};

Device.prototype.recoverSettings = function(){
   var soundOn = jse.getItem("sound-on");
   var musicOn = jse.getItem("music-on");
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
    if(game.model.name !== "init")
        game.pause(false);
    var menu = [
        {
            label: "Sound",
            options: ["off", "on"],
            preset: jse.getItem("sound-on")
        },
        {
            label: "Music",
            options: ["off", "on"],
            preset: jse.getItem("music-on")
        }
    ];
    game.menuBuilder(menu);  
};

Device.prototype.saveSettings = function(ids){
    var soundOn = $("#" + ids[0]).val();
    var musicOn = $("#" + ids[1]).val();
    jse.setItem("sound-on", soundOn);
    jse.setItem("music-on", musicOn);
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





AndroidDevice.prototype = new Device();
AndroidDevice.prototype.constructor = new AndroidDevice();

function AndroidDevice(){
   this.name = "android";
}

AndroidDevice.prototype.playPopAudio = function(){
   jse.playPopAudio();  
};

AndroidDevice.prototype.share = function(){
   var shareString = "I have a score of "+game.bestScoreArea.html()+" with a proficiency of "+game.profValue.html()+"% on level "+game.model.name+" Play #NumberRush on Android today http://goo.gl/FHx2gY "; 
   jse.share(shareString);
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
      var levelUnlocked = game.device.doRecoverState(x)[5];
      var bubble;
      var data = game.model.getRowAndCol(x - 1);
      if(x === 1 || levelUnlocked === "true"){
          bubble = new Bubble(x,"","");
          game.addInitBubble(bubble,data[0],data[1],"ModelInit.prototype.levelHandler("+(x - 1)+")");
      }
      else {
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
   this.nextLevelScore = 2000; //2000 to get to level 2 your best score must be more than 5000
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
         game.solution = x;
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
            game.solution = x;
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
   this.gameDelay = 10000; //12 seconds game delay
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
         game.solution = x;
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
   this.gameDelay = 8000; //7 seconds game delay
   this.name = 4;
   this.playFactorCountMax = 10;
   this.nextLevelScore = 4000; 
   this.lives = 3; //you have five chances to fail before game ends
}


ModelFour.prototype.initAllBubbles = function(){
  ModelOne.prototype.initAllBubbles();
};


function ModelFive(){
   this.gameDelay = 8000; //7 seconds game delay
   this.name = 5;
   this.playFactorCountMax = 10;
   this.nextLevelScore = 4000; 
   this.lives = 3; //you have five chances to fail before game ends
}

ModelFive.prototype.initAllBubbles = function(){
  ModelTwo.prototype.initAllBubbles();
};


function ModelSix(){
   this.gameDelay = 8000; //7 seconds game delay
   this.name = 6;
   this.playFactorCountMax = 10;
   this.nextLevelScore = 4000; 
   this.lives = 3; //you have five chances to fail before game ends
}

ModelSix.prototype.initAllBubbles = function(){
  ModelThree.prototype.initAllBubbles();
};

function ModelSeven(){
   this.gameDelay = 10000; //7 seconds game delay
   this.name = 7;
   this.playFactorCountMax = 10;
   this.nextLevelScore = 4000; 
   this.lives = 3; //you have five chances to fail before game ends
   this.bubbleNumber = 5;
}

ModelSeven.prototype.initAllBubbles = function(){
  ModelOne.prototype.initAllBubbles();
};


function ModelEight(){
   this.gameDelay = 10000; //7 seconds game delay
   this.name = 8;
   this.playFactorCountMax = 10;
   this.nextLevelScore = 4000; 
   this.lives = 3; //you have five chances to fail before game ends
   this.bubbleNumber = 5;
}

ModelEight.prototype.initAllBubbles = function(){
  ModelTwo.prototype.initAllBubbles();
};


function ModelNine(){
   this.gameDelay = 10000; //7 seconds game delay
   this.name = 9;
   this.playFactorCountMax = 10;
   this.nextLevelScore = 4000; 
   this.lives = 3; //you have five chances to fail before game ends
   this.bubbleNumber = 5;
}

ModelNine.prototype.initAllBubbles = function(){
  ModelThree.prototype.initAllBubbles();
};








