//common sound effects
(() => {
    document.querySelector(".leave").addEventListener("mouseenter", () => {
        let leave = new Audio("../common/assets/sounds/leave.mp3");
        leave.play();
    });

    if (typeof nobgm !== 'undefined') return;
    let bgm = new Audio("../common/assets/sounds/bgm.mp3");
    bgm.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
    //chrome doesnt allow autoplay
    let autoplay = function(e){
        bgm.play();
        document.removeEventListener("mousedown",autoplay);
    }
    document.addEventListener("mousedown",autoplay);
})();

var cursor_controller = (()=>{
    let star_cursor = document.querySelector(".star-cursor");

    let frame = document.querySelector("#frame");
    frame.addEventListener("mousemove", e => {
        star_cursor.style["left"] = e.clientX-(window.innerWidth-frame.clientWidth)/2 + "px";
        star_cursor.style["top"] = e.clientY-(window.innerHeight-frame.clientHeight)/2 + "px";
    })

    return {
        frame_on: function(){
            frame.style["cursor"] = "default";
        },
        frame_off: function(){
            frame.style["cursor"] = "none";
        },
        star_on: function(){
            star_cursor.style["display"] = "";
        },
        star_off: function(){
            star_cursor.style["display"] = "none";
        },
    }
})();

let play_music = (path, cb) => {
    let temp = new Audio(path);
    if (typeof cb !== "undefined"){
        temp.addEventListener('ended', cb);
    }
    temp.play();
}

let stop_audio = (audio) => {
    audio.pause();
    audio.currentTime = 0;
}

let show_element = (el, duration, cb) => {
    el.classList.add("show");
    if(typeof duration !== "undefined")
        setTimeout(() => {
            el.classList.remove("show");
        }, duration);
    if(typeof cb !== "undefined"){
        setTimeout(cb, duration);
    }
}

let hide_element = (el) => {
    el.classList.remove("show");
}

let hide_for_interval = (el, interval) => {
    let temp = el.style["display"];
    el.style["display"] = "none";
    setTimeout(() => {
        el.style["display"] = temp;
    }, interval);
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

//vector addition
function vadd(a,b){
    let aa, ab, ba, bb;
    [aa, ab] = a;
    [ba, bb] = b;
    return [aa + ba, ab + bb];
}

function abs(a){
    if (a < 0) a = -a;
    return a;
}

let timer = (() => {

    let initial = 60;
    let current = 0;
    let element = null;
    let core = null;
    let cb = () => {};

    return {
        set_initial: (val) => {
            initial = val;
        },
        set_element: (ele) => {
            element = ele;
        },
        set_cb: (_cb) => {
            cb = _cb;
        },
        start: () => {
            current = initial;
            core = setInterval(() => {
                if (current <= 0){
                    stop();
                    cb();
                    return;
                }
                let min = Math.floor(current/60);
                let sec = current % 60;
                element.innerHTML = `${min/10<1?"0":""}${min}:${sec/10<1?"0":""}${sec}`;
                current--;
            },1000);
        },
        stop: () => {
            if (core != null)
                clearInterval(core);
            core = null;
            current = initial;
        }
    }
})();