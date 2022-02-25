m = 1;
while(m <= 5)
{
   newName5 = "_parent.button" + m;
   eval(newName5).canDown = 1;
   m++;
}
_parent.win_count = _parent.win_count + 1;
if(_parent.win_count <= 4)
{
   _parent.click1._x = 548;
}
else if(_parent.win_count == 5)
{
   play();
}
