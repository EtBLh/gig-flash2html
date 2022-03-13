let game = (() => {

    let element = {
        canvas: document.getElementById('mask-board'),
        bubble_container: document.querySelector('.bubble-container'),
        cards: document.querySelectorAll('.card')
    }
    let ctx = element.canvas.getContext('2d');
    let shape = new Image();
    shape.src = "shapes/95.svg";
    let bubble_generatator = null;

    const MASK_WIDTH = 115.7;
    const MASK_HEIGHT = 143.5;

    let canvas_pos_x = 0;
    let canvas_pos_y = 0;

    let blowed = 0;
    let cleared = false;

    let bg_idx = 0;

    let clear = () => {
        cleared = true;
        let width = element.canvas.width;
        let height = element.canvas.height;
        ctx.clearRect(0,0,width, height);
        if (bg_idx == 0){
            show_element(document.querySelector("#fireworks"));
        }
    }

    let reset = () => {
        let width = element.canvas.width;
        let height = element.canvas.height;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = "#ff66ff";
        ctx.fillRect(0,0,width, height);
        cleared = false;
        blowed = 0;
        element.cards.forEach(val => {
            hide_element(val);
        });
        show_element(element.cards[bg_idx]);
        hide_element(document.querySelector("#fireworks"));
    }

    let generate_bubble = (direction) => {
        let bubble = document.createElement("div");
        bubble.classList.add("element");
        bubble.classList.add("bubble");
        element.bubble_container.appendChild(bubble);

        let pos = direction ? {x: 0, y: 600} : {x: 800, y: 600};
        let angle = Math.random()*Math.PI/2 * 70/90 + Math.PI/2*10/90;
        let speed = Math.random()*1.5+1;
        let move_vector = {
            x: Math.cos(angle) * speed * (direction?1:-1),
            y: -Math.sin(angle) * speed
        }
        bubble.style["left"] = pos.x+"px";
        bubble.style["top"] = pos.y+"px";
        let move = setInterval(() => {
            if (cleared) {
                clearInterval(move);
                bubble.remove();
                return;
            }
            pos.x+=move_vector.x;
            pos.y+=move_vector.y;
            bubble.style["left"] = pos.x+"px";
            bubble.style["top"] = pos.y+"px";
            if (pos.x > 800 || pos.y > 600 || pos.x < -50 || pos.y < -50){
                clearInterval(move);
                bubble.remove();
            }
        }, 5);
        bubble.addEventListener('mouseenter', function (e){
            let x = e.clientX - canvas_pos_x;
            let y = e.clientY - canvas_pos_y;
            ctx.globalCompositeOperation = 'destination-out';    
            ctx.drawImage(shape,x - MASK_WIDTH/2, y - MASK_HEIGHT/2, MASK_WIDTH, MASK_HEIGHT);
            clearInterval(move);
            if (!(pos.x > 800 || pos.y > 600 || pos.x < -50 || pos.y < -50)) blowed++;
            console.log(blowed);
            bubble.remove();
            if (blowed >= 50) clear();
        });
    }

    let start = () => {
        let rect = element.canvas.getBoundingClientRect();
        canvas_pos_x = rect.left;
        canvas_pos_y = rect.top;
        window.addEventListener('resize', function(e){
            canvas_pos_x = rect.left;
            canvas_pos_y = rect.top;
        })
        element.canvas.addEventListener('click', function(e){
            console.log("triggered")
            if (!cleared) return;
            bg_idx = (bg_idx+1)%3;
            reset();
        });
        bubble_generatator = setInterval(() => {
            if (cleared) return;
            generate_bubble(false);
            generate_bubble(true);
        }, 500);
        timer.start();
    }

    document.querySelector(".restart").addEventListener("click", e => {
        finished = 0;
        hide_element(document.querySelector(".end-screen"));
        timer.start();
    });

    timer.set_initial(150);
    timer.set_element(document.querySelector(".comtimer"));
    timer.set_cb(() => {
        show_element(document.querySelector(".end-screen"));
        timer.stop();
    });

    return {
        start: start,
        init: reset
    }
})();

//main
(() => {

    game.init();
    cursor_controller.star_on();
    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        game.start();
        play_music("sounds/2_開始玩.mp3");
    });

})();

