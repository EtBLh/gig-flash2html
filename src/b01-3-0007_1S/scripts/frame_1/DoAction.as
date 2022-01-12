this.onEnterFrame = function()
{
   var _loc2_ = Math.round(this.getBytesLoaded() / this.getBytesTotal() * 100);
   P._x = 260 + _loc2_ * 3.1;
   L._xscale = _loc2_;
   if(_loc2_ >= 100)
   {
      gotoAndStop(2);
      delete this.onEnterFrame;
   }
};
stop();
Stage.showMenu = false;
loadMovieNum("topdesignlogo.swf",5,"GET");
