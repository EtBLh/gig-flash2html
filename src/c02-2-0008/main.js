//main
(() => {

    cursor_controller.star_on();
    let playing = false;
    let finished = 0;

    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        cursor_controller.star_off();
        cursor_controller.frame_on();
        playing = true;
        timer.start();
    });

    document.querySelector(".restart").addEventListener("click", e => {
        finished = 0;
        hide_element(document.querySelector(".end-screen"));
        timer.start();
    });

    timer.set_initial(150);
    timer.set_element(document.querySelector(".comtimer"));
    timer.set_cb(() => {
        game_over();
        timer.stop();
    });

    let game_over = () => {
        show_element(document.querySelector(".end-screen"));
    }

    const vector_center = [485.5, 350];
    const get_angle = (vec) => {
        let coor = [vec[0] - vector_center[0], vec[1] - vector_center[1]];
        return ((Math.atan2(coor[0],coor[1]) * (-180 / Math.PI))+180) % 360;
    }

    let target = [0,0];
    let target_deg = [0,0];
    let correct = [false, false];

    let hide_colon = false;
    let target_view = document.querySelector(".target");
    setInterval(() => {
        target_view.innerHTML = `${(target[0] < 10?"0":"")}${target[0]}&nbsp;${hide_colon?"&nbsp;":":"}&nbsp;${target[1]<10?"0":""}${target[1]}`;
        hide_colon = !hide_colon;
    },1000);

    const next = () => {
        target[0] = Math.floor(Math.random()*24);
        target[1] = Math.floor(Math.random()*12)*5;
        target_deg[0] = (target[0]%12)*360/12 + target[1]/60*360/12;
        target_deg[1] = target[1]/60*360;
        console.log(target_deg, target);
    }

    const animate = () => {
        let head = document.querySelector(".clockhead");
        head.classList.add("ringing");
        setTimeout(() => {
            head.classList.remove("ringing"); 
        }, 1700);
        let cake = document.querySelector(".cake");
        cake.classList.add("bouncing");
        setTimeout(() => {
            cake.classList.remove("bouncing");
        },2000);
        play_music("sounds/104.mp3");
        show_element(document.querySelector(".teacher"),1000);
        show_element(document.querySelector(".good"),1000);
    }

    let drag_elem = null;

    let element = {
        hands: document.querySelectorAll(".hand")
    }
    let holding = -1;

    let user_control_start_factory = (val, key) => {
        return e =>{
            holding = key;

            let left = e.clientX ||  e.targetTouches[0].pageX;
            let top = e.clientY ||  e.targetTouches[0].pageY;

            let rect = e.currentTarget.getBoundingClientRect();
            rex = left - rect.left;
            rey = top - rect.top;
            drag_elem = val;
        }
    }

    element.hands.forEach((val, key) => {
        val.addEventListener("mousedown", user_control_start_factory(val, key));
        val.addEventListener("touchstart", user_control_start_factory(val, key));
    });

    let frame = document.querySelector("#frame");

    let user_control_move = e => {
        e.preventDefault();
        if (drag_elem === null) return;

        let left = e.clientX ||  e.targetTouches[0].pageX;
        let top = e.clientY ||  e.targetTouches[0].pageY;

        let rect = e.currentTarget.getBoundingClientRect();
        let x = left - rect.left;
        let y = top - rect.top;
        let angle = get_angle([x,y]);
        drag_elem.style["transform"] = `rotate(${angle}deg)`;
        if (abs(target_deg[holding] - angle) <= 50){ 
            correct[holding] = true;
        }
        else {correct[holding] = false;}
    };

    frame.addEventListener("mousemove", user_control_move);
    frame.addEventListener("touchmove", user_control_move);

    let user_control_end = e => {
        if (drag_elem == null) return;

        if (correct[holding]){
            drag_elem.style["transform"] = `rotate(${target_deg[holding]}deg)`;
            play_music("sounds/3_正確.mp3");  
        }

        drag_elem = null;
        holding = -1;

        if (correct[0] && correct[1]){
            correct[0] = false;
            correct[1] = false;
            animate();
            next();
            finished++;
            if (finished >= 5) {
                game_over();
            }
        }
    }

    frame.addEventListener("mouseup", user_control_end);
    frame.addEventListener("touchend", user_control_end);

    next();

})();