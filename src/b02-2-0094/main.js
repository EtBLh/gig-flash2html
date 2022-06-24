let game = (() => {

    let current = "";
    let ans = [false, false, false, false, false, false];
    let content = ["","","","","",""];
    let type = ["","","","","",""];

    let remaining = 4;
    let life = 2;
    let timer = null;

    let element = {
        cview: document.querySelectorAll(".cview"),
        selectors: document.querySelectorAll(".selector"),
        m1: document.querySelector(".m1"),
        m2: document.querySelector(".m2"),
        f1: document.querySelector(".f1"),
        f2: document.querySelector(".f2"),
        um1: document.querySelectorAll(".m1")[1],
        um2: document.querySelectorAll(".m2")[1],
        uf1: document.querySelectorAll(".f1")[1],
        uf2: document.querySelectorAll(".f2")[1],
        ci: document.querySelector(".click-indicate"),
        end: document.querySelector(".end-screen"),
        time: document.querySelector(".countdown"),
        win: document.querySelector(".win"),
        lose: document.querySelector(".lose")
    }

    let models = [element.f1,element.f2,element.m1,element.m2];
    let umodels = [element.uf1,element.uf2,element.um1,element.um2];

    let gameover = () => {
        clearInterval(timer);
        show_element(element.end);
        show_element(element.lose);
    }

    let win = () => {
        clearInterval(timer);
        show_element(element.end);
        show_element(element.win);
    }

    let start = () => {
        const arr = ["h","b","l","s"];
        const types = ["head", "body", "legs", "shoes"];
        let temp = 0;
        let remain_time = 60;
        timer = setInterval(() => {
            let sec = remain_time % 60;
            element.time.innerHTML=`0${remain_time==60?"1":"0"}:${sec/10<1?"0":""}${sec}`;
            remain_time --;
        },1000);
        let sex = Math.random() > 0.5 ? "m" : "f";
        let num = Math.random() > 0.5 ? "1" : "2";
        current = sex + num;
        for (let i = 6; i > 2; i--){
            let cum_idx = Math.floor(Math.random()*i);
            let idx = 0;
            let j = 0;
            while(true){
                if (!ans[idx]) {
                    j++;
                    console.log(j, idx);
                }
                if (j > cum_idx) break;
                idx++;
            }
            ans[idx] = true;
            content[idx] = current+arr[i-3];
            type[idx] = types[i-3];
            console.log(idx, ans);
        }
        element.cview.forEach((ele, key) => {
            if (content[key] != ""){
                ele.classList.add(content[key]);
            } else {
                ele.classList.add(sex + (num == "1" ? "2":"1") + arr[temp++]);
            }
        });
        models.forEach(val => {
            val.classList.remove("show");
        });
        umodels.forEach(val => {
            val.classList.remove("show");
        });
        element[current].classList.add("show");
        element["u"+current].classList.add("show");
    }

    return{
        start: start,
        restart: () => {
            hide_element(element.end);
            remaining = 6;
            ans = [false, false, false, false, false, false];
            content = ["","","","","",""];
            type = ["","","","","",""];
        
            remaining = 4;
            life = 2;

            hide_element(element.win);
            hide_element(element.lose);

            element.cview.forEach((val, key) => {
                val.className = "";
                val.classList.add("element");
                val.classList.add("cview");
                val.classList.add("v" + (key+1));
            });
            document.querySelectorAll(".undressed > *").forEach(val => {
                hide_element(val);
            })
            
            start();
        },
        init: () => {
            element.selectors.forEach((val, key) => {
                val.addEventListener("click", e => {
                    if (ans[key]) {
                        //right
                        remaining--;
                        ans[key] = false;
                        play_music("sounds/7_正確.mp3");
                        document.querySelectorAll("."+type[key]).forEach((val) => {
                            show_element(val);
                        });
                        if (remaining <= 0) win();
                    } else {
                        //wrong
                        life--;
                        if (life <= 0) gameover();
                        play_music("sounds/6_錯誤.mp3");
                    }
                    element.cview[key].classList.add("hide");
                    hide_element(element.ci);
                })
            });
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

