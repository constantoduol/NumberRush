function BubbleGame(model){
   this.device = new AndroidDevice();
   this.model = model;
   this.bubbleArea =  $("#bubble-table");
   this.bubbleActiveArea =  $("#bubble-active-area");
   this.progressBar = $("#progressbar");
   this.messageArea = $("#message-area");
   this.numberOneArea = $("#number-area-left");
   this.numberTwoArea = $("#number-area-right");
   this.scoreArea = $("#current-score");
   this.bestScoreArea = $("#best-score");
   this.scoreAnimAreaUp = $("#score-anim-area-up");
   this.scoreAnimAreaDown = $("#score-anim-area-down");
   this.profName = $("#prof-name");
   this.profValue = $("#prof-value");
   this.profTable = $("#prof-table");
   this.lifeArea = $("#life-area");
   this.lifeHeart = $("#life-heart");
   this.bubbleNumber = model.bubbleNumber; //number of bubbles across the screen
   var width = this.getDim()[0];
   var height = this.getDim()[1];
   var gameWidth;
   if(width > height){
      gameWidth = height;
      this.bubbleDiameter = parseInt(gameWidth*0.48/3); //diameter in pixels
   }
   else {
      gameWidth = width;
      this.bubbleDiameter = parseInt(gameWidth*0.8/this.bubbleNumber); //diameter in pixels
   }
   this.gameWidth = gameWidth;
   this.bubbleAreaSpacingHorizontal = (width - (this.bubbleDiameter * this.bubbleNumber))/ (this.bubbleNumber + 1);
   this.bubbleAreaSpacingVertical = (height*0.6 - ( (this.bubbleDiameter) * 3))/10;
   this.bubbleDensity = this.bubbleNumber * 3; //this is the number of bubbles in the bubble area
   this.activeBubbles = [];
   this.bubbleIds = [];
   this.numberOne = 0;
   this.numberTwo = this.nextRangeRandom(5,10);//the first number is between 5 and 10
   this.moveFactor = 0;  //this is a range from 0 to 100 representing the progress bar location
   this.playFactor = 10; 
   this.playFactorCountMax = this.model.playFactorCountMax; //when we reach this count we increase the playFactor by 1  
   this.playFactorCount = 0; //we count up till we reach playFactorCountMax and reset
   this.progressAnimationDelay = 100; //delay in milliseconds for the progress bar
   this.timeoutData = {}; // store data about all timers in the game
   this.pauseData = {};
   this.bubbleClicked = true;
   this.bubbleNotClickedPenaltyFactor = 1;
   this.progressFactor = this.model.gameDelay/this.progressAnimationDelay;
   this.praise = ["super","excellent","good","fair","average"];
   this.praiseFactor = 100/this.praise.length;
   this.achievements = ["amateur","novice","expert","pro","genius"];
   this.achievementFactor = 100/this.achievements.length;
   this.bubbleArea.css("border-spacing",this.bubbleAreaSpacingHorizontal+"px  "+this.bubbleAreaSpacingVertical+"px");
   this.bubbleArea.css("border-collapse","separate");
   this.bubbleActiveArea.css("width",width+"px");
   this.settings = {};
   this.state = [];
   this.paused = false;
   this.solution = 0;
   var fontSize = parseInt(this.bubbleDiameter/2) + "px";
   this.numberOneArea.css("font-size",fontSize);
   this.numberTwoArea.css("font-size",fontSize);
}


BubbleGame.prototype.nextRandom = function (len){
   return Math.floor(Math.random()*len); 
};

BubbleGame.prototype.getDim = function(){
    var body = window.document.body;
    var screenHeight;
    var screenWidth;
    if (window.innerHeight) {
        screenHeight = window.innerHeight;
        screenWidth = window.innerWidth;
    }
    else if (body.parentElement.clientHeight) {
        screenHeight = body.parentElement.clientHeight;
        screenWidth = body.parentElement.clientWidth;
    }
    else if (body && body.clientHeight) {
        screenHeight = body.clientHeight;
        screenWidth = body.clientWidth;
    }
    return [screenWidth, screenHeight];  
};

