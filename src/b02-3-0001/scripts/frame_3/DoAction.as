Mouse.show();
win_count = 0;
k = 1;
while(k <= 5)
{
   newName3 = "button" + k;
   eval(newName3).used = 0;
   eval(newName3).canDown = 1;
   eval(newName3).goto = k + 3;
   eval(newName3).onRollOver = function()
   {
      if(this.used == 0 && this.canDown == 1)
      {
         this.gotoAndStop(2);
         myRollOver.start();
      }
   };
   eval(newName3).onRollOut = eval(newName3).onDragOut = function()
   {
      if(this.used == 0 && this.canDown == 1)
      {
         this.gotoAndStop(1);
      }
   };
   eval(newName3).onRelease = function()
   {
      if(this.used == 0 && this.canDown == 1)
      {
         myCheck.start();
         this.used = 1;
         this.gotoAndStop(3);
         this._parent.gotoAndStop(this.goto);
         m = 1;
         while(m <= 5)
         {
            newName5 = "button" + m;
            eval(newName5).canDown = 0;
            m++;
         }
         click1._x = 1200;
      }
   };
   k++;
}
