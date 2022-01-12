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
var myRollOver = new Sound();
myRollOver.attachSound("E005");
var myStart = new Sound();
myStart.attachSound("開始玩");
mySound.start(2,1000);
stop();
tvframe = new Array(0,0,0,0,0,0);
random_frame = random(6) + 1;
tvframe[random_frame] = 1;
tv.gotoAndStop(13);
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
