let game = (() => {
    let power_up = null;
    let power_down = null;
    let is_power_down = false;
    let power_level = 0;
    let angle;
    const power_bar = document.querySelector(".power-measure-bar");
    const frame = document.querySelector("#frame");
    const angle_indicator = document.querySelector(".angle-indicator");
    let marble = document.querySelector(".marble");
    let playing = false;
    let score = 0;
    let remaining = 5;
    const dests = [
        document.querySelectorAll(".dest1"),
        document.querySelectorAll(".dest2"),
        document.querySelectorAll(".dest3"),
        document.querySelectorAll(".dest4")
    ]
    //[x, y, r]
    const score_range = [
        [[308,258,487,384]],
        [[81,276,234,367],[564,272,711,367]],
        [[210,192,340,265],[228,195,588,268]],
        [[347,127,445,158]]
    ];

    const preview_range = [
        [110, 230],
        [274, 362],
        [253, 350],
        [305, 361]
    ]

    const MAX_DIST = 350;
    const MAX_SCALE_SHRINK = 0.5;

    let throwing = false;

    const vector_center = [400, 500];
    const get_angle = (vec) => {
        let coor = [vec[0] - vector_center[0], vec[1] - vector_center[1]];
        return ((Math.atan2(coor[0],coor[1]) * (-180 / Math.PI) + 180)) % 360;
    }
    let mouse_pos = [0,0];
    const get_polar_angle = (vec) => {
        let coor = [vec[0] - vector_center[0], vector_center[1] - vec[1]];
        let angle = ( Math.atan(coor[1]/coor[0]) * 180 / Math.PI + 180) % 180;
        return angle;
    }

    let start = () => {
        playing = true;
        remaining = 5;
        hide_element(document.querySelector(".end-screen"));
        cursor_controller.frame_off();
        cursor_controller.star_off();
    }

    let game_over = () => {
        document.querySelector(".number").innerHTML = score;
        show_element(document.querySelector(".end-screen"));
        playing = false;
        cursor_controller.frame_off();
        cursor_controller.star_on();
    }

    let add_score = (val) => {
        score += val;
        console.log(score);
        let score__ = document.querySelector(".score");
        let score_back = document.querySelector(".score-back");
        score__.innerHTML = score + "Points";
        show_element(score__,500);
        show_element(score_back,500);
    }

    let _throw = () => {
        if (throwing) return;
        throwing = true;
        power_level = Math.max(power_level,20);
        let dist =  MAX_DIST * power_level/100;
        let polar_theta = get_polar_angle(mouse_pos);
        let scale_shrink = power_level/100*MAX_SCALE_SHRINK;
        console.log(angle, dist);
        hide_for_interval(angle_indicator, 5000);
        let destx = Math.cos(polar_theta*Math.PI/180) * dist;
        let desty = Math.sin(polar_theta*Math.PI/180) * dist;
        let cumm_animation_time = 0;
        console.log(polar_theta,destx, desty);
        
        marble.classList.add("throwing");
        setTimeout(() => {
            marble.classList.remove("throwing");
            throwing = false;

            let normalx = destx + vector_center[0];
            let normaly = 600-100-desty;
            console.log(normalx, normaly);
            score_range.forEach((srs, key) => {
                srs.forEach(sr => {
                    if (normalx >= sr[0] && normalx <= sr[2] &&
                        normaly >= sr[1] && normaly <= sr[3])
                        add_score(key+1);
                });
            })

            remaining--;
            document.querySelectorAll(".remaining_marble").forEach((val, key) => {
                if (key >= remaining) val.style["display"] = "none";
            });
            if (remaining <= 0) game_over();
        },5000);
        setTimeout(() => {
            marble.style["bottom"] = "";
            marble.style["left"] = "";
            marble.style["transform"] = "";
        },5500);
        let animator = setInterval(() => {
            if (cumm_animation_time >= 1) {
                clearInterval(animator);
                return;
            }
            marble.style["bottom"] = (desty * cumm_animation_time) + "px";
            marble.style["left"] = (destx * cumm_animation_time + vector_center[0]) + "px";
            marble.style["transform"] = `translate(-50%, -10%) scale(${1-scale_shrink*cumm_animation_time})`;

            cumm_animation_time += 1/500;
        },10);
    }

    return {
        init : () => {
            power_bar.style["width"] = "0px";
            frame.addEventListener("mousedown", () => {
                if (!playing || throwing) return;
                clearInterval(power_up);
                if (is_power_down) return;
                power_up = setInterval(() => {
                    if (power_level >= 100) return;
                    power_level+=0.3
                    power_bar.style["width"] = power_level/100*212 + "px";

                    let estim_range = power_level/100*MAX_DIST;
                    preview_range.forEach((range, key) => {
                        if (range[0] < estim_range && range[1] > estim_range){
                            dests[key].forEach(ele => {
                                ele.classList.add("glowing");
                            });
                        } else {
                            dests[key].forEach(ele => {
                                ele.classList.remove("glowing");
                            });
                        }
                    });
                }, 10)
            })
            frame.addEventListener("mouseup", () => {
                if (!playing) return;
                clearInterval(power_up);
                is_power_down = true;
                power_down = setInterval(() => {
                    if (power_level <= 0) {
                        is_power_down = false;
                        clearInterval(power_down);
                        return;
                    }
                    power_level -= 2;
                    power_bar.style["width"] = (power_level)/100*212 + "px"; 
                }, 0.1);
                
                dests.forEach(subdests => subdests.forEach(ele => {
                    ele.classList.remove("glowing");
                }));
                _throw();
            });
            frame.addEventListener("mousemove", e => {
                
                let coor = [mouse_pos[0] - vector_center[0], mouse_pos[1] - vector_center[1]];
                // score_range.forEach((cat, sc) => {
                //     cat.forEach(vector => {
                //         let dist2p = Math.sqrt(Math.pow(coor[0] - vector[0],2) + Math.pow(coor[1] - vector[1],2));
                //         console.log(dist2p);
                //         if( dist2p <= vector[2]) console.log('fucker');
                //     })
                // });
                // vector = score_range[1][0];
                // let dist2p = Math.sqrt(Math.pow(coor[0] - vector[0],2) + Math.pow(coor[1] - vector[1],2));
                // console.log(dist2p);
                // if( dist2p <= vector[2]) console.log('fucker');

                e.preventDefault();
                let rect = e.currentTarget.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;
                let temp_pos = [x,y];
                let temp_angle = get_angle(temp_pos);
                if (temp_angle > 60 && temp_angle < 300) return;
                mouse_pos = temp_pos;
                angle = temp_angle;
                angle_indicator.style["transform"] = `rotate(${angle}deg)  translate(-50%, 0)`;
            });
        },
        start: start,
        restart: () => {
            remaining = 5;
            score = 0;
            document.querySelectorAll(".remaining_marble").forEach((val) => {
                val.style["display"] = "block";
            });
            start();
        }
    }
})();

//main
(() => {

    cursor_controller.star_on();

    game.init();
    document.querySelector(".start-btn").addEventListener("click",e => {
        cursor_controller.star_off();
        document.querySelector(".start-screen").style["display"] = "none";
        game.start();
    });
    document.querySelector(".restart").addEventListener("click", game.restart);

})();