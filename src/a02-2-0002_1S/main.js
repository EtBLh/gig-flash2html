let game = () => {
    return{
        start: () => {},
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

    main.init();

})();


let power_up = null;
let power_down = null;
let is_power_down = false;
let power_level = 0;
let power_bar = document.querySelector(".power-measure-bar");
power_bar.style["width"] = "0px";
document.querySelector("#frame").addEventListener("mousedown", () => {
    if (!is_power_down)
        power_up = setInterval(() => {
            if (power_level >= 100) return;
            power_bar.style["width"] = (++power_level)/100*223 + "px"; 
        }, 10)
})
document.querySelector("#frame").addEventListener("mouseup", () => {
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

// let duration_function = (pl) => {
//     if (pl > 90) pl = 190 - pl;
//     return pl/100*2000;
// }

let scale_function = (time_ratio) => {
    time_ratio = time_ratio*1.5>1? 1 : time_ratio*1.5;
    return -0.3*time_ratio+1;
}

//f(x) = -(x - (pl/100-0.186)^(1/2))^2 + pl/100
let bottom_function = (pl, time_ratio) => {
    if (time_ratio <= 0) return 0.186;
    const plr = pl/100;
    const left_shift = Math.sqrt(plr-0.186);
    const x_bound = Math.sqrt(plr) + Math.sqrt(plr+0.186);
    let y_max = plr*0.55;
    let x_max = Math.sqrt(plr-y_max) + Math.sqrt(plr - 0.186);
    let x = time_ratio * x_bound;
    if (x >= x_max) x = x_max;
    return - ((x - left_shift) * (x - left_shift)) + plr;
}

let throw_circle = (pl) => {

    let holding = document.querySelectorAll(".holding");

    if (power_level >= 70 && power_level <= 90){
        let x = holding.style["left"];
        if (x > 215 && x < 292) circle_in(0);
        else if (x > 378 && x < 472) circle_in(1);
        else{
            
        }
    }
    let id = 

    if (pl < 30) pl = 30;
    if (pl > 90) pl = 70 - 100 + pl;
    let duration = 2000;
    let circle = document.querySelectorAll("#c1.circle");

    let timer = 0;
    let animator = setInterval(() => {
        timer += 10;
        if (timer >= duration) {
            clearInterval(animator);
            return;
        }
        circle.forEach(el => {el.style["bottom"] = bottom_function(pl, timer/duration) * 100 + "%"});
        let scale = Math.round(scale_function(timer/duration)*100)/100;
        console.log(scale)
        circle.forEach(el => { el.style.transform = `scale(${scale})`});
    },10);
}

throw_circle(40);

let circle_in = (number) => {
    
}