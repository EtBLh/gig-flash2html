this.onEnterFrame = function()
{
   S._rotation = S._rotation + 1;
   P._y = Math.sin(S._rotation / 10) * 50 - 100;
};
