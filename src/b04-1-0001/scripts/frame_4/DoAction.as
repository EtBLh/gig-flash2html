stop();
count = 0;
myTime = 0;
masknum = 1;
popomax = 0;
var gameStart = true;
var depth = 200;
var k = 0;
var count = 0;
var masknum = 1;
var intervalId;
var duration = 600;
var myScore = 0;
btn.swapDepths(2001);
mouse._visible = false;
if(myPlay == 0)
{
   myBack.gotoAndStop(41);
   myBack2.gotoAndStop(41);
}
else if(myPlay == 1)
{
   myBack.gotoAndStop(1);
   myBack2.gotoAndStop(1);
}
else if(myPlay == 2)
{
   myBack.gotoAndStop(20);
   myBack2.gotoAndStop(20);
}
var i = 0;
while(i < 10)
{
   var j = 0;
   while(j < 15)
   {
      var circleName = "circle" + i + "_" + j;
      this.attachMovie("circle",circleName,depth++);
      eval(circleName)._x = 43 * j + 100;
      eval(circleName)._y = 47.3 * i + 80;
      j++;
   }
   i++;
}
this.onEnterFrame = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
   myTime++;
   if(myTime % 20 == 0)
   {
      newName = "ball" + count;
      ball.duplicateMovieClip(newName,count);
      eval(newName)._x = -40;
      eval(newName)._y = 600;
      newName2 = "ball_2" + count;
      ball_2.duplicateMovieClip(newName2,count * 20);
      eval(newName2)._x = 840;
      eval(newName2)._y = 600;
      count++;
   }
   if(myScore >= 130)
   {
      gotoAndStop(5);
      gameStart = false;
      if(myPlay < 2)
      {
         myPlay++;
      }
      else
      {
         myPlay = 0;
      }
   }
};
mouse.swapDepths(1000);
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   mouse._x = _xmouse;
   mouse._y = _ymouse;
   updateAfterEvent();
};
Mouse.addListener(mouseListener);
