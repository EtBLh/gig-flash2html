let game = (() => {

    let question_list = [
        "哪里有两支铅笔?",
        "哪里有一只熊猫?",
        "哪里有五把刷子?"
    ];
    let question_audios = [
        "sounds/q1.mp3",
        "sounds/q2.mp3",
        "sounds/q3.mp3"
    ]
    let ans_list = [2,1,2]

    let current = -1;
    let clickable = false;
    let time = 60;
    let counting = null;

    let view = {
        counter: document.querySelector(".counter"),
        teacher: document.querySelector(".t1"),
        questionimgs: document.querySelectorAll(".question-img"),
        clickboxs: document.querySelectorAll(".overlay"),
        circles: document.querySelectorAll(".circle"),
        crosses: document.querySelectorAll(".cross"),
        question: document.querySelector(".question"),
        win: document.querySelector(".win"),
        lose: document.querySelector(".lose"),
        endscreen: document.querySelector(".end-screen"),
    }

    let next = () => {
        if (current >= 2) {
            win(); return;
        }
        current++;
        play_music(question_audios[current],() => {clickable = true});
        view.questionimgs.forEach(el => {el.classList.remove("show")});
        view.questionimgs[current].classList.add("show");
        view.question.innerHTML = question_list[current];

    }

    let win = () => {
        show_element(view.win);
        hide_element(view.lose);
        play_music("sounds/win.mp3");
        show_element(view.endscreen);
        clearInterval(counting);
    }

    let lose = () => {
        show_element(view.lose);
        hide_element(view.win);
        play_music("sounds/lose.mp3");
        show_element(view.endscreen);
    }

    let start = () => {
        play_music("sounds/q_start.mp3",next);
        counting = setInterval(() => {
            if (time <= 0){
                lose();
                clearInterval(counting);
                return;
            }
            time--;
            view.counter.innerHTML=`00:${time/10<1?"0":""}${time}`;
        },1000);
    };

    return {
        init: () => {
            view.clickboxs.forEach((val, key) => {
                val.addEventListener("click", () => {
                    if (!clickable) return;
                    console.log('lciked');
                    if (key == ans_list[current]){
                        //right actions
                        show_element(view.circles[key], 500);
                        clickable = false;
                        play_music("sounds/right.mp3",next);
                    } else {
                        //wrong
                        show_element(view.crosses[key], 500);
                        clickable = false;
                        play_music("sounds/wrong.mp3", () => {
                            clickable = true;
                        });
                        view.teacher.classList.add("sad");
                        setTimeout(()=>{
                            view.teacher.classList.remove("sad");
                        }, 500);
                    }
                });
            });
        },
        start: start,
        restart: () => {
            hide_element(view.endscreen);
            view.questionimgs.forEach(el => {el.classList.remove("show")});
            view.questionimgs[0].classList.add("show");
            view.question.innerHTML = question_list[0];
            current = -1;
            time = 60;
            start();
        }
    }
})();
//main
(() => {
    let main = game;
    main.init();

    cursor_controller.star_on();
    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        main.start();
        cursor_controller.star_off();
        cursor_controller.frame_on(); 
    });

    document.querySelector(".restart").addEventListener("click", main.restart);

})();