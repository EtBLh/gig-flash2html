let game = (() => {

    let mode = -1; //0: shape, 1: color
    let answerable = false;
    let available = [true, true, true, true, true, true, true];
    let available_count = 7;
    let scores = 0;
    let ans_select_num = -1;
    let element = {
        menu: document.querySelector(".menu"),
        shape_select: document.querySelector(".selector-shapes"),
        color_select: document.querySelector(".selector-colors"),
        main: document.querySelector(".main"),
        selection: document.querySelectorAll(".selection"),
        selections_view:document.querySelectorAll(".selection>.selection-view"),
        question: document.querySelector(".question"),
        cross: document.querySelectorAll(".cross"),
        right: document.querySelectorAll(".right"),
        endscreen: document.querySelector(".end-screen"),
        score: document.querySelector(".number"),
        back2menu: document.querySelector(".back2menu")
    }

    let shapeslist = ["s1","s2","s3","s4","s5","s6","s7"];
    let colorslist = ["c1","c2","c3","c4","c5","c6","c7"];

    let start = (_mode) => {
        play_music("sounds/start.mp3");
        mode = _mode;
        hide_element(element.menu);
        show_element(element.main);
        next();
    }
    
    let gameover = () => {
        show_element(element.endscreen);
        element.score.innerHTML = scores;
    }

    let next = () => {
        if (available_count <= 2) {
            gameover();
            return;
        }
        let qsnumber = 0;
        let qcnumber = 0;


        let prob = Math.floor(Math.random() * available_count);
        available_count--;
        let question_number = 0;
        for (cell of available){
            if (!cell){
                question_number++;
                continue;
            } else {
                if (prob <= 0) {
                    cell = false;
                    break;
                } else {
                    prob--;
                    question_number++;
                }
            }
        }

        ans_select_num = Math.floor(Math.random() * 3);
        element.selections_view.forEach((val, key) => {
            let number = question_number + ans_select_num - key;
            number = mod (number, 7);
            shapeslist.forEach(_val => val.classList.remove("a" + _val));
            colorslist.forEach(_val => val.classList.remove("a" + _val));
            let sel = (mode == 0? "as" : "ac") + (number+1);
            console.log(key + " " + ans_select_num+" "+ question_number + " " + (number));
            val.classList.add(sel);
        });


        let show_question = () => {
            answerable = true;
            let question = (mode == 0? "s" : "c") + (question_number+1);
            element.question.classList.add(question);
        }
        let qroller = setInterval(() => {
            shapeslist.forEach(val => element.question.classList.remove(val));
            colorslist.forEach(val => element.question.classList.remove(val));
            if (qsnumber >= 7 && qcnumber >= 7){
                clearInterval(qroller);
                show_question();
                return;
            }
            if (qsnumber < 7)
                element.question.classList.add(shapeslist[qsnumber++]);
            if (qsnumber >= 7 && qcnumber < 7)
                element.question.classList.add(colorslist[qcnumber++]);
        },200);
    }

    let restart = () => {
        hide_element(element.main);
        show_element(element.menu);
        hide_element(element.endscreen);
        scores = 0;
        available = [true, true, true, true, true, true, true];
        answerable = false;
        available_count = 7;
    }

    return {
        start: start,
        restart: restart,
        init: () => {
            let current_select_shape = 0;
            let current_select_color = 0;
            element.shape_select.addEventListener("mouseenter",()=>{
                play_music("sounds/menubtnhover.mp3");
            });
            element.color_select.addEventListener("mouseenter",()=>{
                play_music("sounds/menubtnhover.mp3");
            });
            setInterval(() => {
                if (current_select_shape > 6) current_select_shape = 0;
                shapeslist.forEach(val => element.shape_select.classList.remove(val));
                element.shape_select.classList.add(shapeslist[current_select_shape++]);
            },200);
            setInterval(() => {
                if (current_select_color > 6) current_select_color = 0;
                colorslist.forEach(val => element.color_select.classList.remove(val));
                element.color_select.classList.add(colorslist[current_select_color++]);
            },200);
            element.selection.forEach((val, key) => {
                console.log(val);
                val.addEventListener("click", () => {
                    console.log(key);
                    if (!answerable) return;
                    answerable = false;
                    if (key != ans_select_num) {
                        //wrong
                        play_music("sounds/wrong.mp3");
                        show_element(element.cross[key],700,()=>{
                            next();
                        })
                    } else {
                        //right
                        play_music("sounds/right.mp3");
                        scores++;
                        show_element(element.right[key],700,()=>{
                            next();
                        })
                    }
                })
            });
            element.back2menu.addEventListener("click", restart);
        }
    }
})();

//main
(() => {

    cursor_controller.star_on();

    document.querySelector(".shape-selector").addEventListener("click",() => {
        game.start(0);
    })
    document.querySelector(".color-selector").addEventListener("click",() => {
        game.start(1);
    })

    game.init();

    document.querySelector(".restart").addEventListener("click", game.restart);

})();