BubbleGame.prototype.init = function(){
    if(game.model.name === "init"){
       $("#scorebar").css("display","none");
       game.bubbleArea.html("");
       game.model.initAllBubbles();
       if(game.state[8]) { //this means the user is running the game for the very first time
          game.device.firstRunHomeScreen();
       }
       
    }
    else {
        game.model.initAllBubbles();
        game.numberOneArea.html(game.numberOne);
        game.numberTwoArea.html(game.numberTwo);
    }
  
};

BubbleGame.prototype.showLevelMessage = function(type){ //if type == init, play, pause
    
    var scoreToNextLevel = game.model.nextLevelScore;
    var nextLevel = game.model.name + 1;
    var levels = game.model.levelData.length;
    var currentBest = parseInt(game.bestScoreArea.html());
    var diff = scoreToNextLevel - currentBest;
    
    if(diff <= 0 && type === "play"){
       if(nextLevel > levels){
            game.showMessage("<a href='#' class='icon' onclick='game.device.share()' title='Share with friends'><img src='img/share.png'></a>"+ 
                              "<a href='#' class='icon' onclick='game.resume(true);' title='Continue Playing'><img src='img/continue.png'></a>"+
                              "<a href='#' class='icon' onclick='game.removeMessage();showAd();' title='Go Home'><img src='img/home.png'></a>"+
                              "<br/><br/>Congratulations! You win the game!",
            Infinity);
            jse.setItem(nextLevel+"_level_unlocked","true");
       }
       else{
          
          var hasBronze = jse.getItem(nextLevel+"_level_unlocked");
          
          if(hasBronze !== "true"){ //if the next level is still unlocked show this
            game.showMessage("<a href='#' class='icon' onclick='game.device.share()' title='Share with friends'><img src='img/share.png'></a>"+ 
                              "<a href='#' class='icon' onclick='game.resume(true);' title='Continue Playing'><img src='img/continue.png'></a>"+
                              "<a href='#' class='icon' onclick='ModelInit.prototype.levelHandler("+(nextLevel-1)+")' title='Next Level'><img src='img/next.png'></a>"+
                              "<br/><br/><span style='font-size : 16px;'>Congratulations! You have earned a bronze badge"+
                              "<br/><img src='img/bronze.png' width=15 height=15><img src='img/bronze.png' width=15 height=15><img src='img/bronze.png' width=15 height=15><br/>"+
                              "You can now go to level "+nextLevel+" or continue playing to earn more badges</span>",Infinity);  
                       jse.setItem(nextLevel+"_level_unlocked","true");
          }
          else { //otherwise check for silver and gold badges otherwise just resume
              var hasGold = jse.getItem(game.model.name+"_gold_badge");
              var hasSilver = jse.getItem(game.model.name+"_silver_badge");
              var badge;
              if(currentBest >= game.model.goldScore && hasGold !== "true"){
                //this person has earned a gold badge  
                 badge = "gold";
                 jse.setItem(game.model.name+"_gold_badge","true");
              }
              else if(currentBest >= game.model.silverScore && hasSilver !== "true"){
                 //this person has earned a silver badge
                 badge = "silver";
                 jse.setItem(game.model.name+"_silver_badge","true"); 
              }
              else {
                return;
              }
              var msg = "<a href='#' class='icon' onclick='game.resume(true);' title='Continue Playing'><img src='img/continue.png'></a>"+
                       "<a href='#' class='icon' onclick='game.upload(\""+badge+"\");' title='Upload Score'><img src='img/upload.png'></a>"+
                       "<br/><br/><span style='font-size : 16px;'>Congratulations you have earned a "+badge+" badge<br/>"+
                       "<img src='img/"+badge+".png' width=15 height=15><img src='img/"+badge+".png' width=15 height=15><img src='img/"+badge+".png' width=15 height=15>"+
                       "<br/>and entered the Numberrush hall of fame<br/>"+
                       "Click the upload button to send your score to numberrushweb.appspot.com</span>";
              
              game.showMessage(msg,Infinity);
          }
          
       }
      
    }
    
   else if(type === "init") {
        //this is when the game is starting
       var msg = undefined;
       if(nextLevel > levels || diff <= 0 ){
           //this person has already cleared this level, so what's remaining is the silver and gold
            var silverDiff = game.model.silverScore - currentBest;
            var goldDiff = game.model.goldScore - currentBest;
            if(currentBest < game.model.silverScore){
                //this person has not reached the silver score 
                msg = "Play on to get a silver badge for this level, only "+silverDiff+" points to go";
            }
            else if(currentBest < game.model.goldScore){
                //this person has not reached the gold score
                msg = "Play on to get a gold badge for this level, only "+goldDiff+" points to go";
            }
            
       }
       else { 
           msg = ""+scoreToNextLevel+" points to reach level "+nextLevel+",<br/>"+diff+" points to go";
       }
       
        if(msg){
            game.showMessage(msg,4000,game.init);
            game.runLater(4200,function(){
                 if(game.state[8]){
                     console.log("show number one");
                     game.pause(false);
                     game.device.firstRunNumberOne();
                 }
            });
        }
        else {
          game.init();  
        }
        //incase this is the first time the game is running
        
       
    }
    
    else if(type === "pause"){
       game.messageArea.append("<br/><br/><span style='font-size : 16px;'>Level "+game.profName.html()+
                                " with "+game.profValue.html()+"% proficiency<br/>respond faster to get higher scores</span>"); 
    }
    //we show at the beginning the value of score you should get to
    //we congratulate you if you get there
    //when you pause we show you your proficiency 
  
};

