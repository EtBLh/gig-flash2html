let game = () => {
    let playing = false;
    let power_up = null;
    let power_down = null;
    let is_power_down = false;
    let power_level = 0;
    let power_bar = document.querySelector(".power-measure-bar");
    power_bar.style["width"] = "0px";
    document.querySelector("#frame").addEventListener("mousedown", () => {
        if (!playing) return;
        clearInterval(power_up);
        if (is_power_down) return;
        power_up = setInterval(() => {
            if (power_level >= 100) return;
            power_bar.style["width"] = (++power_level)/100*223 + "px"; 
        }, 10)
    })
    document.querySelector("#frame").addEventListener("mouseup", () => {
        if (!playing) return;
        clearInterval(power_up);
        is_power_down = true;
        power_down = setInterval(() => {
            if (power_level <= 0) {
                is_power_down = false;
                clearInterval(power_down);
                return;
            }
            power_level -= 2;
            power_bar.style["width"] = (power_level)/100*223 + "px"; 
        }, 0.1)
        throw_circle(power_level);
    });
    
    let scale_function = (time_ratio, pl) => {
        pl = pl - 50
        time_ratio = time_ratio*1.5>1? 1 : time_ratio*1.5;
        const slope = -0.3-(pl/100*0.4);
        return slope*time_ratio+1;
    }
    
    //f(x) = -(x - (pl/100-0.186)^(1/2))^2 + pl/100 + y_offset
    let bottom_function = (pl, time_ratio) => {
        const y_offset = 0.05;
        if (time_ratio <= 0) return 0.186;
        const plr = pl/100;
        const left_shift = Math.sqrt(plr-0.186);
        const x_bound = Math.sqrt(plr) + Math.sqrt(plr+0.186);
        let y_max = plr*0.55;
        let x_max = Math.sqrt(plr-y_max) + Math.sqrt(plr - 0.186);
        let x = time_ratio * x_bound;
        if (x >= x_max) x = x_max;
        return - ((x - left_shift) * (x - left_shift)) + plr + y_offset;
    }
    
    let id = 1;
    
    let add_circle = () => {
        if (!playing) return;
        document.querySelector(".hand").classList.remove("open");
        let frame = document.querySelector("#frame");
        let new_circle = document.createElement("div");
        new_circle.classList.add("circle");
        new_circle.classList.add("element");
        new_circle.classList.add("holding");
        new_circle.id = "c" + ++id;
        let prob = Math.floor(Math.random()*6)+1;
        let cn = "cs" + prob;
        new_circle.classList.add(cn);

        frame.appendChild(new_circle);
        
        let hand = document.querySelector(".hand");
        let x = hand.style["left"];
        new_circle.style["left"] = x;
    }

    let hp = 3;
    
    let loseHP = () =>{
        hp--;
        for (let i = 3; i > hp; i--){
            document.querySelector("#t"+i).style["display"] = "none";
        }
        play_music("sounds/wrong.mp3");
        if (hp <= 0) game_over();
    }
    
    let game_over = () => {
        let endscreen = document.querySelector(".end-screen");
        endscreen.classList.add("show");
        document.querySelector(".result-view>.number").innerHTML = score;
        clearInterval(game_time_loop);
        playing = false;
    }
    
    let score = 0;

    let add_score = () => {
        score++;
        play_music("sounds/5.mp3");
        document.querySelector(".score-view").classList.add("show");
        setTimeout(() => {
            document.querySelector(".score-view").classList.remove("show");
        },500);
    }
    
    let throw_circle = (pl) => {
    
        if (!playing) return;
        document.querySelector(".hand").classList.add("open");
        let holding = document.querySelector(".holding");
        if (holding == null) return;
        holding.classList.remove("holding");
    
    
        if (pl < 30) pl = 30;
        if (pl > 90) pl = 70 - 100 + pl;
        let duration = 2000;
        let circle = document.querySelectorAll(`#c${id}.circle`);
    
        let x = parseInt(holding.style["left"].replace("px",""));
        let left = x > 170 && x < 255;
        let right = x > 360 && x < 440;
    
        if (power_level >= 70 && power_level <= 90){
    
            if (left||right){
                setTimeout(() => {
                    circle_in();
                    add_score();
                    document.querySelector("#score").innerHTML = score+"point";
                    circle = document.querySelectorAll(`#c${id}.circle`);
                },1000)
            }

        }
        if (!(power_level >= 70 && power_level <= 90) || ((!left) && (!right))) {
            setTimeout(() => loseHP(), 500);
        }
    
        if ((left||right) && !(power_level>= 70 && power_level <= 90)){
            power_level = 70 - 10*power_level/100
        }
    
    
        let timer = 0;
        let animator = setInterval(() => {
            timer += 10;
            if (timer >= duration) {
                clearInterval(animator);
                add_circle();
                return;
            }
            circle.forEach(el => {el.style["bottom"] = bottom_function(pl, timer/duration) * 100 + "%"});
            let scale = Math.round(scale_function(timer/duration, pl)*100)/100;
            console.log(scale);
            circle.forEach(el => { el.style.transform = `scale(${scale})`});
        },10);
    }
    
    let circle_in = () => {
        if (!playing) return;
        console.log('in');
        let circle = document.querySelector(`#c${id}.circle`);
        let cl = circle.classList;
        let x = circle.style["left"];
        let in_circle = document.querySelector('.in-circles');
        let ha_circle = document.querySelector('.half-circles');
    
        let i_circle = document.createElement("div");
        i_circle.classList = cl;
        i_circle.id = "c" + id;
        i_circle.style["left"] = x;
        in_circle.appendChild(i_circle);
        
        let h_circle = document.createElement("div");
        h_circle.classList = cl;
        h_circle.id = "c" + id;
        h_circle.style["left"] = x;
        ha_circle.appendChild(h_circle);
        circle.remove();
    }    

    let game_time = 60;
    let game_time_loop = null;

    let start =  () => {
        playing = true;
        game_time_loop = setInterval(() => {
            game_time--;
            if (game_time <= 0){
                clearInterval(game_time_loop);
                playing = false;
                game_over();
                return;
            }
            document.querySelector(".counter").innerHTML = `00:${game_time/10 >= 1? "":"0"}${game_time}`
        }, 1000);
    };

    return{
        start: start,
        init: () => {
            let frame = document.querySelector("#frame");
            let hand = document.querySelector(".hand");
            frame.addEventListener("mousemove", e => {
                hand.style["left"] = e.clientX-(window.innerWidth-frame.clientWidth)/2 - 800*0.075 + "px";
                let current = document.querySelector(".holding");
                if (current != null){
                    current.style["left"] = e.clientX-(window.innerWidth-frame.clientWidth)/2 - 800*0.075 + "px"; 
                }
            })
        },
        restart: () => {
            game_time = 60;
            score = 0;
            hp = 3;
            document.querySelectorAll(".circle").forEach(el => el.remove());
            document.querySelectorAll(".static-teacher").forEach(el => el.style["display"] = "block");
            start();
            add_circle();
        }
    }
}
//main
(() => {
    let main = game();

    cursor_controller.star_on();

    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        main.start();
        cursor_controller.star_off();
        cursor_controller.frame_on(); 
    });
    
    document.querySelector(".restart").addEventListener("click",e => {
        document.querySelector(".end-screen").classList.remove("show");
        document.querySelector(".start-screen").style["display"] = "none";
        main.restart();
    });

    main.init();

})();