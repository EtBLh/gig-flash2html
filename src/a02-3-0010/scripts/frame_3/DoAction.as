function ReStart(a)
{
   if(a == 3)
   {
      ball._x = 396;
      ball._y = 525;
      ball._xscale = 100;
      ball._yscale = 100;
      shotlock = 0;
      ball.gotoAndPlay(1);
   }
}
function Rotate()
{
   rx = _xmouse - dir._x;
   ry = _ymouse - dir._y;
   _atan = Math.atan2(ry,rx);
   _atan1 = _atan / 3.141592653589793 * 180 + 90;
   if(_atan1 <= 53 && _atan1 >= -53)
   {
      dir._rotation = _atan1;
   }
}
function Shot1()
{
   var _loc3_ = undefined;
   var _loc1_ = undefined;
   var _loc2_ = undefined;
   _power = count / 100 * 380;
   if(shotlock == 0)
   {
      ballin = false;
      xrotatelock = dir._rotation;
      trace(xrotatelock);
      _loc3_ = 1.5707963267948966 - dir._rotation / 180 * 3.141592653589793;
      if(dir._rotation == 90)
      {
         _loc1_ = 0;
      }
      else
      {
         _loc1_ = _power * Math.cos(_loc3_);
      }
      _loc2_ = _power * Math.sin(_loc3_);
      vxDis = _loc1_;
      vyDis = _loc2_;
      vxMax = _loc1_ + 396;
      vyMax = - _loc2_ + 525;
      ball.gotoAndPlay(2);
      shotlock = 1;
   }
}
function Shot2()
{
   if(Math.abs(ball._y - vyMax) <= 2)
   {
      trace(vyMax);
      shotlock = 2;
      ball._x = vxMax;
      ball._y = vyMax;
      if(pointlock)
      {
         HitCollect();
      }
   }
   else
   {
      BallScale();
      if(ball._y < 525 - vyDis / 2)
      {
         trace("1");
         ball._y -= vyDis / 100;
         ball._x += vxDis / 100;
      }
      else
      {
         ball._y -= vyDis / 70;
         ball._x += vxDis / 70;
      }
   }
}
function HitCollect()
{
   pointlock = false;
   if(HitTest(b1._x,b1._y) <= 70)
   {
      point++;
      myScore.gotoAndPlay(2);
      ballin = true;
   }
   if(HitTest(b2._x,b2._y) <= 62)
   {
      point += 2;
      myScore.gotoAndPlay(2);
      ballin = true;
   }
   if(HitTest(bb2._x,bb2._y) <= 62)
   {
      point += 2;
      myScore.gotoAndPlay(2);
      ballin = true;
   }
   if(HitTest(b3._x,b3._y) <= 39)
   {
      point += 3;
      myScore.gotoAndPlay(2);
      ballin = true;
   }
   if(HitTest(bb3._x,bb3._y) <= 39)
   {
      point += 3;
      myScore.gotoAndPlay(2);
      ballin = true;
   }
   if(HitTest(b4._x,b4._y) <= 26)
   {
      point += 4;
      myScore.gotoAndPlay(2);
      ballin = true;
   }
   if(!ballin)
   {
      myScore.gotoAndPlay(31);
      myFalse.start();
   }
}
function Light()
{
   var _loc1_ = count / 100 * 380;
   if(_loc1_ >= HitTest(b1._x,b1._y) - 70 && _loc1_ <= HitTest(b1._x,b1._y) + 70)
   {
      bo1.gotoAndPlay(2);
   }
   if(_loc1_ >= HitTest(b2._x,b2._y) - 62 && _loc1_ <= HitTest(b2._x,b2._y) + 58)
   {
      bo2.gotoAndPlay(2);
   }
   if(_loc1_ >= HitTest(bb2._x,bb2._y) - 62 && _loc1_ <= HitTest(bb2._x,bb2._y) + 58)
   {
      bbo2.gotoAndPlay(2);
   }
   if(_loc1_ >= HitTest(b3._x,b3._y) - 39 && _loc1_ <= HitTest(b3._x,b3._y) + 39)
   {
      bo3.gotoAndPlay(2);
   }
   if(_loc1_ >= HitTest(bb3._x,bb3._y) - 39 && _loc1_ <= HitTest(bb3._x,bb3._y) + 39)
   {
      bbo3.gotoAndPlay(2);
   }
   if(_loc1_ >= HitTest(b4._x,b4._y) - 26 && _loc1_ <= HitTest(b4._x,b4._y) + 26)
   {
      bo4.gotoAndPlay(2);
   }
}
function HitTest(a, b)
{
   var _loc2_ = Math.abs(ball._x - a);
   var _loc1_ = Math.abs(ball._y - b);
   var _loc3_ = Math.sqrt(_loc2_ * _loc2_ + _loc1_ * _loc1_);
   return _loc3_;
}
function BallScale()
{
   if(ballfly && Math.abs(ball._y - (vyMax + vyDis / 2)) <= 2)
   {
      ball.gotoAndPlay(31);
      ballfly = false;
   }
   ball._xscale -= 0.0011111111111111111 * vyDis;
   ball._yscale -= 0.0011111111111111111 * vyDis;
}
function executeCallback()
{
   count += _key;
   if(count == 101)
   {
      count = 100;
   }
}
stop();
Mouse.show();
var gameover = false;
var life = 0;
var ballin = false;
var xrotatelock = 0;
var point = 0;
var ballfly = false;
var shotlock = 0;
var pointlock = false;
var mouseListener = new Object();
Mouse.addListener(mouseListener);
mouseListener.onMouseMove = function()
{
   button._x = _xmouse;
   button._y = _ymouse;
};
this.onEnterFrame = function()
{
   if(gameover)
   {
      gotoAndStop(6);
      delete this.onEnterFrame;
   }
   if(_key == 1 && shotlock == 0)
   {
      Light();
   }
   ReStart(shotlock);
   if(shotlock == 1)
   {
      Shot2();
   }
   Rotate();
   power._xscale = count;
};
button.onPress = function()
{
   _key = 1;
};
button.onRelease = function()
{
   Shot1();
   _key = 0;
   count = 0;
};
intervalId = setInterval(this,"executeCallback",duration);
