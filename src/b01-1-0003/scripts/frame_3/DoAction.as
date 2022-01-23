function getRandom()
{
   var _loc1_ = random(myQuestion1.length);
   var _loc2_ = myQuestion1[_loc1_];
   myQuestion1.splice(_loc1_,1);
   return _loc2_;
}
function getRandom2()
{
   var _loc1_ = random(myQuestion2.length);
   var _loc2_ = myQuestion2[_loc1_];
   myQuestion2.splice(_loc1_,1);
   return _loc2_;
}
function getAllRandom()
{
   var _loc1_ = random(allQuestion1.length);
   var _loc2_ = allQuestion1[_loc1_];
   allQuestion1.splice(_loc1_,1);
   return _loc2_;
}
function getAllRandom2()
{
   var _loc1_ = random(allQuestion2.length);
   var _loc2_ = allQuestion2[_loc1_];
   allQuestion2.splice(_loc1_,1);
   return _loc2_;
}
var myQuestion1 = new Array("黃色","藍色","紅色","綠色","橘色","白色","黑色");
var myQuestion2 = new Array("圓形","橢圓形","長方形","正方形","三角形","心形","星形");
var myAns = random(3);
var myClick = 3;
var myEnd = false;
if(myMode == 0)
{
   myQuestion = getAllRandom();
   trace("myQuestion =" + myQuestion);
   i = 0;
   while(i < myQuestion1.length)
   {
      if(myQuestion == myQuestion1[i])
      {
         myQuestion1.splice(i,1);
      }
      i++;
   }
   eval("answer" + myAns).gotoAndStop(myQuestion);
   i = 0;
   while(i < 3)
   {
      if(i != myAns)
      {
         myAnswer = getRandom();
         eval("answer" + i).gotoAndStop(myAnswer);
         trace("myAnswer =" + myAnswer);
      }
      i++;
   }
}
else
{
   myQuestion = getAllRandom2();
   trace("myQuestion =" + myQuestion);
   i = 0;
   while(i < myQuestion2.length)
   {
      if(myQuestion == myQuestion2[i])
      {
         myQuestion2.splice(i,1);
      }
      i++;
   }
   eval("answer" + myAns).gotoAndStop(myQuestion);
   i = 0;
   while(i < 3)
   {
      if(i != myAns)
      {
         myAnswer = getRandom2();
         eval("answer" + i).gotoAndStop(myAnswer);
         trace("myAnswer =" + myAnswer);
      }
      i++;
   }
}
this.onEnterFrame = function()
{
   if(myClick != 3)
   {
      gotoAndStop(4);
      delete this.onEnterFrame;
   }
};
stop();
