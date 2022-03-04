let game = () => {
    let target = 0;
    let animating = false;
    let number_view = document.querySelector(".number-viewer");
    let teacher = document.querySelector(".teacher");
    let good = document.querySelector(".good");
    let wrong = document.querySelector(".wrong");
    let rs = document.querySelector(".result-star");
    let wrong_s = new Audio("sounds/wrong.mp3");
    let right_s = new Audio("sounds/right.mp3");
    let snakes = [];
    for (let i = 1; i <= 10; i++){
        let snake = document.querySelector(`#sn${i}`);
        snakes.push(snake);
    };

    for (let i = 1; i <= 10; i++){
        let temp = document.querySelector(`#mb${i}`);
        temp.addEventListener("click",e => {
            user_click(i);
        });
        temp.addEventListener("mouseenter", () => {
            let btnhover = new Audio("sounds/btn_hover.mp3");
            btnhover.play();
        });
    };

    let user_click = input => {
        if (animating) return;
        if (input === target){
            animating = true;
            right_s.play();
            teacher.classList.add("show");
            good.classList.add("show");
            rs.classList.add("show");
            setTimeout(() =>{
                teacher.classList.remove("show");
                good.classList.remove("show");
                rs.classList.remove("show");
            }, 1000)
            if (target <= 5){
                document.querySelector(".machine.open1").classList.add("show");
                document.querySelector(".drawer-front.open1").classList.add("show");
            } else {
                document.querySelector(".machine.open2").classList.add("show");
                document.querySelector(".drawer-mid").classList.add("show");
                document.querySelector(".drawer-front.open2").classList.add("show");
            }
            for (let i = 0; i < target; i++){
                snakes[i].classList.add("show");
                setTimeout(() => {
                    snakes[i].classList.add("animate");
                }, i*1000);
                setTimeout(() => {
                    snakes[i].classList.remove("animate");
                }, (i+1)*1000);
            }
            setTimeout(() => {
                for (let i = 0; i < target; i++){
                    snakes[i].classList.remove("show");
                }
                if (target <= 5){
                    document.querySelector(".machine.open1").classList.remove("show");
                    document.querySelector(".drawer-front.open1").classList.remove("show");
                } else {
                    document.querySelector(".machine.open2").classList.remove("show");
                    document.querySelector(".drawer-mid").classList.remove("show");
                    document.querySelector(".drawer-front.open2").classList.remove("show");
                }
                next_number();
                animating = false;
            }, target*1000)
        } else {
            wrong_s.play();
            teacher.classList.add("show");
            teacher.classList.add("sad");
            wrong.classList.add("show");
            rs.classList.add("show");
            setTimeout(() =>{
                teacher.classList.remove("show");
                teacher.classList.remove("sad");
                wrong.classList.remove("show");
                rs.classList.remove("show");
            }, 1000);
        }
    }

    let next_number = () =>{
        target = Math.floor(Math.random() *10)+1;
        number_view.innerHTML = target; 
    }

    return{
        start: next_number
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
        timer.start(); 
    });

    timer.set_cb(() => {
        console.log("finished");
        show_element(document.querySelector(".end-screen"));
        timer.stop();
    });

    document.querySelector(".restart").addEventListener("click", (e) => {
        timer.start();
        hide_element(document.querySelector(".end-screen"));
    });

    timer.set_element(document.querySelector(".comtimer"));
    timer.set_initial(150);

})();

