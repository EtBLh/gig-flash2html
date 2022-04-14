stop();
Mouse.show();
var n1Now;
var n10Now;
var now = new Date();
var startTimeS;
startTimeS = now.getTime();
var timeinterS;
delete now;
var point = 0;
this.onEnterFrame = function()
{
   if(count == maxCount)
   {
      gotoAndStop(6);
      head.gotoAndStop(32);
   }
   var _loc1_ = undefined;
   var _loc2_ = new Date();
   _loc1_ = _loc2_.getTime();
   var _loc3_ = undefined;
   _loc3_ = (_loc1_ - startTimeS) / 1000;
   timeinterS = 60 - Math.floor((_loc1_ - startTimeS) / 1000);
   false;
   if(_loc3_ <= 60)
   {
      if(timeinterS < 10)
      {
         var _loc4_ = "0" + timeinterS;
         sTime.text = _loc4_;
      }
      else
      {
         var _loc5_ = timeinterS;
         sTime.text = _loc5_;
      }
   }
   else
   {
      sTime.text = "00";
      gotoAndStop(6);
      head.gotoAndPlay(31);
   }
};
