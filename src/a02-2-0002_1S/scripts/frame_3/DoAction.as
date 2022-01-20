function control_power()
{
   var _loc1_ = 5;
   if(isPress && powerBar._xscale < 100)
   {
      powerBar._xscale += _loc1_;
   }
   else if(isPress == false && powerBar._xscale > 0)
   {
      powerBar._xscale -= _loc1_ - 3;
   }
   else if(powerBar._xscale > 100)
   {
      powerBar._xscale = 100;
   }
}
function nextBall()
{
   color = random(5) + 1;
   eval("ball" + current).gotoAndStop(color);
   eval("ball" + current)._y = ballpy;
   eval("ball" + current)._x = _xmouse - eval("ball" + current)._width / 2;
}
stop();
Mouse.show();
var powerBar = power.bar;
isfly = false;
isPress = false;
isLock = false;
getPoint = false;
rightpoint = 0;
leftpoint = 0;
dir = "left";
speed = 30;
a = 1;
downSpeed = 0;
ballpy = ball1._y;
current = 1;
color = random(5) + 1;
ball1.gotoAndStop(color);
circle_right._visible = false;
circle_left._visible = false;
timer.gotoAndStop(2);
var mouseListener = new Object();
mouseListener.onMouseDown = function()
{
   isPress = true;
};
mouseListener.onMouseUp = function()
{
   isPress = false;
   isfly = true;
   hand.gotoAndStop(2);
   if(isLock == false)
   {
      var _loc1_ = 1;
      while(_loc1_ <= 5)
      {
         if(powerBar._xscale <= 20 * _loc1_ && powerBar._xscale > 20 * (_loc1_ - 1))
         {
            downSpeed = -30 + _loc1_;
            if(_loc1_ == 5)
            {
               a = 1;
            }
            else
            {
               a = 1 + 0.2 * (5 - _loc1_ - 1);
            }
         }
         _loc1_ = _loc1_ + 1;
      }
      if(powerBar._xscale <= 90 && powerBar._xscale >= 70 && hand._x >= 470 && hand._x <= 550)
      {
         if(rightpoint < 17)
         {
            getPoint = true;
            rightpoint++;
            dir = "right";
         }
      }
      else if(powerBar._xscale <= 90 && powerBar._xscale >= 70 && hand._x >= 250 && hand._x <= 330)
      {
         if(leftpoint < 17)
         {
            getPoint = true;
            leftpoint++;
            dir = "left";
         }
      }
      isLock = true;
   }
};
Mouse.addListener(mouseListener);
this.onEnterFrame = function()
{
   hand._x = _xmouse;
   control_power();
   if(isfly)
   {
      if(speed >= downSpeed)
      {
         if(getPoint)
         {
            if(speed >= -14)
            {
               speed -= a;
               eval("ball" + current)._y -= speed;
               eval("ball" + current)._xscale = eval("ball" + current)._yscale -= 0.7;
            }
            else
            {
               hand.gotoAndStop(1);
               if(dir == "right")
               {
                  circle_right._visible = true;
                  circle_right.gotoAndPlay(1 + 15 * (rightpoint - 1));
                  eval("circle_right.circle" + rightpoint).gotoAndStop(color);
                  circle_right.color = color;
               }
               else
               {
                  circle_left._visible = true;
                  circle_left.gotoAndPlay(1 + 15 * (leftpoint - 1));
                  eval("circle_left.circle" + leftpoint).gotoAndStop(color);
                  circle_left.color = color;
               }
               myScore.gotoAndPlay(2);
               if(rightpoint >= 17 && leftpoint >= 17)
               {
                  clearInterval(timer.intervalId);
                  myScore.gotoAndStop(10);
                  gotoAndStop(4);
                  delete this.onEnterFrame;
               }
               nextBall();
               eval("ball" + current)._xscale = eval("ball" + current)._yscale = 100;
               isfly = false;
               isLock = false;
               speed = 30;
               getPoint = false;
            }
         }
         else
         {
            speed -= a;
            eval("ball" + current)._y -= speed;
            eval("ball" + current)._xscale = eval("ball" + current)._yscale -= 0.7;
         }
      }
      else
      {
         hand.gotoAndStop(1);
         eval("life" + current)._visible = false;
         current++;
         nextBall();
         isfly = false;
         isLock = false;
         speed = 30;
         mySound1.start();
      }
   }
   else
   {
      eval("ball" + current)._x = _xmouse - eval("ball" + current)._width / 2;
   }
   if(timer.count == 0 || current == 4)
   {
      clearInterval(timer.intervalId);
      myScore.gotoAndStop(9);
      myScore.gotoAndStop(11);
      gotoAndStop(4);
      delete this.onEnterFrame;
   }
};
