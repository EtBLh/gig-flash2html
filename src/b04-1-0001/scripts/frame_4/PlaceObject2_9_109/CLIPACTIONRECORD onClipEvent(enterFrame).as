onClipEvent(enterFrame){
   if(_parent.gameStart)
   {
      this._x += vx;
      this._y -= vy;
   }
   else
   {
      this.removeMovieClip();
   }
   if(this._x > 850 || this._y < -50)
   {
      this.removeMovieClip();
   }
}
