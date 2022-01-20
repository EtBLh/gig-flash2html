let game = (() => {
    let zebra_x = 0;
    let is_moving = false;
    let is_selected = false;
    let selected_element = null;
    let number = 1;
    let dumped = 0;

    document.querySelectorAll(".clickbox").forEach((el,key) => {
        let own_type = el.classList[0];
        let number = key + 1;
        el.addEventListener("mouseenter", (e) => {
            if(is_selected)
                selected_element.classList.add("putting");
        });
        el.addEventListener("mouseleave", (e) => {
            if(is_selected)
                selected_element.classList.remove("putting");
        });
        el.addEventListener("click", (e) => {
            if(is_selected){
                if (selected_element.classList.contains(own_type)){
                    document.querySelector("#frame").removeChild(selected_element);
                    selected_element = null;
                    is_selected = false;
                    dumped++;
                    add();
                    right(number);
                    show_score();
                } else {
                    wrong(number);
                }
            }
        });
    })

    let show_score = () => {
        let sv = document.querySelector(".score-view");
        let sc = document.querySelector("#score");
        sc.innerHTML = dumped+"point"
        sv.classList.add("show");
        setTimeout(() => {
            sv.classList.remove("show");
        },500)
    }

    let wrong = (number) => {
        let cross = document.querySelector(".x"+number);
        cross.classList.add("show");
        setTimeout(() => {
            cross.classList.remove("show");
        }, 500);
        play_music("sounds/110.mp3");
    }
    
    let right = (number) => {
        let ri = document.querySelector(".r"+number);
        ri.classList.add("show");
        setTimeout(() => {
            ri.classList.remove("show");
        }, 500);
        play_music("sounds/6.mp3");
    }

    let move = () => {
        is_moving = true;
        let zebra = document.querySelector(".zebra");
        let shapes = document.querySelectorAll(".shapes");
        timer = 0;
        const duration = 1000;
        let animator = setInterval(() => {
            if (timer >= duration ){
                clearInterval(animator);
                is_moving = false;
                return;
            } 
            if (zebra_x > 756) zebra_x = 0;
            shapes.forEach(el => {
                let sx = parseInt(el.style.left.replace("px", ""));
                sx += 10/duration * 756/3;
                el.style.left = sx + "px";
            });
            zebra_x += 10/duration * 756/3;
            zebra.style.left = zebra_x-756 + "px";
            timer += 10;
        },10)
    }

    frame.addEventListener("mousemove", e => {
        if (!is_selected) return;
        selected_element.style["left"] = e.clientX-(window.innerWidth-frame.clientWidth)/2  - 40 + "px";
        selected_element.style["top"] = e.clientY-(window.innerHeight-frame.clientHeight)/2 - 40 + "px";
    });

    let add = () => {
        // if (is_moving) return;
        move();
        let frame = document.querySelector("#frame");
        let shape = document.createElement("div");
        shape.classList.add("shapes");
        shape.classList.add("element");
        let prob = Math.random()
        if (prob < 0.33)
            shape.classList.add("triangle");
        else if (prob < 0.66)
            shape.classList.add("circle");
        else
            shape.classList.add("rectangle");
        shape.id = "shape" + number++;
        shape.style["left"] = "-113px";
        frame.appendChild(shape);
        let first_shape = document.getElementById("shape"+(dumped+1));
        first_shape.addEventListener("mouseenter", e => {
            if (is_moving || is_selected) return;
            is_selected = true;
            selected_element = first_shape;
        });
    }

    let game_over = () => {
        document.querySelector(".end-screen").classList.add("show");
        cursor_controller.star_on();
        document.querySelector(".result-view>.number").innerHTML = dumped;
        document.querySelector(".timer").innerHTML = "00:00";
        play_music("sounds/1_win.mp3");
    }

    let start = () => {
        number = 1;
        dumped = 0;
        for (let i = 0; i < 4; i++){
            setTimeout(() => {
                add();
            }, 1200*i);
        }
        let timer = 60;
        let timer_view = document.querySelector(".timer");
        let timer_in = setInterval(() => {
            if (timer <= 0){
                game_over();
                clearInterval(timer_in);
                return;
            }
            timer--;
            timer_view.innerHTML=`00:${timer/10<1?"0":""}${timer}`;
        },1000)

    }

    return {
        start: start,
        restart: () => {
            dumped = 0;
            document.querySelector(".end-screen").classList.remove("show");
            document.querySelectorAll(".shapes").forEach(el => {
                document.getElementById("frame").removeChild(el);
            })
            start();
        }
    }
})();

//main
(() => {

    cursor_controller.star_on();
    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        cursor_controller.star_off();
        cursor_controller.frame_on(); 
        game.start();
    });

    document.querySelector(".restart").addEventListener("click", game.restart);

})();

