function DRAG_BOX()
{
   if(eval("tb" + tbIndex).hitTest(collection) && eval("tb" + tbIndex)._mode == 1)
   {
      _click._x = 5000;
      mySound1.start();
      eval("tb" + tbIndex)._mode = 2;
   }
   if(eval("tb" + tbIndex)._mode == 2)
   {
      eval("tb" + tbIndex)._x = _xmouse;
      eval("tb" + tbIndex)._y = _ymouse;
   }
   if(eval("tb" + tbIndex)._y <= 180)
   {
      if(eval("tb" + tbIndex).objtype == 1)
      {
         eval("tb" + tbIndex).gotoAndStop(5);
      }
      if(eval("tb" + tbIndex).objtype == 2)
      {
         eval("tb" + tbIndex).gotoAndStop(15);
      }
      if(eval("tb" + tbIndex).objtype == 3)
      {
         eval("tb" + tbIndex).gotoAndStop(25);
      }
   }
   else
   {
      if(eval("tb" + tbIndex).objtype == 1)
      {
         eval("tb" + tbIndex).gotoAndStop(1);
      }
      if(eval("tb" + tbIndex).objtype == 2)
      {
         eval("tb" + tbIndex).gotoAndStop(10);
      }
      if(eval("tb" + tbIndex).objtype == 3)
      {
         eval("tb" + tbIndex).gotoAndStop(20);
      }
   }
   if(eval("tb" + tbIndex)._y <= 160 && eval("tb" + tbIndex)._mode == 2)
   {
      if(Math.abs(eval("tb" + tbIndex)._x - b1._x) < 5 || Math.abs(eval("tb" + tbIndex)._x - b2._x) < 5 || Math.abs(eval("tb" + tbIndex)._x - b3._x) < 5)
      {
         var filter = new flash.filters.GlowFilter(16777215,0.6,35,35,2,70,true,false);
         var filterArray = new Array();
         filterArray.push(filter);
         eval("tb" + tbIndex).filters = filterArray;
         mode3Place = 1;
      }
      else
      {
         eval("tb" + tbIndex).filters = null;
         mode3Place = 0;
      }
   }
   else
   {
      eval("tb" + tbIndex).filters = null;
      mode3Place = 0;
   }
}
function MOVE2()
{
   if(key == 0)
   {
      if(tbIndex > 1)
      {
         tbIndex--;
      }
      else
      {
         tbIndex = 5;
      }
      key = 1;
   }
   newName = "tb" + tbIndex;
   if(eval(newName)._x <= 594.6)
   {
      tb1._x += my_xMove;
      tb2._x += my_xMove;
      tb3._x += my_xMove;
      tb4._x += my_xMove;
      tb5._x += my_xMove;
   }
   else
   {
      eval("tb" + tbIndex)._mode = 1;
      my_trans = 0;
   }
   if(trnasbox._x <= 402)
   {
      trnasbox._x += my_xMove;
   }
   else
   {
      trnasbox._x = 324;
   }
}
function DOWN_BOX()
{
   if(eval("tb" + tbIndex)._y <= 160)
   {
      eval("tb" + tbIndex)._y += my_xMove;
      if(eval("tb" + tbIndex).hitTest(b1) || eval("tb" + tbIndex).hitTest(b2) || eval("tb" + tbIndex).hitTest(b3))
      {
         var filter = new flash.filters.GlowFilter(16777215,0.5,35,35,2,50,true,false);
         var filterArray = new Array();
         filterArray.push(filter);
         eval("tb" + tbIndex).filters = filterArray;
      }
      else
      {
         eval("tb" + tbIndex).filters = null;
      }
   }
   else
   {
      my_name = null;
      RANBOX();
      eval("tb" + tbIndex)._x = BoxPositionArry[1][1] - 208;
      eval("tb" + tbIndex)._y = BoxPositionArry[2][1];
      eval("tb" + tbIndex).filters = null;
      key = 0;
      my_trans = 1;
      eval("tb" + tbIndex)._mode = 0;
   }
}
function TYPE_TEST()
{
   if(mode3Place == 1)
   {
      if(Math.abs(eval("tb" + tbIndex)._x - b1._x) < 10)
      {
         mode2Type = 1;
      }
      if(Math.abs(eval("tb" + tbIndex)._x - b2._x) < 10)
      {
         mode2Type = 2;
      }
      if(Math.abs(eval("tb" + tbIndex)._x - b3._x) < 10)
      {
         mode2Type = 3;
      }
      if(eval("tb" + tbIndex).objtype == mode2Type && eval("tb" + tbIndex)._mode == 2 && mode2Type == 1)
      {
         eval("tb" + tbIndex)._mode = 3;
         a1.gotoAndPlay(52);
         point++;
         myScore.gotoAndPlay(6);
         mode2Type = null;
      }
      if(eval("tb" + tbIndex).objtype == mode2Type && eval("tb" + tbIndex)._mode == 2 && mode2Type == 2)
      {
         eval("tb" + tbIndex)._mode = 3;
         a2.gotoAndPlay(52);
         point++;
         myScore.gotoAndPlay(6);
         mode2Type = null;
      }
      if(eval("tb" + tbIndex).objtype == mode2Type && eval("tb" + tbIndex)._mode == 2 && mode2Type == 3)
      {
         eval("tb" + tbIndex)._mode = 3;
         a3.gotoAndPlay(52);
         point++;
         myScore.gotoAndPlay(6);
         mode2Type = null;
      }
   }
}
function RANBOX()
{
   var array2 = new Array("圓型","方型","三角");
   var ranLength = random(array2.length);
   ranArrayObj = null;
   ranArrayObj = array2[ranLength];
   eval("tb" + tbIndex).gotoAndStop(ranArrayObj);
   trace(ranArrayObj);
   trace(objtype);
}
stop();
var point = 0;
var ooo = 0;
var n10Now;
var now = new Date();
var startTimeS;
startTimeS = now.getTime();
var timeinterS;
delete now;
a = 0;
var key = 0;
var changeNum = 0;
var my_name = null;
var mode2Type;
var mode3Place = 0;
i = 1;
while(i <= 5)
{
   tbName = "tb" + i;
   eval(tbName)._x = -237.4 + (i - 1) * 208;
   BoxPositionArry[1][i] = eval(tbName)._x;
   BoxPositionArry[2][i] = eval(tbName)._y;
   i++;
}
var mouseListener = new Object();
mouseListener.onMouseUp = function()
{
   if(mode2Type == 1 && eval("tb" + tbIndex)._y <= 155)
   {
      if(eval("tb" + tbIndex).objtype != mode2Type && ooo == 0)
      {
         a1.gotoAndPlay(2);
         ooo = 1;
      }
   }
   if(mode2Type == 2 && eval("tb" + tbIndex)._y <= 155)
   {
      if(eval("tb" + tbIndex).objtype != mode2Type && ooo == 0)
      {
         a2.gotoAndPlay(2);
         ooo = 1;
      }
   }
   if(mode2Type == 3 && eval("tb" + tbIndex)._y <= 155)
   {
      if(eval("tb" + tbIndex).objtype != mode2Type && ooo == 0)
      {
         a3.gotoAndPlay(2);
         ooo = 1;
      }
   }
};
mouseListener.onMouseDown = function()
{
   eval("tb" + tbIndex).filters = null;
   if(eval("tb" + tbIndex)._mode == 2)
   {
      TYPE_TEST();
   }
};
mouseListener.onMouseMove = function()
{
   collection._x = _xmouse;
   collection._y = _ymouse;
   DRAG_BOX();
};
Mouse.addListener(mouseListener);
this.onEnterFrame = function()
{
   var nowTimeS;
   var now = new Date();
   nowTimeS = now.getTime();
   var a;
   a = (nowTimeS - startTimeS) / 1000;
   timeinterS = 60 - Math.floor((nowTimeS - startTimeS) / 1000);
   delete now;
   if(a <= 60)
   {
      if(timeinterS < 10)
      {
         var n1 = "0" + timeinterS;
         sTime.text = n1;
         trace(n1);
      }
      else
      {
         var n10;
         n10 = timeinterS;
         sTime.text = n10;
      }
   }
   else
   {
      myScore.gotoAndStop(20);
      sTime.text = "00";
      gotoAndStop(6);
      delete this.onEnterFrame;
   }
   if(eval("tb" + tbIndex)._mode == 3)
   {
      DOWN_BOX();
   }
   else if(my_trans == 1 && eval("tb" + tbIndex)._mode == 0)
   {
      MOVE2();
   }
};
