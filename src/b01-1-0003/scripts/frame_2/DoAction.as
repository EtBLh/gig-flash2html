var allQuestion1 = new Array("黃色","藍色","紅色","綠色","橘色","白色","黑色");
var allQuestion2 = new Array("圓形","橢圓形","長方形","正方形","三角形","心形","星形");
var myWay = 5;
var myPoint = 0;
mySound = new Sound();
mySound.attachSound("bgmusic05.wav");
myStart = new Sound();
myStart.attachSound("開始玩");
myBtn = new Sound();
myBtn.attachSound("按鈕.WAV");
mySound.start(2,100);
var myGoto = false;
i = 0;
while(i < 3)
{
   eval("light" + i).gotoAndStop("未選");
   eval("cross" + i).gotoAndStop(1);
   i++;
}
this.onEnterFrame = function()
{
   if(myGoto)
   {
      gotoAndStop(3);
      myGoto = false;
   }
};
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