BubbleGame.prototype.progressRunner = function(){
    if(!game.bubbleClicked && game.numberOne > 0){
       //the bubble was never clicked so deduct score  
       game.bubbleNotClickedPenaltyFactor = 0.5;
    }
    game.bubbleClicked = false;
    game.paused = false;
    game.clearAllTimers();
    game.moveFactor = 0;
    game.playFactorCount++;
    if(game.playFactorCount === game.playFactorCountMax){
       game.playFactorCount = 0;
       game.playFactor++;
    }
    game.animateProgress();
    var disappearTimer = game.runLater(game.model.gameDelay*0.95,game.disappear);
    var initBubbleTimer = game.runLater(game.model.gameDelay,game.model.initAllBubbles);
    game.timeoutData.disappear_timer = disappearTimer;
    game.timeoutData.init_bubble_timer = initBubbleTimer;
    game.bubbleIds = [];
    game.activeBubbles = [];
    game.bubbleArea.html("");
    game.showLevelMessage("play");
};

BubbleGame.prototype.nextRangeRandom = function(min,max){
    return Math.ceil((Math.random()*(max - min) + min));
};

BubbleGame.prototype.animateProgress = function(){
    if(window.requestAnimationFrame){
       window.requestAnimationFrame(function(){
           animate();
       });
    }
    else {
       animate(); 
    }
    
    function animate(){
        var percent = (game.moveFactor/game.progressFactor)*100;
        game.progressBar.progressbar({
            value : (100 - percent)
        });
        if(!game.paused){
            //schedule a refresh only if not paused
            var progressTimer = game.runLater(game.progressAnimationDelay,game.animateProgress);
        }
        game.timeoutData.progress_timer = progressTimer;
        game.moveFactor++;
        game.moveFactor = percent === 100 ? 0 : game.moveFactor;
        if(percent > 70){
            game.progressBar.css("border-color","red");
            game.progressBar.children().css("border-color","red");
            game.progressBar.children().css("background","red");
        }
        else {
            game.progressBar.css("border-color","#51CBEE");
            game.progressBar.children().css("border-color","#51CBEE");
            game.progressBar.children().css("background","#51CBEE");  
     }
  }
};

BubbleGame.prototype.disappear = function(){
  for(var x = 0; x < game.bubbleIds.length; x++){
     var id = game.bubbleIds[x];
     var bubble =  $("#"+id);
     bubble.addClass("old-bubble");
     game.runLater(100,function(){
       bubble.removeClass("old-bubble"); 
    });
  }
};

BubbleGame.prototype.showMessage = function(msg,duration,callback){
  if(!msg){
      
  }
  else {
      game.messageArea.css("padding-top",game.getDim()[1]/3+"px");
      game.messageArea[0].innerHTML = msg;
  }
  game.messageArea.css("display","block");
  game.messageArea.addClass("new-bubble");
  game.bubbleArea.css("display","none");
  if(duration === Infinity){
     game.pause(false);
  }
  else {
      game.runLater(duration*0.95,function(){
          game.messageArea.removeClass("new-bubble");
          game.bubbleArea.css("display","block");
          game.messageArea.addClass("old-bubble");   
      });
       game.runLater(duration,function(){
           game.messageArea.css("display","none");
           game.messageArea.removeClass("old-bubble"); 
           if(callback){
              callback();
           }
       });
  }
  
};

