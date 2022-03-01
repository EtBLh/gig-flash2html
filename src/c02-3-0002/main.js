let game = (() => {

    let element = {
        frame: document.querySelector("#frame"),
        hand: document.querySelector(".hand"),
        timer: document.querySelector(".timer")
    };

    let holding = true;
    let current_marble = null;
    let accel_vec = [0,0.05];
    let veloc_vec = [-1.5,0];
    let pos_vec = [0,0];
    let started = false;

    let score = 0;
    let timer = 60;

    let current_ctop = 0;

    let start = () => {
        started = true;
        timer = 60;
        score = 0;
        let time = setInterval(() => {
            if (timer <= 0){
                clearInterval(time);
                document.querySelector(".end-screen").classList.add("show");
                document.querySelector(".result-view>.number").innerHTML = score;
                document.querySelector(".timer").innerHTML = "00:00";
                started = false;
                cursor_controller.star_on();
                cursor_controller.frame_off();
                return;
            }
            timer -= 1;
            element.timer.innerHTML = `00:${timer/10<1?"0":""}${timer}`;
        },1000);
    }

    let next_marble = () => {
        let new_marble = document.createElement("div");
        new_marble.classList.add("element");
        new_marble.classList.add("marble");
        new_marble.classList.add("holding");
        element.frame.appendChild(new_marble);
        current_marble = new_marble;
        holding = true;
        veloc_vec = [-1.5,0];
        let holdingm = document.querySelector(".marble.holding");
        holdingm.style["top"] = current_ctop-(window.innerHeight-frame.clientHeight)/2 + 10 + "px";
    }

    return {
        init : () => {
            element.frame.addEventListener("mousedown", () => {
                console.log("started",started);
                if (!started) return;
                element.hand.classList.add("down");
                if (holding){
                    current_marble  = document.querySelector(".marble.holding");
                    holding = false;
                    current_marble.classList.remove("holding");
                    current_marble.classList.add("thrown");
                    pos_vec[0] = 560;
                    pos_vec[1] = current_marble.getBoundingClientRect().y - element.frame.getBoundingClientRect().y;
                    current_marble.style["left"] = pos_vec[0] + "px";    
                    current_marble.style["top"] = pos_vec[1] + "px";    
                    let marble_mover = setInterval(() => {
                        //discard marble
                        if (pos_vec[0] < -32) {
                            console.log("out of frame, discarded");
                            clearInterval(marble_mover);
                            current_marble.remove();
                            next_marble();
                            return;
                        }
                        if (pos_vec[0]>190 && pos_vec[0] < 350  && pos_vec[1] < 400 && pos_vec[1] > 380 && veloc_vec[1] > 0){
                            clearInterval(marble_mover);
                            current_marble.classList.remove("thrown");
                            current_marble.classList.add("stable");
                            next_marble();
                            score += 1;
                            play_music("sounds/3_正確.mp3");
                            return;
                        }
                        if (pos_vec[1] > 500) {
                            veloc_vec[1] = -veloc_vec[1]*0.85;
                            veloc_vec[0] += 0.1;
                            if (veloc_vec[0] >= 0) {
                                clearInterval(marble_mover);
                                current_marble.classList.remove("thrown");
                                current_marble.classList.add("stop");
                                next_marble();
                                return;
                            }
                        }
                        veloc_vec = vadd(accel_vec, veloc_vec);
                        pos_vec = vadd(veloc_vec, pos_vec);
                        current_marble.style["left"] = pos_vec[0] + "px";    
                        current_marble.style["top"] = pos_vec[1] + "px";
                        
                    },10);
                }
            });
            element.frame.addEventListener("mouseup", () => {
                element.hand.classList.remove("down");
            });
            element.frame.addEventListener("mousemove", e =>{
                e.preventDefault();
                element.hand.style["top"] = e.clientY-(window.innerHeight-frame.clientHeight)/2 - 600*0.02 + "px";
                let holdingm = document.querySelector(".marble.holding");
                if (holdingm)
                    holdingm.style["top"] = e.clientY-(window.innerHeight-frame.clientHeight)/2 + 10 + "px";
                current_ctop = e.clientY;
            });
        },
        start: start,
        restart: () => {
            document.querySelector(".end-screen").classList.remove("show");
            cursor_controller.star_off();
            document.querySelectorAll(".marble").forEach(ele => {
                ele.remove();
            });
            next_marble();
            start();
        }
    }
})();

//main
(() => {

    cursor_controller.star_on();

    game.init();
    document.querySelector(".start-btn").addEventListener("click",e => {
        cursor_controller.star_off();
        document.querySelector(".start-screen").style["display"] = "none";
        game.start();
    });
    document.querySelector(".restart").addEventListener("click", game.restart);

})();