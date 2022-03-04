let game = (() => {
    const controllers = [
        cloudy_controller,
        rainy_controller,
        sunny_controller,
        cold_controller,
        middle_controller,
        hot_controller,
    ];
    let remaining = [1,1,1,1,1,1];
    let remainings = 6;
    const selectors_idx = [0,0,0,1,1,1];

    let current = -1;
    let animating = false;

    const temp_selectors = [
        document.querySelector(".select-temperature"),
        document.querySelector(".scold"),
        document.querySelector(".smiddle"),
        document.querySelector(".shot"),
    ]

    const weather_selectors = [
        document.querySelector(".select-weather"),
        document.querySelector(".scloud"),
        document.querySelector(".srainy"),
        document.querySelector(".ssunny"),
    ]

    const selectors = [weather_selectors, temp_selectors];

    temp_selectors[1].addEventListener("mouseenter", () => {
        document.querySelector(".measure").classList.add("low");
    });
    temp_selectors[1].addEventListener("mouseleave", () => {
        document.querySelector(".measure").classList.remove("low");
    });
    temp_selectors[3].addEventListener("mouseenter", () => {
        document.querySelector(".measure").classList.add("high");
    });
    temp_selectors[3].addEventListener("mouseleave", () => {
        document.querySelector(".measure").classList.remove("high");
    });

    let hp = 3;

    let win = () => {
        document.querySelector(".end-screen").classList.add("show");
        document.querySelector(".win").classList.add("show");
        document.querySelector(".lose").classList.remove("show");
        let awin = new Audio("sounds/win.mp3");
        awin.play();
    }

    let lose = () => {
        document.querySelector(".end-screen").classList.add("show");
        document.querySelector(".win").classList.remove("show");
        document.querySelector(".lose").classList.add("show");
        let alose = new Audio("sounds/lose.mp3");
        alose.play();
    }

    let rand_current = () => {
        let next = Math.floor(Math.random() * remainings);
        for (let i = 0; i < 6; i++){
            if (next == 0 && remaining[i]){
                current = i;
                break;
            }
            else if (next != 0 && remaining[i]) next--;
        }
        controllers[current].show();
        let idx = selectors_idx[current];
        selectors[idx][0].classList.add("show");
        selectors[idx == 1? 0: 1][0].classList.remove("show");
    }

    let right = () => {
        let aright = new Audio("sounds/right.mp3");
        aright.play();
        remaining[current] = 0;
        remainings--;
        controllers[current].start();
        document.querySelector(".teacher").classList.add("show");
        document.querySelector(".good").classList.add("show");
        setTimeout(() => {
            controllers[current].stop();
            if (remainings <= 1) {win(); return;}
            else {rand_current()}
            animating = false;
        }, 2000);
        setTimeout(() => {
            document.querySelector(".teacher").classList.remove("show");
            document.querySelector(".good").classList.remove("show");
        },500);
    }

    let hp_views = document.querySelectorAll(".static-teacher");
    let wrong = (idx) => {
        let awrong = new Audio("sounds/wrong.mp3");
        awrong.play();
        hp -= 1;
        if (hp <= 0) {lose(); return;}
        document.querySelector(".teacher").classList.add("show");
        document.querySelector(".wrong").classList.add("show");
        setTimeout(() => {
            document.querySelector(".teacher").classList.remove("show");
            document.querySelector(".wrong").classList.remove("show");
        },500);
        for (let i = 0; i < 3 - hp; i++){
            hp_views[i].style["display"] = "none";
        }
    }

    for (let i =1 ; i < 4; i++){
        temp_selectors[i].addEventListener("click",() => {
            if (animating) return;
            let self = i+2;
            if (self == current){
                animating = true;
                right();
            } else wrong(self);
            let hover = new Audio("sounds/btn_hover.mp3");
            hover.play();
        }),
        weather_selectors[i].addEventListener("click",() => {
            if (animating) return;
            let self = i-1;
            if (self == current){
                animating = true;
                right();
            } else wrong(self);
            let hover = new Audio("sounds/btn_hover.mp3");
            hover.play();
        })
    }

    return {
        start: function(){
            rand_current();
            let astart = new Audio("sounds/start.mp3");
            astart.play();
        },
        restart: function(){
            document.querySelector(".end-screen").classList.remove("show");
            for (let i= 0; i <6; i++){
                remaining[i] =1;
            }
            remainings = 6;
            hp = 3;
            hp_views.forEach(val => val.style["display"] = "block");
            rand_current();
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

