let game = (() => {

    let vehicle = -1;
    let color_mode = -1;
    let color_enable = false;
    let remain_unplaced = [7,6,5];

    let element = {
        menu: document.querySelector(".menu"),
        main: document.querySelector(".main"),
        b2m: document.querySelector(".back2menu"),
        partscontainer: document.querySelectorAll(".parts-container"),
        placed_part: [
            document.querySelectorAll(".pc1 > .placed"),
            document.querySelectorAll(".pc2 > .placed"),
            document.querySelectorAll(".pc3 > .placed"),
        ],
        color_part: [
            document.querySelectorAll(".pc1 > .color"),
            document.querySelectorAll(".pc2 > .color"),
            document.querySelectorAll(".pc3 > .color"),
        ],
        unplaced_part: [
            document.querySelectorAll(".pc1 > .unplaced"),
            document.querySelectorAll(".pc2 > .unplaced"),
            document.querySelectorAll(".pc3 > .unplaced"),
        ],
        color_buckets: document.querySelector(".color-buckets"),
        buckets_clickboxes: document.querySelectorAll(".color-bucket"),
        cc: document.querySelector(".color-cursor")
    }

    let start = (_vehicle) => {
        vehicle = _vehicle;
        hide_element(element.menu);
        show_element(element.main);
        element.partscontainer.forEach(ele => hide_element(ele));
        show_element(element.partscontainer[_vehicle]);
        cursor_controller.star_off();
        cursor_controller.frame_on();
        element.unplaced_part.forEach(upl => {
            upl.forEach( up => {
                show_element(up);
            })
        })
    }

    let enable_color = () => {
        color_enable = true;
        show_element(element.color_buckets);
        show_element(element.cc);
    }

    let restart = () => {
        color_mode = false;
        element.unplaced_part.forEach(val => {
            val.forEach(vall => {
                show_element(vall);
            })
        });
        element.placed_part.forEach(val => {
            val.forEach(vall => {
                hide_element(vall);
            })
        });
        element.color_part.forEach(val => {
            val.forEach(vall => {
                hide_element(vall);
            })
        });
        
        hide_element(element.cc);
        
        vehicle = -1;
        color_mode = -1;
        color_enable = false;
        remain_unplaced = [7,6,5];
        cursor_controller.star_on();
        show_element(element.menu);
        hide_element(element.main);
    }

    return {
        start: start,
        restart: restart,
        init: () => {
            let rex, rey;
            let drag_elem = null;
            let drag_idx = -1;
            let drag_vehicle = -1;
            element.b2m.addEventListener("click", restart);
            element.unplaced_part.forEach((up, vi) => {
                up.forEach((val, key) => {
                    val.addEventListener("mousedown", e => {
                        play_music("5_按鈕.WAV.mp3");
                        let rect = e.currentTarget.getBoundingClientRect();
                        rex = e.clientX - rect.left;
                        rey = e.clientY - rect.top;
                        drag_elem = val;
                        drag_idx = key;
                        drag_vehicle = vi;
                    });
                });
            });

            element.placed_part.forEach((pp, vi) => {
                pp.forEach((val, key) => {
                    val.addEventListener("mouseenter", () => {
                        if (vi !== drag_vehicle) return;
                        if (drag_idx !== key) return;
                        play_music("sounds/3_正確.mp3");
                        show_element(val);
                        show_element(element.color_part[vi][key]);
                        hide_element(drag_elem);
                        remain_unplaced[vi]--;
                        console.log(remain_unplaced[vi]);
                        if (remain_unplaced[vi] <= 0)
                            enable_color();
                    })
                });
                pp.forEach((val, key) => {
                    val.addEventListener("click", () => {
                        if (!enable_color || color_mode === -1) return;
                        play_music("5_按鈕.WAV.mp3");
                        [1,2,3,4,5].forEach(num => element.color_part[vi][key].classList.remove("c"+num));
                        element.color_part[vi][key].classList.add("c"+(color_mode+1));
                    })
                })
            });
            let frame = document.querySelector("#frame");
            frame.addEventListener("mousemove",e => {
                let rect = e.currentTarget.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;

                element.cc.style["top"] = (y-70)+"px";
                element.cc.style["left"] = x+"px";

                if (drag_elem === null) return;
                drag_elem.style["left"] = ( x ) + "px";
                drag_elem.style["top"] = ( y ) + "px";
            });

            frame.addEventListener("mouseup",e => {
                if (drag_elem == null) return;
                drag_idx = -1;
                drag_number = -1;
                drag_elem.style["top"] = "";
                drag_elem.style["left"] = "";
                drag_elem = null;
            });

            element.buckets_clickboxes.forEach((bcb, key) => {
                bcb.addEventListener("click", () => {
                    if (color_enable)
                        color_mode = key;
                    [1,2,3,4,5].forEach(num => element.cc.classList.remove("cc"+num));
                    element.cc.classList.add("cc" + (color_mode+1));
                    play_music("sounds/");
                });
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
        play_music("sounds/1_開始玩.mp3");
    })

    document.querySelectorAll(".prototype-vehicle").forEach((val, key) => {
        val.addEventListener("click", () => {
            game.start(key);
        });
    });

})();