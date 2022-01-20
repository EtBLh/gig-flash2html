stop();
var mySound = new Sound();
mySound.attachSound("bgmusic05.wav");
mySound.start(2,100);
var mySound1 = new Sound();
mySound1.attachSound("pick");
var mySound2 = new Sound();
mySound2.attachSound("win");
Mouse.hide();
var mouseListener = new Object();
mouseListener.onMouseMove = function()
{
   star._x = _xmouse;
   star._y = _ymouse;
};
Mouse.addListener(mouseListener);
