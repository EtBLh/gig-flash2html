gotoAndPlay(1);
_parent.shotlock = 3;
if(_parent.life >= 5)
{
   _parent.gameover = true;
   this.gotoAndPlay(62);
}
_parent.life = _parent.life + 1;
newName = "_parent.life" + _parent.life;
eval(newName)._visible = false;
