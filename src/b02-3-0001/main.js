let game = (() => {

    let category = -1;
    let holding = -1;
    let steps = [0,0,0,0,0];
    let orders = [
        [0,2,0,1,1,1,1,1,1,1,1],
        [2,0,0,1,4,0,0,6,3,0,0,0,5,4],
        [1,2,1,4,3,1,2,1,0,4,2,1,0,4],
        [3,0,2,3,1,4,4,4,4],
        [3,0,1,0,1,0,2,1,2,1]
    ];

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
        })
    }

    let restart = () => {
        element.unplaced_part.forEach(val => {
            val.forEach(vall => {
                show_element(vall);
            })
        });
        
        category = -1;
        remain_unplaced = [7,6,5];
        cursor_controller.star_on();
        show_element(element.menu);
        hide_element(element.main);
    }

    return {
        start: start,
        restart: restart,
        init: () => {
            let drag_elem = null;
            element.unplaced_part.forEach((up, vi) => {
                up.forEach((val, key) => {
                    val.addEventListener("mousedown", e => {
                        holding = key;
                        let rect = e.currentTarget.getBoundingClientRect();
                        rex = e.clientX - rect.left;
                        rey = e.clientY - rect.top;
                        drag_elem = val;
                        drag_idx = key;
                        drag_vehicle = vi;
                    });
                });
            });
            element.nav.forEach((cat, idx) => {
                cat.addEventListener("click", () => {
                    category = idx;
                    element.partscontainer.forEach(ele => hide_element(ele));
                    show_element(element.partscontainer[category]);
                    console.log(idx);
                    play_music("sounds/5_按鈕.WAV.mp3");
                });
            });
            let frame = document.querySelector("#frame");

            frame.addEventListener("mouseup",e => {
                if (drag_elem == null) return;
                drag_idx = -1;
                drag_number = -1;
                drag_elem.style["top"] = "";
                drag_elem.style["left"] = "";
                drag_elem = null;
                console.log(holding, category, orders[category][steps[category]])

                if (holding == orders[category][steps[category]]) {
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
                } else {
                    element.boy.classList.add("sad");
                    play_music("sounds/1_錯誤.mp3");
                    setTimeout(() => {
                        element.boy.classList.remove("sad");
                    }, 500);
                }
                holding = -1;
            });
            frame.addEventListener("mousemove",e => {
                if (drag_elem === null) return;
                let rect = e.currentTarget.getBoundingClientRect();
                let x = e.clientX - rect.left - drag_elem.offsetWidth/2;
                let y = e.clientY - rect.top - drag_elem.offsetHeight/2;

                drag_elem.style["left"] = ( x ) + "px";
                drag_elem.style["top"] = ( y ) + "px";
            });
        }
    }
})();

//main
(() => {

    cursor_controller.star_on();

    game.init();

    document.querySelector(".start-btn").addEventListener("click", () => {
        document.querySelector(".start-screen").style.display = "none";
        // play_music("sounds/1_開始玩.mp3");
    })

})();