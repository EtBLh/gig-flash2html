stop();
var myBtn = new Sound();
myBtn.attachSound("按鈕");
var myStart = new Sound();
myStart.attachSound("開始玩");
var myTrue = new Sound();
myTrue.attachSound("正確");
var myFalse = new Sound();
myFalse.attachSound("錯誤");
var myWin = new Sound();
myWin.attachSound("win");
var myLose = new Sound();
myLose.attachSound("lose");
var bgmusic = new Sound();
bgmusic.attachSound("bgmusic05.wav");
bgmusic.start(2,100);
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
