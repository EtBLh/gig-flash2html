function timer()
{
   if(count <= minCount + 1)
   {
      clearInterval(intervalId);
   }
   count--;
   if(count < 10)
   {
      sTime.text = "0" + count;
   }
   else
   {
      sTime.text = count;
   }
}
var intervalId;
var count = 60;
var minCount = 0;
var duration = 1000;
sTime.text = 60;
intervalId = setInterval(this,"timer",duration);
stop();
