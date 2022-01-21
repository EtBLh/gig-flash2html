stop();
var n10Now;
var now = new Date();
var startTimeS;
startTimeS = now.getTime();
var timeinterS;
delete now;
a = 0;
this.onEnterFrame = function()
{
   var _loc2_ = undefined;
   var _loc3_ = new Date();
   _loc2_ = _loc3_.getTime();
   var _loc4_ = undefined;
   _loc4_ = (_loc2_ - startTimeS) / 1000;
   timeinterS = 59 - Math.floor((_loc2_ - startTimeS) / 1000);
   false;
   if(_loc4_ <= 60)
   {
      if(timeinterS < 10)
      {
         var _loc5_ = "0" + timeinterS;
         sTime.text = _loc5_;
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
      myLose.start();
      myScore.gotoAndStop(2);
      sTime.text = "00";
      gotoAndStop(7);
      delete this.onEnterFrame;
   }
   if(myTrueAnswer && myBtnDown)
   {
      myTrueAnswer = false;
      myNowQuestion++;
      win_count++;
      nextFrame();
   }
   if(win_count == 3)
   {
      myWin.start();
      myScore.gotoAndStop(3);
      gotoAndStop(7);
      delete this.onEnterFrame;
   }
};
myBtnDown = false;
myOs1.onSoundComplete = function()
{
   myBtnDown = true;
};
myOs1.start(2,1);
stop();
