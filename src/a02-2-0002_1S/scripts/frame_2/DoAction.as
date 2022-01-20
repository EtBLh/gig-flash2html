stop();
var myStart = new Sound();
myStart.attachSound("開始玩");
var mySound = new Sound();
mySound.attachSound("bgmusic05.wav");
mySound.start(2,1000);
var mySound1 = new Sound();
mySound1.attachSound("錯誤");
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
