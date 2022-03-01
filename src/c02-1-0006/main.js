//main
(() => {

    let start_voice = new Audio("sounds/start.mp3");

    cursor_controller.star_on();

    document.querySelector(".start-btn").addEventListener("click",e => {
        document.querySelector(".start-screen").style["display"] = "none";
        start_voice.play();
    });

    let current = 0;
    const texts = [
        "快乐",
        "难过",
        "害羞",
        "生气",
        "不开心",
        "高兴",
        "惊讶",
        "想睡觉"
    ];
    const voices = [
        "sounds/2_09-happy_海邊玩.wav.mp3",
        "sounds/3_08-難過_娃娃壞.wav.mp3",
        "sounds/4_07-shy_隔壁阿姨.wav.mp3",
        "sounds/5_06-angry_臭哥哥喝可樂2.wav.mp3",
        "sounds/9_02-SAD 破杯子.wav.mp3",
        "sounds/8_03-happy_zoo.wav.mp3",
        "sounds/7_04-surprise_毛毛蟲.wav.mp3",
        "sounds/6_05-sleep_zoo tired.wav.mp3"
    ];

    let voice_players = voices.map(val => {
        return new Audio(val);
    });

    let emo = document.querySelectorAll(".emo");
    let mainemo = document.querySelector(".main-emo");
    emo.forEach((ele, key) => {
        ele.addEventListener("click", (e) => {
            current = key;
            document.querySelector(".emo-text").innerHTML = texts[key];
            mainemo.className = "element main-emo e" + (key + 1);
            stop_audio(start_voice);
            voice_players.forEach(vp => stop_audio(vp));
            voice_players[key].play();
        });
        ele.addEventListener("mouseenter", e => {
            play_music("sounds/95.mp3");
        });
    });

})();