BubbleGame.prototype.clickBubble = function(bubbleId){
   if(game.device.playPopAudio && game.settings.sound_on === "on"){
      game.device.playPopAudio();
      //play a pop sound
   }
   game.bubbleClicked = true;
   var bubble = $("#"+bubbleId);
   var innerBubble = $("#inner_"+bubbleId);
   var index = game.bubbleIds.indexOf(bubbleId);
   var theBubble = game.activeBubbles[index];
   var expr = theBubble.firstNum + theBubble.sign + theBubble.secondNum;
   bubble.addClass("bubble-clicked exploding-bubble");
   bubble.css("padding-top",game.getDim()[1]/3+"px");
   bubble[0].style.width = null;
   bubble[0].style.height = null;
   bubble[0].style.borderRadius = game.gameWidth+"px";
   bubble[0].style.fontSize = null;
   var run = true;
   game.pause(false);
   game.runLater(600,function(){
      var sln = window.eval(expr);
      innerBubble.html(sln);
      var diff = game.numberTwo - game.numberOne;
      if(sln === diff ){
          var percent = (game.moveFactor/game.progressFactor)*100;
          var praise = game.praise[Math.round(percent/game.praiseFactor) - 1];
          var scoreUp = parseInt( diff * game.bubbleNotClickedPenaltyFactor * 3 * (100 - percent)/100 );
          
          game.numberOneArea.addClass("explode");
          game.numberTwoArea.addClass("explode");
          game.scoreAnimAreaUp.html("+"+scoreUp+" "+praise);
          game.scoreAnimAreaUp.addClass("score-anim-up");
          
          var newNumTwo = game.numberTwo + game.nextRangeRandom(5,game.playFactor);
          game.numberOne = game.numberTwo;
          game.numberTwo = newNumTwo;
          
          var currentScore = game.scoreArea.html();
          var bestScore = game.bestScoreArea.html();
          currentScore = parseInt(currentScore) + scoreUp;
          game.scoreArea.html(currentScore);
         
          if (currentScore > bestScore) {
            bestScore = parseInt(bestScore) + scoreUp;
            game.bestScoreArea.html(bestScore);
            game.scoreArea.html(bestScore);
          }
          var profPercent = Math.round( ( currentScore/(game.numberOne*3) )*100 )
          game.setProfLevel(profPercent);
          game.numberOneArea.html(game.numberOne);
          game.numberTwoArea.html(game.numberTwo);
          
          game.runLater(2000,function(){
             game.numberOneArea.removeClass("explode");
             game.numberTwoArea.removeClass("explode");
             game.scoreAnimAreaUp.html("");
             game.scoreAnimAreaUp.removeClass("score-anim-up");
          });
      }
      else {
          var lives = parseInt(game.lifeArea.html());
          if(lives > 0){
            lives--;  
          }
          game.lifeArea.html(lives);
          game.glow(game.lifeHeart,4000);
          game.lifeDown();
          if(lives <= 0){ 
             game.showMessage("<a href='#' class='icon' onclick='game.device.share()' title='Share with friends'><img src='img/share.png'></a>"+ 
                              "<a href='#' class='icon' onclick='game.doRestart();' title='Play again'><img src='img/replay.png'></a>"+
                              "<a href='#' class='icon' onclick='game.removeMessage();game.doRestart();game.pause(false);showAd();' title='Go Home'><img src='img/home.png'></a>"+
                               "<br/><br/>Game Over!<br/> Better luck next time.",
            Infinity);
            var bubbleGame = new BubbleGame(game.model);
            window.game = bubbleGame;
            run = false;
            jse.pauseMusic();
          }
      }
   });
   game.runLater(1200,function(){
       bubble.addClass("old-bubble"); 
   });
   game.runLater(1500,function(){
      game.device.persistState();
      if(run){
          game.init();
          game.bubbleNotClickedPenaltyFactor = 1; 
      }
      
   });
  
};

BubbleGame.prototype.lifeDown = function(){
   game.scoreAnimAreaDown.html("-1");
   game.scoreAnimAreaDown.addClass("score-anim-down");
   game.numberOneArea[0].style.background = "red";
   game.numberTwoArea[0].style.background = "red";
   game.runLater(2000,function(){
       game.numberOneArea[0].style.background = "lightblue";
       game.numberTwoArea[0].style.background = "lightblue";
       game.scoreAnimAreaDown.html("");
       game.scoreAnimAreaDown.removeClass("score-anim-down");
   });
};

