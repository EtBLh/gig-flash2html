this.onEnterFrame = function()
{
   if(myMode == 0)
   {
      if(handDown == 1)
      {
         fingerRrotation(minute_hand);
      }
      else if(handDown == 2)
      {
         fingerRrotation(hour_hand);
      }
      if(!hourClick && !minuteClick)
      {
         myMode = 1;
         trueClick();
      }
   }
   else if(myMode == 2)
   {
      gotoAndPlay(3);
   }
};
minute_hand.onPress = function()
{
   if(minuteClick)
   {
      click1._visible = false;
      handDown = 1;
   }
};
hour_hand.onPress = function()
{
   if(hourClick)
   {
      click1._visible = false;
      handDown = 2;
   }
};
minute_hand.onRelease = function()
{
   if(Math.abs(minute_hand._rotation - minuteRandom) < 10 || Math.abs(minute_hand._rotation - minuteRandom) > 350)
   {
      if(minuteClick)
      {
         myTrue.start();
         minute_hand._rotation = minuteRandom;
         minuteClick = false;
      }
   }
   trace(Math.abs(minute_hand._rotation - minuteQ._rotation));
   minute_hand.filters = null;
   handDown = 0;
};
hour_hand.onRelease = function()
{
   if(Math.abs(hour_hand._rotation - hourRandom) < 10 || Math.abs(hour_hand._rotation - hourRandom) > 350)
   {
      if(hourClick)
      {
         myTrue.start();
         hour_hand._rotation = hourRandom;
         hourClick = false;
      }
   }
   trace(Math.abs(hour_hand._rotation - hourQ._rotation));
   hour_hand.filters = null;
   handDown = 0;
};
minute_hand.onRollOver = function()
{
   if(minuteClick)
   {
      minute_hand.filters = filterArray;
   }
};
hour_hand.onRollOver = function()
{
   if(hourClick)
   {
      hour_hand.filters = filterArray;
   }
};
minute_hand.onRollOut = function()
{
   minute_hand.filters = null;
   handDown = 0;
};
hour_hand.onRollOut = function()
{
   hour_hand.filters = null;
   handDown = 0;
};
fingerRrotation = function(finger)
{
   var _loc3_ = finger._x;
   var _loc2_ = finger._y;
   var _loc5_ = _xmouse - _loc3_;
   var _loc4_ = _ymouse - _loc2_;
   var _loc6_ = Math.atan2(_loc4_,_loc5_) * 180 / 3.141592653589793 + 180;
   finger._rotation = _loc6_ - 90;
};
trueClick = function()
{
   clock.ring.gotoAndPlay(2);
   myWin.start();
   yesno.gotoAndPlay(2);
};
stop();
