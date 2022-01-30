on(release){
   if(!_parent.myMouseDown)
   {
      _parent.clickup._visible = 0;
      _parent.myClick = myName;
      trace(_parent.myClick);
      _parent.myBtn.start();
      this._xscale = 50;
      this._yscale = 50;
      btn._visible = false;
      _parent.myMouseDown = true;
   }
}
