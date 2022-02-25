stop();
var mySound = new Sound();
mySound.attachSound("bgmusic05.wav");
var myTrue = new Sound();
myTrue.attachSound("pick");
var myFalse = new Sound();
myFalse.attachSound("錯誤");
var myWin = new Sound();
myWin.attachSound("win");
var myLose = new Sound();
myLose.attachSound("lose");
var myStart = new Sound();
myStart.attachSound("開始玩");
var myCheck = new Sound();
myCheck.attachSound("正確");
var myRollOver = new Sound();
myRollOver.attachSound("按鈕.WAV");
mySound.start(2,100);
delete this.onEnterFrame;
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
