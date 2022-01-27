var myPlay = 0;
var mySound = new Sound();
mySound.attachSound("bgmusic05.wav");
gotoAndPlay(3);
mySound.start(2,1000);
var myStart = new Sound();
myStart.attachSound("開始玩");
Mouse.hide();
this.onEnterFrame = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
