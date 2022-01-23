if(myClick == myAns)
{
   eval("cross" + myClick).gotoAndPlay("正確");
   myPoint++;
}
else
{
   eval("cross" + myClick).gotoAndPlay("錯誤");
}
this.onEnterFrame = function()
{
   if(myEnd)
   {
      i = 0;
      while(i < 3)
      {
         eval("cross" + i).gotoAndStop(1);
         i++;
      }
      trace(myWay);
      myWay--;
      if(myWay == 0)
      {
         gotoAndStop(5);
         delete this.onEnterFrame;
      }
      else
      {
         question.gotoAndPlay(1);
         eval("cross" + myClick).gotoAndStop(1);
         gotoAndStop(3);
         delete this.onEnterFrame;
      }
   }
};
stop();
