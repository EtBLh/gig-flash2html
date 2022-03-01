var mySound = new Sound();
mySound.attachSound("bgmusic05.wav");
var myStart = new Sound();
myStart.attachSound("開始玩");
var myWin = new Sound();
myWin.attachSound("bababa");
var myRollOver = new Sound();
myRollOver.attachSound("按鈕.WAV");
var myTrue = new Sound();
myTrue.attachSound("正確");
var myWin = new Sound();
myWin.attachSound("win");
mySound.start(2,50);
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
stop();
