function getRandom()
{
   var _loc1_ = random(myRandom.length);
   var _loc2_ = myRandom[_loc1_];
   myRandom.splice(_loc1_,1);
   return _loc2_;
}
function getR(ar)
{
   var _loc1_ = random(ar.length);
   var _loc2_ = ar[_loc1_];
   ar.splice(_loc1_,1);
   return _loc2_;
}
var n10Now;
var now = new Date();
var startTimeS;
startTimeS = now.getTime();
var timeinterS;
delete now;
var myAns = new Array();
var myNAns = new Array();
var myGirl0 = new Array("女生頭0","女生衣0","女生褲0","女生鞋0");
var myGirl1 = new Array("女生頭1","女生衣1","女生褲1","女生鞋1");
var myBoy0 = new Array("男生頭0","男生衣0","男生褲0","男生鞋0");
var myBoy1 = new Array("男生頭1","男生衣1","男生褲1","男生鞋1");
var myRandom = new Array(0,1,2,3,4,5);
var myRandom2 = new Array();
var myClick = "沒東西";
var myRemoveClick = "沒東西";
var myBadEnd = false;
var myMouseDown = false;
var myError = 0;
var myPoint = 0;
var myQ = random(4);
trace(myQ);
myShow._visible = false;
girlShirt._visible = false;
i = 0;
while(i < 6)
{
   myRandom2[i] = getRandom();
   i++;
}
trace(myRandom2);
if(myQ == 0)
{
   question.gotoAndStop("女生題目0");
   i = 0;
   while(i < 4)
   {
      myAns[i] = myGirl0[i];
      i++;
   }
   i = 0;
   while(i < 4)
   {
      myNAns[i] = myGirl1[i];
      i++;
   }
   var i = 0;
   while(i < 6)
   {
      if(myRandom2[i] < 4)
      {
         var myBtn = getR(myGirl0);
         eval("btn" + i).gotoAndPlay(myBtn);
         eval("btn" + i).myName = myBtn;
         trace(myBtn);
      }
      else
      {
         var myBtn = getR(myGirl1);
         eval("btn" + i).gotoAndPlay(myBtn);
         eval("btn" + i).myName = myBtn;
         trace(myBtn);
      }
      i++;
   }
}
else if(myQ == 1)
{
   i = 0;
   while(i < 4)
   {
      myAns[i] = myGirl1[i];
      i++;
   }
   i = 0;
   while(i < 4)
   {
      myNAns[i] = myGirl0[i];
      i++;
   }
   question.gotoAndStop("女生題目1");
   var i = 0;
   while(i < 6)
   {
      if(myRandom2[i] < 4)
      {
         var myBtn = getR(myGirl1);
         eval("btn" + i).gotoAndStop(myBtn);
         eval("btn" + i).myName = myBtn;
         trace(myBtn);
      }
      else
      {
         var myBtn = getR(myGirl0);
         eval("btn" + i).gotoAndStop(myBtn);
         eval("btn" + i).myName = myBtn;
         trace(myBtn);
      }
      i++;
   }
}
else if(myQ == 2)
{
   i = 0;
   while(i < 4)
   {
      myAns[i] = myBoy0[i];
      i++;
   }
   i = 0;
   while(i < 4)
   {
      myNAns[i] = myBoy1[i];
      i++;
   }
   question.gotoAndStop("男生題目0");
   var i = 0;
   while(i < 6)
   {
      if(myRandom2[i] < 4)
      {
         var myBtn = getR(myBoy0);
         eval("btn" + i).gotoAndStop(myBtn);
         eval("btn" + i).myName = myBtn;
         trace(myBtn);
      }
      else
      {
         var myBtn = getR(myBoy1);
         eval("btn" + i).gotoAndStop(myBtn);
         eval("btn" + i).myName = myBtn;
         trace(myBtn);
      }
      i++;
   }
}
else if(myQ == 3)
{
   i = 0;
   while(i < 4)
   {
      myAns[i] = myBoy1[i];
      i++;
   }
   i = 0;
   while(i < 4)
   {
      myNAns[i] = myBoy0[i];
      i++;
   }
   question.gotoAndStop("男生題目1");
   var i = 0;
   while(i < 6)
   {
      if(myRandom2[i] < 4)
      {
         var myBtn = getR(myBoy1);
         eval("btn" + i).gotoAndStop(myBtn);
         eval("btn" + i).myName = myBtn;
         trace(myBtn);
      }
      else
      {
         var myBtn = getR(myBoy0);
         eval("btn" + i).gotoAndStop(myBtn);
         eval("btn" + i).myName = myBtn;
         trace(myBtn);
      }
      i++;
   }
}
trace(myAns);
this.onEnterFrame = function()
{
   var nowTimeS;
   var now = new Date();
   nowTimeS = now.getTime();
   var a;
   a = (nowTimeS - startTimeS) / 1000;
   timeinterS = 60 - Math.floor((nowTimeS - startTimeS) / 1000);
   delete now;
   if(myPoint < 4)
   {
      if(a <= 60)
      {
         if(timeinterS < 10)
         {
            var n1 = "0" + timeinterS;
            sTime.text = n1;
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
         sTime.text = "00";
         myScore.gotoAndStop(2);
         gotoAndStop(4);
         delete this.onEnterFrame;
      }
   }
   else
   {
      myScore.gotoAndStop(4);
      gotoAndStop(4);
      delete this.onEnterFrame;
   }
   if(myClick != "沒東西")
   {
      var myTest = 0;
      var i = 0;
      while(i < 4)
      {
         if(myClick == myAns[i])
         {
            eval("myShow" + i)._x = myShow._x;
            eval("myShow" + i)._y = myShow._y;
            eval("myShow" + i).myStack = true;
            eval("myShow" + i).gotoAndStop(myClick);
            if(myClick == "女生褲0")
            {
               girlShirt._visible = true;
            }
            else if(myClick == "女生褲1")
            {
               girlShirt._visible = false;
            }
            myClick = "沒東西";
            myPoint++;
            myTrue.start();
            myMouseDown = false;
         }
         else
         {
            myTest++;
         }
         i++;
      }
      if(myTest == 4)
      {
         if(myQ == 0)
         {
            question.gotoAndPlay("女生不高興0");
         }
         else if(myQ == 1)
         {
            question.gotoAndPlay("女生不高興1");
         }
         else if(myQ == 2)
         {
            question.gotoAndPlay("男生不高興0");
         }
         else if(myQ == 3)
         {
            question.gotoAndPlay("男生不高興1");
         }
         var i = 0;
         while(i < 4)
         {
            if(myClick == myNAns[i])
            {
               if(!eval("myShow" + i).myStack)
               {
                  if(myClick == "女生褲0")
                  {
                     girlShirt._visible = true;
                  }
                  else if(myClick == "女生褲1")
                  {
                     girlShirt._visible = false;
                  }
                  myRemoveClick = eval("myShow" + i);
                  eval("myShow" + i)._x = myShow._x;
                  eval("myShow" + i)._y = myShow._y;
                  eval("myShow" + i).gotoAndStop(myClick);
                  break;
               }
            }
            i++;
         }
         myFalse.start();
         myError++;
         myClick = "沒東西";
      }
      trace("你錯了" + myError + "次");
   }
   if(myBadEnd)
   {
      eval(myRemoveClick)._y = -500;
      trace(myRemoveClick);
      myRemoveClick = "沒東西";
      myBadEnd = false;
   }
   if(myError == 2)
   {
      if(myQ == 0)
      {
         question.gotoAndPlay("女生不高興0");
      }
      else if(myQ == 1)
      {
         question.gotoAndPlay("女生不高興1");
      }
      else if(myQ == 2)
      {
         question.gotoAndPlay("男生不高興0");
      }
      else if(myQ == 3)
      {
         question.gotoAndPlay("男生不高興1");
      }
      myScore.gotoAndStop(3);
      gotoAndStop(4);
      delete this.onEnterFrame;
   }
};
stop();
