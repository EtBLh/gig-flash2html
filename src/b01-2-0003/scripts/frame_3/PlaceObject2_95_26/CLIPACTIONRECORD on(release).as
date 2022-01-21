on(release){
   if(_parent.myBtnDown)
   {
      _parent.myBtnDown = false;
      if(myNum == _parent.myAnswer[_parent.myNowQuestion])
      {
         _parent.myTrueAnswer = true;
         _parent.myA1.gotoAndPlay("正確");
      }
      else
      {
         _parent.myA1.gotoAndPlay("錯誤");
         _parent.tall.gotoAndStop(2);
      }
   }
}
