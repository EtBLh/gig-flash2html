function _trace()
{
   if(aa.a == testNum && bb.b == testNum && cc.c == testNum)
   {
      winNest = 1;
      cross.gotoAndPlay(52);
      trace("win");
   }
}
stop();
test.light.play();
var temp;
var omytest = 0;
Mouse.show();
var n10Now;
var now = new Date();
var startTimeS;
startTimeS = now.getTime();
var timeinterS;
delete now;
a = 0;
var point = 0;
var winNest = 0;
var ba_lock = 1;
var aNum = 0;
var bNum = 0;
var cNum = 0;
ba1.onRelease = function()
{
   if(ba_lock == 1)
   {
      ba1.gotoAndPlay(2);
      my_ba1 = 1;
      ba_lock = 0;
   }
   mySound1.start();
};
ba2.onRelease = function()
{
   if(ba_lock == 1)
   {
      ba2.gotoAndPlay(2);
      my_ba2 = 1;
      ba_lock = 0;
   }
   mySound1.start();
};
ba3.onRelease = function()
{
   if(ba_lock == 1)
   {
      ba3.gotoAndPlay(2);
      my_ba3 = 1;
      ba_lock = 0;
   }
   mySound1.start();
};
this.onEnterFrame = function()
{
   if(winNest == 0 && ba_lock == 0)
   {
      _trace();
   }
   if(winNest == 1)
   {
      if(omytest == 1)
      {
         omytest = 0;
         do
         {
            temp = random(5) + 1;
         }
         while(testNum == temp);
         
         testNum = temp;
         test.gotoAndStop(testNum);
         test.light.gotoAndPlay(1);
         winNest = 0;
      }
   }
   var _loc3_ = undefined;
   var _loc4_ = new Date();
   _loc3_ = _loc4_.getTime();
   var _loc5_ = undefined;
   _loc5_ = (_loc3_ - startTimeS) / 1000;
   timeinterS = 60 - Math.floor((_loc3_ - startTimeS) / 1000);
   false;
   if(_loc5_ <= 60)
   {
      if(timeinterS < 10)
      {
         var _loc2_ = "0" + timeinterS;
         sTime.text = _loc2_;
         trace(_loc2_);
      }
      else
      {
         var _loc6_ = undefined;
         _loc6_ = timeinterS;
         sTime.text = _loc6_;
      }
   }
   else
   {
      myScore.gotoAndStop(20);
      sTime.text = "00";
      gotoAndStop(5);
      delete this.onEnterFrame;
   }
};
