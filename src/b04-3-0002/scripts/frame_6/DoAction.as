function drawColor()
{
   if(count == 6)
   {
      my_drawColor = 1;
      if(my_drawColor == 1)
      {
         j = 1;
         while(j <= 6)
         {
            if(whichone == j)
            {
               _cName = "c" + j;
               c_Name = "c" + j + ".c" + j + "_1";
               eval(_cName).onRelease = function()
               {
                  dCount = my_color.getRGB();
                  trace(c_Name);
                  d = new Color(c_Name);
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
   while(j <= 6)
   {
      cName = "c" + j;
      cpName = "cp" + j;
      §§push(eval(cName).hitTest(eval(cpName)));
      if(eval(cName).hitTest(eval(cpName)))
      {
         §§pop();
         §§push(eval(cName));
         break;
      }
      if(§§pop())
      {
         my_sound4.start();
         numc++;
         count++;
         lockone = 0;
         eval(cName).itemlock = 1;
         eval(cName)._x = cpArray[1][j];
         eval(cName)._y = cpArray[2][j];
         delete cpName;
         delete cName;
         break;
      }
      if(eval(cName).itemlock == 0 && lockone == 0)
      {
         eval(cName)._x = cArray[1][j];
         eval(cName)._y = cArray[2][j];
      }
      j++;
   }
}
stop();
typec1._visible = true;
typec2._visible = false;
var numc = 0;
my_mc._x = 1500;
my_color.setRGB(16777215);
lockone = 0;
whichone = 0;
count = 0;
j = 1;
while(j <= 6)
{
   cName = "c" + j;
   cpName = "cp" + j;
   cArray[1][j] = eval(cName)._x;
   cArray[2][j] = eval(cName)._y;
   cpArray[1][j] = eval(cpName)._x;
   cpArray[2][j] = eval(cpName)._y;
   eval(cpName)._visible = false;
   eval(cName).itemlock = 0;
   delete cName;
   delete cpName;
   j++;
}
var c2D = c1.getDepth();
c2.swapDepths(c2D + 100);
c4.swapDepths(c2D + 200);
c5.swapDepths(c2D + 300);
c6.swapDepths(c2D + 400);
c3.swapDepths(c2D + 500);
my_mc.swapDepths(c2D + 700);
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   if(count == 6 && numc == 6)
   {
      typec1._visible = false;
      typec2._visible = true;
   }
   if(count == 6 && colorNum != 0)
   {
      my_mc._x = _xmouse;
      my_mc._y = _ymouse;
   }
   if(lockone == 1)
   {
      j = 1;
      while(j <= 6)
      {
         cName = "c" + j;
         if(whichone == j && eval(cName).itemlock == 0)
         {
            eval(cName)._x = _xmouse;
            eval(cName)._y = _ymouse;
            delete cName;
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
   while(j <= 6)
   {
      cName = "c" + j;
      if(eval(cName).itemlock == 1)
      {
         eval(cName).gotoAndStop(1);
      }
      j++;
   }
   drawColor();
   attach();
};
