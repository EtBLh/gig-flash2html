var arry_a1 = new Array();
var arry_a2 = new Array();
arry_a1[1] = a1._x;
arry_a1[2] = a1._y;
arry_a2[1] = a2._x;
arry_a2[2] = a2._y;
var v = (arry_a2[2] - arry_a1[2]) / 5;
a2._visible = false;
a1._visible = false;
var b;
do
{
   b = random(5) + 1;
}
while(b == _parent.testNum);

trace(_parent.testNum);
a0.gotoAndStop(b);
