onClipEvent(enterFrame){
   if(_parent.count == 0 && _parent.lockone == 0)
   {
      this._x = 130;
      this._y = 90;
   }
   else if(_parent.count == 0 && _parent.lockone == 1)
   {
      this._x = 550;
      this._y = 280;
   }
   else if(_parent.count == 1)
   {
      this._x = 1480;
      this._y = 300;
   }
   if(_parent.count == 7)
   {
      this._x = 250;
      this._y = 420;
   }
   if(_parent.count == 7 && _parent.colorNum > 0 && this._y == 420)
   {
      this._x = 520;
      this._y = 280;
   }
   if(_parent.count == 7 && _parent.colorNum > 0 && _parent.lockone == 1 && this._x == 520)
   {
      this._visible = false;
   }
}
