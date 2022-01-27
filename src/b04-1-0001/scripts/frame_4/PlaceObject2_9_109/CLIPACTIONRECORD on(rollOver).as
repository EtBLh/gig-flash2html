on(rollOver){
   if(!boom)
   {
      _parent.masknum = _parent.masknum + 1;
      newName = "mask" + _parent.masknum;
      _parent.mask1.masks.duplicateMovieClip(newName,_parent.masknum);
      eval("_parent.mask1." + newName)._x = this._x + _parent.mask1.masks._width / 2;
      eval("_parent.mask1." + newName)._y = this._y + _parent.mask1.masks._height / 2;
      var i = 0;
      while(i < 10)
      {
         var j = 0;
         while(j < 15)
         {
            var circleName = "_parent.circle" + i + "_" + j;
            if(this.hitTest(eval(circleName)))
            {
               eval(circleName).removeMovieClip();
               _parent.myScore = _parent.myScore + 1;
            }
            j++;
         }
         i++;
      }
      boom = true;
      this.gotoAndPlay("泡泡破掉");
   }
}
