Mouse.show();
var n1Now;
var n10Now;
var now = new Date();
var startTimeS;
startTimeS = now.getTime();
var timeinterS;
delete now;
var point = 0;
var depth = -16250;
var myMode = 0;
var k = 0;
var vy = 5;
var vx = 5;
var myEnd = false;
var myBall = false;
hand.swapDepths(-16200);
bowl.swapDepths(-16251);
onEnterFrame = function()
{
   var nowTimeS;
   var now = new Date();
   nowTimeS = now.getTime();
   var a;
   a = (nowTimeS - startTimeS) / 1000;
   timeinterS = 60 - Math.floor((nowTimeS - startTimeS) / 1000);
   delete now;
   if(!myBall)
   {
      BALL.duplicateMovieClip("BALL" + k,depth++);
      eval("BALL" + k)._x = hand._x - 15;
      eval("BALL" + k)._y = hand._y - 15;
      k++;
      myBall = true;
   }
   if(myMode == 0)
   {
      eval("BALL" + (k - 1))._y = hand._y - 15;
   }
   else if(myMode == 1)
   {
      eval("BALL" + (k - 1)).gotoAndStop(2);
      eval("BALL" + (k - 1))._x -= vx;
      eval("BALL" + (k - 1))._y += vy;
      vy += 0.8;
      if(eval("BALL" + (k - 1))._y > 453)
      {
         vy = (- vy) * 0.7;
         trace(vy);
         eval("BALL" + (k - 1))._y = 450;
      }
   }
   if(eval("BALL" + (k - 1)).hitTest(hitBall) && vy > 5)
   {
      eval("BALL" + (k - 1)).gotoAndStop(3);
      eval("BALL" + (k - 1)).swapDepths(depth - 50);
      eval("BALL" + (k - 1))._y = 345;
      water._x = eval("BALL" + (k - 1))._x;
      myScore.gotoAndPlay(2);
      myScore.point_txt.text = ++point;
      myMode = 0;
      vy = 5;
      vx = 5;
      myBall = false;
   }
   else if(eval("BALL" + (k - 1))._y > 445 && Math.abs(vy) < 5)
   {
      eval("BALL" + (k - 1)).gotoAndStop(4);
      eval("BALL" + (k - 1))._y = 453;
      myMode = 0;
      vy = 5;
      vx = 5;
      myBall = false;
   }
   else if(eval("BALL" + (k - 1))._x < 15)
   {
      eval("BALL" + (k - 1))._x = 16;
      vx = (- vx) * 0.5;
      vy *= 0.8;
   }
   else if(eval("BALL" + (k - 1))._x > 600)
   {
      eval("BALL" + (k - 1)).gotoAndStop(4);
      eval("BALL" + (k - 1))._y = 447.8;
      eval("BALL" + (k - 1))._x = random(20) + 590;
      myMode = 0;
      vy = 5;
      vx = 5;
      myBall = false;
   }
   if(a <= 60)
   {
      if(timeinterS < 10)
      {
         var n1 = "0" + timeinterS;
         sTime.text = n1;
      }
      else
      {
         var n10 = timeinterS;
         sTime.text = n10;
      }
   }
   else
   {
      i = 0;
      while(i <= k)
      {
         eval("BALL" + i)._y = 1000;
         i++;
      }
      myWin.start();
      sTime.text = "00";
      myScore.point_txt.text = point;
      bowl.swapDepths(-16349);
      hand._visible = false;
      myScore.gotoAndStop(9);
      gotoAndStop(4);
      delete this.onEnterFrame;
   }
};
var mouseListener = new Object();
mouseListener.onMouseUp = function()
{
   hand.gotoAndStop(1);
};
mouseListener.onMouseDown = function()
{
   hand.gotoAndStop(2);
   if(myMode == 0)
   {
      myMode = 1;
   }
};
mouseListener.onMouseMove = function()
{
   if(_ymouse > 45 && _ymouse < 440)
   {
      hand._y = _ymouse;
   }
   else if(_ymouse < 45)
   {
      hand._y = 46;
   }
   else if(_ymouse > 440)
   {
      hand._y = 439;
   }
};
Mouse.addListener(mouseListener);
stop();
