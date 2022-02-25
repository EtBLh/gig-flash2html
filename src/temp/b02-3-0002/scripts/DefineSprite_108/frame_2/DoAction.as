function ch1()
{
   a++;
   if(a > 5)
   {
      a = 1;
   }
   a0.gotoAndStop(a);
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
ch1();
this.onEnterFrame = function()
{
   if(_parent.my_ba1 == 1)
   {
      ch1();
      offon = true;
      a0._x = arry_a1[1];
      a0._y = arry_a1[2];
      _parent.my_ba1 = 0;
   }
   if(offon)
   {
      cp1();
   }
};