BubbleGame.prototype.pause = function(external){ //true show externally that game is paused
  //save the current state of the game and stop all timers
  //if level is init return
  if(game.model.name === "init")
      return;
  game.paused = true;
  var timeRemain = ( (100 - game.moveFactor)/100)*game.model.gameDelay; //in milliseconds
  game.pauseData.time_remain = timeRemain;
  game.clearAllTimers();
  if(external) {
      game.showMessage("<a href='#' class='icon' onclick='game.device.share()' id='share_icon' title='Share with friends'><img src='img/share.png'></a>"+
                        "<a href='#' class='icon' onclick='game.resume(true)' id='play_icon' title='Resume game'><img src='img/play.png'></a>"+
                        "<a href='#' class='icon' onclick='game.removeMessage();showAd();' id='home_icon' title='Go Home'><img src='img/home.png'></a>",
            Infinity);
      game.showLevelMessage("pause");     
      jse.pauseMusic();
    }
  
};

BubbleGame.prototype.removeMessage = function (){
    game.bubbleArea.css("display","block");
    game.messageArea.removeClass("new-bubble");
    game.messageArea.addClass("old-bubble");
    game.runLater(1000,function(){
        game.messageArea.removeClass("old-bubble"); 
        game.messageArea.css("display","none");
    });
};

BubbleGame.prototype.resume = function(external){ //true if we are doing an external resume
    game.paused = false;
    if(external) {
       game.removeMessage();
       if(game.settings.music_on === "on"){
          jse.playMusic();
       }
    }
    var timeRemain = game.pauseData.time_remain;
    var moveFactor = 100 - 100*timeRemain/game.model.gameDelay;
    game.moveFactor = moveFactor;
    game.animateProgress();
    var disappearTimer = game.runLater(timeRemain*0.95,game.disappear);
    var initBubbleTimer = game.runLater(timeRemain,game.model.initAllBubbles);
    game.timeoutData.disappear_timer = disappearTimer;
    game.timeoutData.init_bubble_timer = initBubbleTimer;
   
};

BubbleGame.prototype.restart = function(){
  game.showMessage("<div style='font-size : 30px;color:black'>"+
                   "<div>Restart Game ?</div><br/>"+
                   "<a href='#'  style='margin-right : 20px;' onclick='game.doRestart()'>Yes</a>"+
                   "<a href='#'  onclick='game.removeMessage();game.resume()' >No</a></div>",
                   Infinity);
                  
  

};

 BubbleGame.prototype.doRestart = function(){
      game.removeMessage();
      var model = game.model;
      var bubbleGame = new BubbleGame(model);
      window.game = bubbleGame;
      game.init();
      game.scoreArea.html(0);
      game.lifeArea.html(model.lives);
      game.device.persistState();
 };
 
 BubbleGame.prototype.setProfLevel = function(percent){
    var prevAchievement = game.profName.html();
    var achievement = game.achievements[Math.ceil(percent/game.achievementFactor) - 1];
    game.profName.html(achievement);
    game.profValue.html(percent);
    game.profTable.css("background", "rgba(255, 215,0,"+percent/100+")");
    if(prevAchievement !== achievement ){
        game.glow(game.profTable,4000);
     }
 };
 
   BubbleGame.prototype.glow = function(elem,duration){
       function doGlow(){
           elem.addClass("score-table-glow");
           game.runLater(duration,function(){
               elem.removeClass("score-table-glow"); 
           });
       }
       if(window.requestAnimationFrame){
           window.requestAnimationFrame(function(){
               doGlow();
           });
       }
       else {
           doGlow();
       }
   };
 
   BubbleGame.prototype.menuBuilder = function (menu) {
      var selectIds = [];    
      var width = game.getDim()[0];
      var table = $("<table  style='margin-top:20px;font-size:20px;border-spacing:24px;border-collapse : separate'>");
      for(var x = 0; x < menu.length; x++){
          var subMenu = menu[x];
          var options = subMenu.options;
          var label = subMenu.label;
          var preset = subMenu.preset;
          var tr = $("<tr>");
          var td1 = $("<td style='margin-right : 20px; padding : 5px; background:lightblue;color:black;border-radius:5px;font-size:24px'>" + label + "</td>");
          var td2 = $("<td>");
          var selectId = "select_" + Math.floor(Math.random() * 10000000);
          selectIds.push(selectId);
          var select = $("<select id=" + selectId + " style='font-size:24px'>");
          for (var y = 0; y < options.length; y++) {
              var option = $("<option value=" + options[y] + ">" + options[y] + "</option>");
              select.append(option);
          }
          select.val(preset);
          td2.html(select);
          tr.append(td1);
          tr.append(td2);
          table.append(tr);  
	 }
         var buttonDiv = $("<div style='margin-top : 20px'>");
         var ok = $("<input type='button' class='btn btn-primary' value='OK' style='width : " + 0.8 * width + "px;font-size:20px'>");
         ok.attr("onclick", "game.device.saveSettings" + "(" + JSON.stringify(selectIds) + ")");
         buttonDiv.append(ok);
         game.messageArea.css("padding-top","0px");
         game.messageArea.html("");
         game.messageArea.append(table);
         game.messageArea.append(buttonDiv); 
         game.showMessage(undefined,Infinity);
         
   };

