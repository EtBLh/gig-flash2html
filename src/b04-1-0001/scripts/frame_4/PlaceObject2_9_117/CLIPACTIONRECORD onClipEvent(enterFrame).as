onClipEvent(enterFrame){
   if(_parent.gameStart)
   {
      this._x -= vx;
      this._y -= vy;
   }
   else
   {
      this.removeMovieClip();
   }
   if(this._x < -50 || this._y < -50)
   {
      this.removeMovieClip();
   }
}
