stop();
this.onRollOver = function()
{
   _parent.myRollOver.start();
   gotoAndStop(2);
};
this.onRollOut = function()
{
   gotoAndStop(1);
};
this.onDragOut = function()
{
   gotoAndStop(1);
};
this.onPress = function()
{
   _parent.head.gotoAndPlay(20);
};
