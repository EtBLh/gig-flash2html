stop();
var myAnswer = new Array(3,2,3);
var myNowQuestion = 0;
var myBtnDown = false;
var myTrueAnswer = false;
var win_count = 0;
var mySound = new Sound();
mySound.attachSound("bgmusic05.wav");
var myWin = new Sound();
myWin.attachSound("win");
var myLose = new Sound();
myLose.attachSound("lose");
var myTrue = new Sound();
myTrue.attachSound("pick");
var myFalse = new Sound();
myFalse.attachSound("錯誤");
var myStart = new Sound();
myStart.attachSound("開始玩");
var myRollOver = new Sound();
myRollOver.attachSound("按鈕.WAV");
mySound.start(2,1000);
var myOs = new Sound();
myOs.attachSound("b01-2-0003-7Q.wav");
var myOs1 = new Sound();
myOs1.attachSound("b01-2-0003q1.wav");
var myOs2 = new Sound();
myOs2.attachSound("b01-2-0003q2.wav");
var myOs3 = new Sound();
myOs3.attachSound("b01-2-0003q3.wav");
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
stop();