BubbleGame.prototype.addInitBubble = function (newBubble,row,col,clickHandler){
    var currentRow;
    var rowId = "row_"+row;
    if( (col + game.bubbleNumber) % game.bubbleNumber === 0){
       currentRow = $("<tr id="+rowId+">");
       game.bubbleArea.append(currentRow);
     }
     else{
        currentRow = $("#"+rowId); 
     }
    var width = game.bubbleDiameter+"px";
    var radius = game.bubbleDiameter/2 + "px";
    var fontSize = parseInt(game.bubbleDiameter/3) + "px";
    var str = newBubble.firstNum + newBubble.sign + newBubble.secondNum + "";
    var td_id = "td_"+row+"_"+col;
    var currentItem = $("<td id="+td_id+" style='padding-bottom : 15px;'>");
    var bubbleDivId = "bubble_"+row+"_"+col;
    var bubbleDiv = $("<div onclick = '"+clickHandler+"' class='circle' style='width : "+width+";height : \n\
                      "+width+";line-height:"+width+";border-radius:"+radius+";\n\
                      font-size:"+fontSize+";'><div id='inner_"+bubbleDivId+"'>"+str+"</div></div>");
    currentItem.append(bubbleDiv);
    bubbleDiv.attr("id",bubbleDivId);
    newBubble.id = bubbleDivId; 
    currentRow.append(currentItem); 
    game.activeBubbles.push(newBubble);
    game.bubbleIds.push(newBubble.id);
};


BubbleGame.prototype.runLater = function (limit, func) {
    return setTimeout(func, limit);
};

BubbleGame.prototype.clearAllTimers = function(){
   for(var timer in game.timeoutData){
       var timeout = game.timeoutData[timer];
       clearTimeout(timeout);
   } 
   game.timeoutData = {};
};

BubbleGame.prototype.upload = function(type){
  var name = window.prompt("Enter your screen name");   
  name = name === "" ? "anonymous" : name;
  Ajax.run({
      url : "https://numberrushweb.appspot.com/numbers",
      type : "post",
      data :  {
          request_header : {
              request_msg : "hall_of_fame"
          },        
          request_object : {  
             level : game.model.name,
             type : type,
             name : name,
             user_id : game.state[7]
          }
      },
      error : function(err){
          game.showMessage( "<a href='#' class='icon' onclick='game.resume(true);' title='Continue Playing'><img src='img/continue.png'></a>"+
                            "<a href='#' class='icon' onclick='game.upload(\""+type+"\");' title='Upload Score'><img src='img/upload.png'></a>"+
                            "<br><br><span style='font-size:16px;'>Whoops!Something went wrong,check your internet connection and retry</span>",Infinity);
      },
      success : function(json){
         game.showMessage("<a href='#' class='icon' onclick='game.resume(true);' title='Continue Playing'><img src='img/continue.png'></a>"+
                           "<a href='#' class='icon' onclick='game.removeMessage();showAd();' title='Go Home'><img src='img/home.png'></a></a>"+
                           "<br><br><span style='font-size:16px;'>Yey! you are now in the numberrush hall of fame<br> at <a href='#' onclick='jse.hallOfFame()'>Number rush</a>!</span>",Infinity);
      }});
};