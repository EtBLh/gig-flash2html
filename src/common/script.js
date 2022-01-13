//common sound effects
(() => {
    // document.querySelectorAll(".btn").forEach(elem => {
    //     elem.addEventListener("mouseenter", () => {
    //         let btnhover = new Audio("sounds/95.mp3");
    //         btnhover.play();
    //     })
    // })
    document.querySelector(".leave").addEventListener("mouseenter", () => {
        let leave = new Audio("../common/assets/sounds/leave.mp3");
        leave.play();
    })
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

let play_music = (path) => {
    let temp = new Audio(path);
    temp.play();
}