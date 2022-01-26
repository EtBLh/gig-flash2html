function drawColor()
{
   if(count == 5)
   {
      my_drawColor = 1;
      if(my_drawColor == 1)
      {
         j = 1;
         while(j <= 5)
         {
            if(whichone == j)
            {
               _aName = "a" + j;
               a_Name = "a" + j + ".a" + j + "_1";
               eval(_aName).onRelease = function()
               {
                  dCount = my_color.getRGB();
                  d = new Color(a_Name);
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
   while(j <= 5)
   {
      aName = "a" + j;
      apName = "ap" + j;
      if(eval(aName).hitTest(eval(apName)) && eval(aName).itemlock == 0)
      {
         my_sound4.start();
         numa++;
         count++;
         lockone = 0;
         eval(aName).itemlock = 1;
         eval(aName)._x = apArray[1][j];
         eval(aName)._y = apArray[2][j];
         delete apName;
         delete aName;
         break;
      }
      if(eval(aName).itemlock == 0 && lockone == 0)
      {
         eval(aName)._x = aArray[1][j];
         eval(aName)._y = aArray[2][j];
      }
      j++;
   }
}
stop();
typea1._visible = true;
typea2._visible = false;
var numa = 0;
count = 0;
my_mc._x = 1500;
my_color.setRGB(16777215);
lockone = 0;
whichone = 0;
count = 0;
j = 1;
while(j <= 5)
{
   aName = "a" + j;
   apName = "ap" + j;
   aArray[1][j] = eval(aName)._x;
   aArray[2][j] = eval(aName)._y;
   apArray[1][j] = eval(apName)._x;
   apArray[2][j] = eval(apName)._y;
   eval(apName)._visible = false;
   eval(aName).itemlock = 0;
   delete aName;
   delete apName;
   j++;
}
trace(a2.getDepth());
var a2D = a2.getDepth();
a5.swapDepths(a2D + 100);
a1.swapDepths(a2D + 200);
a3.swapDepths(a2D + 300);
a4.swapDepths(a2D + 400);
my_mc.swapDepths(a2D + 500);
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   if(count == 5 && numa == 5)
   {
      typea1._visible = false;
      typea2._visible = true;
   }
   if(count == 5 && colorNum != 0)
   {
      my_mc._x = _xmouse;
      my_mc._y = _ymouse;
   }
   if(lockone == 1)
   {
      j = 1;
      while(j <= 5)
      {
         aName = "a" + j;
         if(whichone == j && eval(aName).itemlock == 0)
         {
            eval(aName)._x = _xmouse;
            eval(aName)._y = _ymouse;
            delete aName;
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
   while(j <= 5)
   {
      aName = "a" + j;
      if(eval(aName).itemlock == 1)
      {
         eval(aName).gotoAndStop(1);
      }
      j++;
   }
   drawColor();
   attach();
};
