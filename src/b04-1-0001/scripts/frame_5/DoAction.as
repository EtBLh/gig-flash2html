stop();
delete this.onEnterFrame;
this.onEnterFrame = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
if(myPlay == 1)
{
   myBack2.gotoAndStop(50);
}
else if(myPlay == 2)
{
   myBack2.gotoAndStop(1);
}
else if(myPlay == 0)
{
   myBack2.gotoAndStop(20);
}
var i = 0;
while(i < 10)
{
   var j = 0;
   while(j < 15)
   {
      eval("circle" + i + "_" + j).removeMovieClip();
      j++;
   }
   i++;
}
var i = 0;
while(i < count)
{
   eval("ball" + count).removeMovieClip();
   eval("ball_2" + count).removeMovieClip();
   i++;
}
var i = 0;
while(i < masknum)
{
   eval("_root.mask1.mask" + i).removeMovieClip();
   i++;
}
