let game = (() => {

    let start = () => {

    }

    return{
        start: start,
        restart: () => {
            
            start();
        },
        init: () => {
           
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

