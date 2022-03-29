let game = (() => {

    let category = -1;
    let holding = -1;
    let steps = [0,0,0,0,0];
    let in_range = false;
    let orders = [
        [0,2,0,1,1,1,1,1,1,1,1],
        [2,0,0,1,4,0,0,6,3,0,0,0,5,4],
        [1,2,1,4,3,1,2,1,0,4,2,1,0,4],
        [3,0,2,3,1,4,4,4,4],
        [3,0,1,0,1,0,2,1,2,1]
    ];

    let current_coor = [0,0];

    let element = {
        partscontainer: document.querySelectorAll(".parts-container"),
        unplaced_part: [
            document.querySelectorAll(".pc1 > .unplaced"),
            document.querySelectorAll(".pc2 > .unplaced"),
            document.querySelectorAll(".pc3 > .unplaced"),
            document.querySelectorAll(".pc4 > .unplaced"),
            document.querySelectorAll(".pc5 > .unplaced"),
        ],
        results: document.querySelectorAll(".current"),
        resultscontainer: document.querySelectorAll(".current-container"),
        nav: document.querySelectorAll(".cat"),
        boy: document.querySelector(".boy")
    }

    let start = (_category) => {
        category = _category;
        element.partscontainer.forEach(ele => hide_element(ele));
        show_element(element.partscontainer[_category]);
        cursor_controller.star_off();
        cursor_controller.frame_on();
        element.unplaced_part.forEach(upl => {
            upl.forEach( up => {
                show_element(up);
            })
        });
    }

    let restart = () => {
        element.unplaced_part.forEach(val => {
            val.forEach(vall => {
                show_element(vall);
            })
        });
        
        category = -1;
        cursor_controller.star_on();
        ctimer.start();
        hide_element(document.querySelector(".end-screen"));
    }

    let game_over = () => {
        ctimer.stop();
        show_element(document.querySelector(".end-screen"));
    }

    return {
        start: start,
        restart: restart,
        init: () => {
            let drag_elem = null;
            element.unplaced_part.forEach((up, vi) => {
                up.forEach((val, key) => {
                    let user_control_down = e => {
                        e.preventDefault();
                        let user_left = e.clientX || e.touches[0].clientX;
                        let user_top = e.clientY || e.touches[0].clientY;

                        holding = key;
                        let rect = e.currentTarget.getBoundingClientRect();
                        rex = user_left - rect.left;
                        rey = user_top - rect.top;
                        drag_elem = val;
                        drag_idx = key;
                        drag_vehicle = vi;
                    }
                    val.addEventListener("mousedown", user_control_down);
                    val.addEventListener("touchstart", user_control_down);
                });
            });
            element.nav.forEach((cat, idx) => {
                cat.addEventListener("click", () => {
                    category = idx;
                    element.partscontainer.forEach(ele => hide_element(ele));
                    show_element(element.partscontainer[category]);
                    console.log(idx);
                    play_music("sounds/5_按鈕.WAV.mp3");
                    update_box();
                });

            });

            let update_box = () => {
                let frame_rect = document.querySelector("#frame").getBoundingClientRect();
                let current_rect = element.results[category].getBoundingClientRect();
                current_coor = [
                    current_rect.top - frame_rect.top,
                    current_rect.left - frame_rect.left
                ];
            }
            let frame = document.querySelector("#frame");

            let user_control_end = e => {
                if (drag_elem == null) return;
                drag_idx = -1;
                drag_number = -1;
                drag_elem.style["top"] = "";
                drag_elem.style["left"] = "";
                drag_elem = null;
                console.log(holding, category, orders[category][steps[category]])

                if (holding == orders[category][steps[category]] && in_range) {
                    steps[category]++;
                    element.resultscontainer[category].className = "";
                    element.resultscontainer[category].classList.add("element");
                    element.resultscontainer[category].classList.add("current-container");
                    element.resultscontainer[category].classList.add("s"+steps[category]);
                    element.boy.classList.add("yes");
                    play_music("sounds/3_正確.mp3");
                    setTimeout(() => {
                        element.boy.classList.remove("yes");
                    }, 500);
                    update_box();
                } else {
                    element.boy.classList.add("sad");
                    play_music("sounds/1_錯誤.mp3");
                    setTimeout(() => {
                        element.boy.classList.remove("sad");
                    }, 500);
                }
                holding = -1;
            }
            frame.addEventListener("mouseup", user_control_end);
            frame.addEventListener("touchend", user_control_end);

            let user_control_move = e => {
                e.preventDefault();
                if (drag_elem === null) return;
                let user_left = e.clientX || e.touches[0].clientX;
                let user_top = e.clientY || e.touches[0].clientY;
                let rect = e.currentTarget.getBoundingClientRect();
                let x = user_left - rect.left - drag_elem.offsetWidth/2;
                let y = user_top - rect.top - drag_elem.offsetHeight/2;

                drag_elem.style["left"] = ( x ) + "px";
                drag_elem.style["top"] = ( y ) + "px";
                
                in_range = (y > current_coor[0]-60) && (x > current_coor[1]-60);
            };
            ctimer.set_initial(150);
            ctimer.set_element(document.querySelector(".comtimer"));
            ctimer.set_cb(game_over);
            frame.addEventListener("mousemove", user_control_move);
            frame.addEventListener("touchmove", user_control_move);
        }

    }
})();

//main
(() => {

    cursor_controller.star_on();

    game.init();

    document.querySelector(".start-btn").addEventListener("mousedown", () => {
        document.querySelector(".start-screen").style.display = "none";
        // play_music("sounds/1_開始玩.mp3");
        ctimer.start();
    });
    document.querySelector(".restart").addEventListener("click", () => {
        game.restart();
    })
    document.querySelector(".start-btn").addEventListener("touchstart", () => {
        document.querySelector(".start-screen").style.display = "none";
        cursor_controller.star_off();
        // play_music("sounds/1_開始玩.mp3");
        ctimer.start();
    });

})();