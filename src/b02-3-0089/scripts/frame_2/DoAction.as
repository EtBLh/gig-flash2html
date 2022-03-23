var maxCount = 7;
var count = 0;
var myStart = new Sound();
myStart.attachSound("開始玩");
var mySound = new Sound();
mySound.attachSound("bgmusic05.wav");
mySound.start(2,100);
var myRollOver = new Sound();
myRollOver.attachSound("按鈕.WAV");
var myRight = new Sound();
myRight.attachSound("pick");
stop();
var myOs = new Sound();
myOs.attachSound("b02-3-0087至 b02-3-0091.wav");
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
