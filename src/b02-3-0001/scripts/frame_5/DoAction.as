j = 1;
while(j <= 7)
{
   newName2 = "block" + j;
   eval(newName2).oldx = eval(newName2)._x;
   eval(newName2).oldy = eval(newName2)._y;
   eval(newName2).old_depth = eval(newName2).getDepth();
   eval(newName2).can_move = 0;
   eval(newName2).myblock = j;
   j++;
}
Mouse.show();
this.onEnterFrame = function()
{
   k = 1;
   while(k <= 5)
   {
      newName4 = "button" + k;
      k++;
   }
   i = 1;
   while(i <= 7)
   {
      newName = "block" + i;
      eval(newName).onPress = function()
      {
         this.swapDepths(100);
         this.can_move = 1;
      };
      if(eval(newName).can_move == 1)
      {
         eval(newName)._x = _xmouse;
         eval(newName)._y = _ymouse;
      }
      eval(newName).onRelease = function()
      {
         if(picture.cube.hitTest(this) && picture.need == this.myblock)
         {
            myTrue.start();
            picture.nextFrame();
            man.gotoAndPlay(31);
         }
         else if(picture.cube.hitTest(this) && picture.need != this.myblock)
         {
            myFalse.start();
            X._x = 540;
            X.gotoAndPlay(1);
            man.gotoAndPlay(11);
         }
         this._x = this.oldx;
         this._y = this.oldy;
         this.swapDepths(this.old_depth);
         this.can_move = 0;
      };
      eval(newName).onRollOver = function()
      {
         myRollOver.start();
      };
      i++;
   }
};
