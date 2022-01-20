function START_BOX()
{
   var array = new Array("圓型","方型","三角");
   i = 1;
   while(i <= 5)
   {
      tbName = "tb" + i;
      if(i > 3)
      {
         array = Array("圓型","方型","三角");
         j = 0;
         while(j < array.length)
         {
            if(ranArrayObj == array[j])
            {
               array.splice(j,1);
            }
            j++;
         }
      }
      var ranLength = random(array.length);
      ranArrayObj = array[ranLength];
      array.splice(ranLength,1);
      eval(tbName).gotoAndStop(ranArrayObj);
      i++;
   }
   delete array;
}
function MOVE()
{
   if(trnasbox._x <= 402)
   {
      trnasbox._x += my_xMove;
   }
   else
   {
      trnasbox._x = 324;
   }
   i = 1;
   while(i <= 5)
   {
      tbName = "tb" + i;
      if(eval(tbName)._x > 594.6)
      {
         j = 1;
         while(j <= 5)
         {
            eval(tbName)._x = -237.4 + (j - 1) * 208;
            j++;
         }
         tbIndex = i;
         eval("tb" + tbIndex)._mode = 1;
      }
      continue;
      go3 = true;
      gotoAndStop(4);
      eval(tbName)._x += my_xMove;
      i++;
      break;
   }
}
stop();
Mouse.show();
var objtype = 0;
var ranArrayObj;
var tbIndex = 0;
var my_trans = 0;
var my_xMove = 5;
var go3 = false;
var BoxPositionArry = new Array();
BoxPositionArry[1] = new Array();
BoxPositionArry[2] = new Array();
i = 1;
while(i <= 5)
{
   tbName = "tb" + i;
   eval(tbName)._mode = 0;
   i++;
}
START_BOX();
this.onEnterFrame = function()
{
   if(!go3)
   {
      MOVE();
   }
   else
   {
      delete this.onEnterFrame;
   }
};
