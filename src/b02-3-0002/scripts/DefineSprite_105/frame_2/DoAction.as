function ch1()
{
   b++;
   if(b > 5)
   {
      b = 1;
   }
   a0.gotoAndStop(b);
}
function cp1()
{
   if(a0._y < arry_a2[2])
   {
      a0._y += v;
   }
   else
   {
      offon = false;
      a0._y = arry_a2[2];
      _parent.ba_lock = 1;
   }
}
stop();
var offon = true;
a0._x = arry_a1[1];
a0._y = arry_a1[2];
this.onEnterFrame = function()
{
   if(_parent.my_ba2 == 1)
   {
      ch1();
      offon = true;
      a0._x = arry_a1[1];
      a0._y = arry_a1[2];
      _parent.my_ba2 = 0;
   }
   if(offon)
   {
      cp1();
   }
};
