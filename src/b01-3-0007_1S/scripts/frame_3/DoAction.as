ButtonCanDown = -2;
win_count = 0;
lose_count = 0;
lose = 0;
Mouse.show();
this.onEnterFrame = function()
{
   if(ButtonCanDown == -2)
   {
      ButtonCanDown = 1;
      if(random_frame <= 3)
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
      i = 1;
      while(i <= 6)
      {
         newName = "menu01.button" + i;
         eval(newName).button_num = i;
         eval(newName).button_on = 0;
         eval(newName).onRollOver = function()
         {
            if(win_count < 5 && lose_count < 3)
            {
               this.gotoAndStop(2);
               myRollOver.start();
               if(this.button_num == 4 && this.button_on == 0)
               {
                  this.button_on = -1;
                  menu01.thermometer.gotoAndPlay(18);
               }
               else if(this.button_num == 5 && this.button_on == 0)
               {
                  this.button_on = -1;
                  menu01.thermometer.gotoAndPlay(1);
               }
               else if(this.button_num == 6 && this.button_on == 0)
               {
                  this.button_on = -1;
                  menu01.thermometer.gotoAndPlay(8);
               }
            }
         };
         eval(newName).onRollOut = eval(newName).onDragOut = function()
         {
            this.button_on = 0;
            this.gotoAndStop(1);
         };
         eval(newName).onRelease = function()
         {
            this.button_on = 1;
         };
         i++;
      }
   }
   j = 1;
   while(j <= 6)
   {
      newName = "menu01.button" + j;
      if(eval(newName).button_on == 1 && j == random_frame && ButtonCanDown == 1)
      {
         myTrue.start();
         eval(newName).button_on = 0;
         O._x = 223;
         O.gotoAndPlay(1);
         ButtonCanDown = 0;
         tv.gotoAndStop(random_frame + 6);
         win_count++;
      }
      else if(eval(newName).button_on == 1 && j != random_frame && ButtonCanDown == 1)
      {
         myFalse.start();
         eval(newName).button_on = 0;
         X._x = 223;
         X.gotoAndPlay(1);
         ButtonCanDown = -10;
         lose_count++;
      }
      j++;
   }
   if(ButtonCanDown == 0)
   {
      ButtonCanDown = -1;
      now = new Date();
      startTime = now.getTime();
      delete now;
   }
   if(ButtonCanDown == -1)
   {
      now = new Date();
      nowTime = now.getTime();
      time = int((nowTime - startTime) / 1000);
      delete now;
      if(time >= 5)
      {
         ButtonCanDown = -2;
         do
         {
            random_frame = random(6) + 1;
         }
         while(tvframe[random_frame] == 1);
         
         tvframe[random_frame] = 1;
         if(win_count < 5)
         {
            tv.gotoAndStop(random_frame);
         }
         else if(win_count == 5)
         {
            myWin.start();
            myScore.gotoAndStop(3);
            tv.gotoAndStop(13);
            ButtonCanDown = -10;
            gotoAndStop(8);
         }
      }
   }
   if(lose == 1)
   {
      lose = 2;
      myScore.gotoAndStop(4);
      gotoAndStop(8);
   }
};
