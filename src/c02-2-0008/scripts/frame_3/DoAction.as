Mouse.show();
do
{
   randomMinute = random(12);
   randomHour = random(24);
   minuteRandom = randomMinute * 30;
   if(randomHour > 12)
   {
      hourRandom = (randomHour - 12) * 30 + minuteRandom / 12;
   }
   else
   {
      hourRandom = randomHour * 30 + minuteRandom / 12;
   }
}
while(minuteRandom == minute_hand._rotation || hourRandom == hour_hand._rotation);

if(randomMinute == 0)
{
   minuteQ.text = "00";
}
else if(randomMinute == 1)
{
   minuteQ.text = "05";
}
else
{
   minuteQ.text = randomMinute * 5;
}
if(randomHour < 10)
{
   hourQ.text = "0" + randomHour;
}
else
{
   hourQ.text = randomHour;
}
minuteClick = true;
hourClick = true;
myMode = 0;
handDown = 0;
click1._visible = true;
