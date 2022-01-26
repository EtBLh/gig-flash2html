function drawColor()
{
   if(count == 7)
   {
      my_drawColor = 1;
      if(my_drawColor == 1)
      {
         j = 1;
         while(j <= 7)
         {
            if(whichone == j)
            {
               _bName = "b" + j;
               b_Name = "b" + j + ".b" + j + "_1";
               eval(_bName).onRelease = function()
               {
                  dCount = my_color.getRGB();
                  trace(b_Name);
                  d = new Color(b_Name);
                  d.setRGB(dCount);
                  delete d;
               };
            }
            j++;
         }
      }
   }
}
function attach()
{
   j = 1;
   while(j <= 7)
   {
      bName = "b" + j;
      bpName = "bp" + j;
      if(eval(bName).hitTest(eval(bpName)) && eval(bName).itemlock == 0)
      {
         my_sound4.start();
         num++;
         count++;
         lockone = 0;
         eval(bName).itemlock = 1;
         eval(bName)._x = bpArray[1][j];
         eval(bName)._y = bpArray[2][j];
         delete bpName;
         delete bName;
         break;
      }
      if(eval(bName).itemlock == 0 && lockone == 0)
      {
         eval(bName)._x = bArray[1][j];
         eval(bName)._y = bArray[2][j];
      }
      j++;
   }
}
stop();
typeb1._visible = true;
typeb2._visible = false;
var num = 0;
my_mc._x = 1500;
my_color.setRGB(16777215);
lockone = 0;
whichone = 0;
count = 0;
count = 0;
j = 1;
while(j <= 7)
{
   bName = "b" + j;
   bpName = "bp" + j;
   bArray[1][j] = eval(bName)._x;
   bArray[2][j] = eval(bName)._y;
   bpArray[1][j] = eval(bpName)._x;
   bpArray[2][j] = eval(bpName)._y;
   eval(bpName)._visible = false;
   eval(bName).itemlock = 0;
   delete bName;
   delete bpName;
   j++;
}
var b2D = b4.getDepth();
b1.swapDepths(b2D + 100);
b6.swapDepths(b2D + 200);
b7.swapDepths(b2D + 300);
b3.swapDepths(b2D + 400);
b5.swapDepths(b2D + 500);
b2.swapDepths(b2D + 600);
my_mc.swapDepths(b2D + 700);
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   if(count == 7 && num == 7)
   {
      typeb1._visible = false;
      typeb2._visible = true;
   }
   if(count == 7 && colorNum != 0)
   {
      my_mc._x = _xmouse;
      my_mc._y = _ymouse;
   }
   if(lockone == 1)
   {
      j = 1;
      while(j <= 7)
      {
         bName = "b" + j;
         if(whichone == j && eval(bName).itemlock == 0)
         {
            eval(bName)._x = _xmouse;
            eval(bName)._y = _ymouse;
            delete bName;
            break;
         }
         j++;
      }
   }
};
Mouse.addListener(mouseListener);
this.onEnterFrame = function()
{
   trace(count);
   j = 1;
   while(j <= 7)
   {
      bName = "b" + j;
      if(eval(bName).itemlock == 1)
      {
         eval(bName).gotoAndStop(1);
      }
      j++;
   }
   drawColor();
   attach();
};
