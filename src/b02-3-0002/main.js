let game = (() => {

    let element = {
        rods: document.querySelectorAll(".rod"),
        rolls: document.querySelectorAll(".roll .view"),
        indicator: document.querySelector(".indicator"),
        right: document.querySelector(".right"),
        timer: document.query
    }

    let pulled = [0,0,0];
    let pullpx = [0,0,0];
    let pulling = [false, false, false];
    const pullheight = [213,130,73];
    const target = ['r','e','m','p','c'];
    let current_idx = 0;
    const order = [
        ['e','p','m','c','r'],
        ['r','c','p','m','e'],
        ['c','r','p','m','e']
    ];

    let countdown;
    let timer;

    let start = () => {
        countdown = setInterval(() => {
            timer--;
            
            element.timer.innerHTML=`00:${timer/10<1?"0":""}${timer}`;
        },1000);
    }

    let win = () => {
        clearInterval(countdown);
        
    }

    return{
        start: start,
        restart: () => {
            start();
        },
        init: () => {
            element.rods.forEach((ele,key) => {
                ele.addEventListener("click", e => {
                    if (pulling[key]) return;
                    ele.classList.add("pulled");
                    pulling[key] = true;
                    setTimeout(() => {
                        ele.classList.remove("pulled");
                        pulling[key] = false;
                    },600);
                    let currentpx = pullpx[key];
                    pullpx[key] += pullheight[key];
                    pulled[key]++;
                    let steps = pullheight[key]/30;
                    let frame = 0;
                    let animator = setInterval(() => {
                        if (frame >= 30){
                            clearInterval(animator);
                            return;
                        }
                        currentpx+=steps;
                        element.rolls[key].style["background-position"] = "0px " + currentpx+"px";
                        frame++;
                    },300/30);

                    if (target[current_idx] == order[0][pulled[0]%5] &&
                        target[current_idx] == order[1][pulled[1]%5] &&
                        target[current_idx] == order[2][pulled[2]%5]){
                            current_idx++;
                            element.indicator.className = "element indicator "+target[current_idx];
                            element.right.classList.add("show");
                            setTimeout(() => {
                                element.right.classList.remove("show");
                            },500);
                            play_music("sounds/1_正確.mp3");
                            if (current_idx >= 5){
                                win();
                                return;
                            }
                    }
                    console.log(order[0][pulled[0]%5],order[1][pulled[1]%5],order[2][pulled[2]%5])
                    
                });
            })
        }
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

