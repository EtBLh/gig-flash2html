let game = (() => {
    let target = 0;
    let remain_target = -1;
    let arr = [];
    let arr_view = document.querySelectorAll(".item");
    arr_view.forEach((el, key) => {
        el.addEventListener("click", () => {
            click(key);
        });
        el.addEventListener("hover", () => {
            play_music("sounds/btnhover.mp3");
        });
    });
    let timer = null;
    let timer_val = 60;

    let click = (idx) => {
        if (arr[idx] == -1) return;
        else if (arr[idx] == target){
            arr[idx] = -1;
            play_music("sounds/right.mp3");
            arr_view[idx].classList.add("confirm");
            remain_target--;
            if (remain_target <= 0) win();
        } else {
            play_music("sounds/wrong.mp3");
            let teacher = document.querySelector(".teacher");
            let wrong = document.querySelector(".wrong");
            teacher.classList.add("show");
            wrong.classList.add("show");
            setTimeout(() => {
                teacher.classList.remove("show");
                wrong.classList.remove("show");
            }, 500);
        }
    }

    let win = () => {
        play_music("sounds/win.mp3");
        clearInterval(timer);
        document.querySelector(".end-screen").classList.add("show");
        document.querySelector(".win").classList.add("show");
        document.querySelector(".lose").classList.remove("show");
    }

    let lose = () => {
        play_music("sounds/lose.mp3");
        clearInterval(timer);
        document.querySelector(".end-screen").classList.add("show");
        document.querySelector(".lose").classList.add("show");
        document.querySelector(".win").classList.remove("show");
    }

    let start = function(){
        play_music("sounds/start_voice.mp3");
        timer = setInterval(() => {
            timer_val--;
            if (timer_val <= 0){
                lose();
            } else {
                document.querySelector(".timer").innerHTML = "00 : " + (timer_val/10 > 1? "" : "0") + timer_val;
            }
        },1000);
    }

    let init = function(){
        arr = [];
        for (let i = 0; i < 32; i++){
            arr.push(0);
        }
        target = Math.floor(Math.random()*5)+1;
        remain_target = Math.floor(Math.random()*5)+6;
        for (let temp_remain = remain_target; temp_remain > 0; temp_remain--){
            let idx = Math.floor(Math.random()*(32-temp_remain));
            while (arr[idx] != 0){
                idx = Math.floor(Math.random()*(32-temp_remain)); 
            }
            arr[idx] = target;
        }
        let temp_idx_arr = [0,1,2,3,4,5];
        temp_idx_arr.splice(target,1);
        temp_idx_arr.splice(0,1);
        for (let i = 0; i < 32; i++){
            if (arr[i] == 0)  arr[i] = temp_idx_arr[Math.floor(Math.random()*4)];
            arr_view[i].classList.add("p"+arr[i]);
        }
        document.querySelector(".target-item").classList.add("p" + target);
    }

    return {
        start: start,
        restart: function(){
            arr_view.forEach(el => {
                el.classList.remove("confirm");
                el.classList.remove("p1");
                el.classList.remove("p2");
                el.classList.remove("p3");
                el.classList.remove("p4");
                el.classList.remove("p5");
            });
            document.querySelector(".target-item").classList.remove("p" + target);
            timer_val = 60;
            init();
            start();
            document.querySelector(".end-screen").classList.remove("show");            
        },
        init: init
    }
})();

//main
(() => {

    game.init();
    
    cursor_controller.star_on();
    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        cursor_controller.star_off();
        cursor_controller.frame_on(); 
        game.start();
    });

    document.querySelector(".restart").addEventListener("click", game.restart);

})();

