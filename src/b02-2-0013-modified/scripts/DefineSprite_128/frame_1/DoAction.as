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
   _parent.myRight.start();
   _parent.count = _parent.count + 1;
   gotoAndStop(4);
   delete this.onRollOut;
   delete this.onRollOver;
   delete this.onDragOut;
   delete this.onPress;
};
