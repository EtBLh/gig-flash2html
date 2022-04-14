stop();
myStart.onSoundComplete = function()
{
   myOs.start();
};
myOs.onSoundComplete = function()
{
   gotoAndPlay(4);
};
