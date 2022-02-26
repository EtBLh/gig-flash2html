//main
(() => {

    cursor_controller.star_on();

    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        cursor_controller.star_off();
        cursor_controller.frame_on();
    });

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
    element.hands.forEach((val, key) => {
        val.addEventListener("mousedown", e => {
            holding = key;
            let rect = e.currentTarget.getBoundingClientRect();
            rex = e.clientX - rect.left;
            rey = e.clientY - rect.top;
            drag_elem = val;
        });
    });

    let frame = document.querySelector("#frame");

    frame.addEventListener("mousemove", e => {
        e.preventDefault();
        if (drag_elem === null) return;
        let rect = e.currentTarget.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let angle = get_angle([x,y]);
        drag_elem.style["transform"] = `rotate(${angle}deg)`;
        if (abs(target_deg[holding] - angle) <= 30){ 
            correct[holding] = true;
        }
        else {correct[holding] = false;}
    });

    frame.addEventListener("mouseup",e => {
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
        }
    });

    next();

})();