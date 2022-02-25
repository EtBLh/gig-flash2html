stop();
var testNum = 0;
var mySound = new Sound();
mySound.attachSound("bgmusic05.wav");
mySound.start(2,100);
var mySound1 = new Sound();
mySound1.attachSound("按鈕.WAV");
var mySound2 = new Sound();
mySound2.attachSound("pick");
testNum = random(5) + 1;
test.gotoAndStop(testNum);
var my_ba1 = 0;
var my_ba2 = 0;
var my_ba3 = 0;
Mouse.hide();
test.light.stop();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
