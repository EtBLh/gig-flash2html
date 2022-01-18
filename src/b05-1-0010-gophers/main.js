//IIFE and closures provide immutability while running html game (prevent browser console actions)
(() => {
    var img_list = (() => {
        var temp_list = [];
        for (let i = 1; i <= 45; i++){
            temp_list.push(`url(sprites/DefineSprite_89/${i}.png)`);
        }
        return temp_list;
    })();
})();

//mouse closure
let mouse = (elem, score_counter) => {
    var active = false;
    var click_box = document.createElement("div");
    click_box.classList.add("clickbox");
    elem.appendChild(click_box);
    
    var view = document.createElement("div");
    view.classList.add("view");
    elem.appendChild(view);

    //when hitted
    click_box.addEventListener("mousedown", e=>{
        if (!active) return;
        active = false;
        view.classList.remove("active");
        view.classList.add("hit");
        setTimeout(()=>{
            view.classList.remove("hit");
        },1000);
        score_counter.add();

        // effect animation
        let frame = document.querySelector("#frame");
        let smoke = document.createElement("div");
        smoke.classList.add("smoke-effect");
        smoke.classList.add("element")
        smoke.style["left"] = e.clientX-(window.innerWidth-frame.clientWidth)/2 + "px";
        smoke.style["top"] = e.clientY-(window.innerHeight-frame.clientHeight)/2 + "px";
        frame.appendChild(smoke);
        setTimeout(()=>{
            frame.removeChild(smoke);
        },300);


        let hit = new Audio("sounds/102.mp3");
        hit.play();
    })
    return {
        active: function(){
            active = true;
            view.classList.add("active");
            setTimeout(()=>{
                view.classList.remove("active");
                active = false;
            }, 800)
        }
    }
}


//game closure
let game = () => {

    const game_duration = 60;

    let playing = false;
    let sec = 0;
    let score_view = document.querySelector(".score");
    let time_view = document.querySelector(".time");
    let score_counter = (() => {
        let score = 0;
        return {
            get_score: () => score,
            add: () => {
                score++; console.log(score);
                score_view.innerHTML = score;
            },
            reset: () => {score = 0;score_view.innerHTML = score;}
        }
    })();
    let mouse_list = [];
    let gameloop = null;

    return {
        register_mouse: function(elem){
            let temp = mouse(elem, score_counter);
            mouse_list.push(temp);
        },
        start: function(){
            playing = true;
            score_counter.reset();
            sec = 0;
            counter = 0;
            gameloop = setInterval(()=>{
                sec += 0.1;
                let remaining_time = game_duration-sec;
                time_view.innerHTML=`00:${remaining_time/10<1?"0":""}${Math.floor(remaining_time)}`;
                counter += 0.1;
                if (counter >= 1.7){
                    let rand_count = Math.floor(Math.random()*4+1);
                    for (let i = 0; i < rand_count; i++){
                        let rand_idx = Math.floor(Math.random()*11);
                        mouse_list[rand_idx].active();
                    }
                    counter = 0;
                    let out = new Audio("sounds/95.mp3");
                    out.play();
                }
            },100);
            setTimeout(this.end,game_duration*1000);
            let start = new Audio("sounds/1.mp3");
            start.play();
        },
        end: function(){
            playing = false;
            sec = 0;
            clearInterval(gameloop);
            g_cursor_controller.toggle_star();
            document.querySelector(".end-screen").classList.add("show");
            document.querySelector(".result-view>.number").innerHTML = score_counter.get_score();
            document.querySelector(".time").innerHTML = "00:00";
        }
    }
}

var g_cursor_controller = (()=>{
    let star_cursor = document.querySelector(".star-cursor");
    let hammer_cursor = document.querySelector(".hammer-cursor");
    let hammer_cursor_view = document.querySelector(".hammer-cursor>.view");

    let frame = document.querySelector("#frame");
    frame.addEventListener("mousemove", e => {
        star_cursor.style["left"] = e.clientX-(window.innerWidth-frame.clientWidth)/2 + "px";
        star_cursor.style["top"] = e.clientY-(window.innerHeight-frame.clientHeight)/2 + "px";
        hammer_cursor.style["left"] = e.clientX-(window.innerWidth-frame.clientWidth)/2 + "px";
        hammer_cursor.style["top"] = e.clientY-(window.innerHeight-frame.clientHeight)/2 + "px";
    })

    frame.addEventListener("mousedown", e => {
        hammer_cursor_view.classList.remove("punching");
        hammer_cursor_view.classList.add("punching");
        setTimeout(()=>{
            hammer_cursor_view.classList.remove("punching");
        },300);
    });

    return {
        toggle_star: function(){
            hammer_cursor.style["display"] = "none";
            star_cursor.style["display"] = "";
        },
        toggle_hammer: function(){
            hammer_cursor.style["display"] = "";
            star_cursor.style["display"] = "none";
        }
    }
})();

//main
(() => {
    let main = game();
    let mouse_elem = document.querySelectorAll(".mouse");
    for (melem of mouse_elem){
        main.register_mouse(melem);
    }
    g_cursor_controller.toggle_star();
    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        main.start();
        g_cursor_controller.toggle_hammer();
    });
    document.querySelector(".restart").addEventListener("click",e => {
        document.querySelector(".end-screen").classList.remove("show");
        document.querySelector(".start-screen").style["display"] = "none";
        main.start();
        g_cursor_controller.toggle_hammer();
    });
})();

//other sound effects
(() => {
    document.querySelectorAll(".btn").forEach(elem => {
        elem.addEventListener("mouseenter", () => {
            let btnhover = new Audio("sounds/95.mp3");
            btnhover.play();
        })
    })
})();