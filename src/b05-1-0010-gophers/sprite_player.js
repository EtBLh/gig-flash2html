let animation = (view, img_list, interval, times, callback) => {
    var animator = null;
    var playing = false;
    return {
        interupt: function(smooth){
            if (!playing) return;
            clearInterval(animator);
            if (smooth){
                view.style["background-image"] = "";
                bottom.style["background-image"] = "";
            }
            if (callback != null)
                callback(); 
        },
        play: function(){
            if (playing){
                clearInterval(animator);
            };
            playing = true;
            var timer = 0;
            view.style["background-image"] = img_list[timer];
            animator = window.setInterval(()=>{
                if (++timer > img_list.length) timer = 0;
                view.style["background-image"] = img_list[timer];
            }, interval);
            if (times != -1)
                window.setTimeout(()=>{
                    playing = false;
                    clearInterval(animator);
                    view.style["background-image"] = "";
                    if (callback != null)
                        callback();
                }, img_list.length*interval*times);
        }
    }
}