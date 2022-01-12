this._x = 1000;
if(_parent.lose_count == 3)
{
   _parent.myLose.start();
   _parent.lose = 1;
}
else if(_parent.lose_count < 3)
{
   _parent.ButtonCanDown = 1;
}
stop();
