let game = (() => {

    let element = {
        rods: document.querySelectorAll(".rod"),
        rolls: document.querySelectorAll(".roll .view")
    }

    let pulled = [0,0,0];
    let pulling = [false, false, false];
    const pulledpx = [213,131,73];

    let start = () => {

    }

    return{
        start: start,
        restart: () => {
            
            start();
        },
        init: () => {
            element.rods.forEach((ele,key) => {
                ele.addEventListener("click", e => {
                    if (pulling[key]) return;
                    ele.classList.add("pulled");
                    pulling[key] = true;
                    setTimeout(() => {
                        ele.classList.remove("pulled");
                        pulling[key] = false;
                    },1000);
                    pulled[key] += pulledpx[key];
                    element.rolls[key].style["background-position"] = "0px " + pulled[key]+"px";
                    console.log(element.rolls);
                });
            })
        }
    }
})();

//main
(() => {
    
    game.init();

    cursor_controller.star_on();
    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        cursor_controller.star_off();
        cursor_controller.frame_on(); 
        game.start();
    });

    document.querySelector(".restart").addEventListener("click", game.restart);
})();

