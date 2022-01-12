on(press){
   gotoAndStop(3);
   myStart.start();
   tv.gotoAndStop(random_frame);
   if(_parent.random_frame <= 3)
   {
      menu01.gotoAndStop(1);
   }
   else if(random_frame >= 7 && random_frame <= 9)
   {
      menu01.gotoAndStop(1);
   }
   else
   {
      menu01.gotoAndStop(2);
      menu01.thermometer.gotoAndStop(1);
   }
}
