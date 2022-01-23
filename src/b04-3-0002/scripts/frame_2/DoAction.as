stop();
var my_sound1 = new Sound();
my_sound1.attachSound("bgmusic05.wav");
var my_sound2 = new Sound();
my_sound2.attachSound("按鈕.WAV");
var my_sound3 = new Sound();
my_sound3.attachSound("pick");
var my_sound4 = new Sound();
my_sound4.attachSound("正確");
var my_sound10 = new Sound();
my_sound10.attachSound("開始玩");
my_sound1.start(2,100);
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
stop();
