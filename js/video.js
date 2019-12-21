const container = document.querySelector('.video-container');
const video = container.querySelector('video');
const controls = container.querySelector('.video-controls');

const progress_slider = controls.querySelector('#progress-slider');
const title = container.querySelector('.video-title');
const outer = controls.querySelector('.progress-bar')

const captions = container.querySelector('.captions');

const btns = controls.querySelector('.buttons');
const play_btn = btns.querySelector('#play-button');
const fs_btn = btns.querySelector('#fs-button');
const st_btn = btns.querySelector('#st-button');
const st_menu = btns.querySelector('.dropup-content');
const st_main = st_menu.querySelector("#st-main");
const st_sub = st_menu.querySelector(".sub");
const time_index = btns.querySelector('#time');
const mute_btn = btns.querySelector('#speaker-button');
const volume_slider = btns.querySelector('#volume-slider');

var paused = true, st_open = false;

const showControls = () => {
    title.style.transform = controls.style.transform = 'translateY(0)';
    captions.style.transform = 'translateY(0)';
    container.style.cursor = 'auto';
};

const hideControls = () => {
    if (paused || st_open) {
        return;
    }

    st_menu.style.display = container.style.cursor = 'none';
    title.style.transform = 'translateY(-100%)';
    captions.style.transform = 'translateY(35px)';
    controls.style.transform = 'translateY(100%) translateY(-6px)';
};

const toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
}

video.addEventListener('loadeddata', () => {
    duration_label = toHHMMSS(video.duration);
    time_index.textContent = toHHMMSS(video.currentTime) + "/" + duration_label;
    progress_slider.max = video.duration;
 }, false);

 play_btn.addEventListener('click', e => {
    paused = false;
    if (!video.paused) {
        video.pause();
        play_btn.className = 'play'
        paused = true;
    } else {
        video.play();
        play_btn.className = 'pause'
    }
});

fs_btn.addEventListener('click', e => {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } else {
        element = container;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
});
st_menu.style.display = 'none';

st_btn.addEventListener('click', e => {
    if (st_menu.style.display == 'none') {
        st_menu.style.display = 'block';
        st_open = true;
    } else {
        st_menu.style.display = 'none';
        st_open = false;
    }
});

video.addEventListener('click', e => play_btn.click());
video.addEventListener('timeupdate', e => {
    const pos = video.currentTime / video.duration;
    progress_slider.value = video.currentTime;

    time_index.textContent = toHHMMSS(video.currentTime) + "/" + duration_label;
    
    if (video.ended) {
        play_btn.className = 'play';
        paused = true;
        showControls();
    }
});

progress_slider.oninput = () => {
    video.currentTime = progress_slider.value;
};

mute_btn.addEventListener('click', e => {
    if (video.muted) {
        mute_btn.classList.remove('muted');
        mute_btn.classList.add('sound');
    } else {
        mute_btn.classList.remove('sound');
        mute_btn.classList.add('muted');
    }
    video.muted = !video.muted;
});

volume_slider.value = 100;

volume_slider.oninput = () => {
    video.volume = (volume_slider.value / 100.0);
};

window.onload = () => {
    var timeout, duration = 1500;

    const controlToggle = function() {
        showControls();
        clearTimeout(timeout);
        timeout = setTimeout(hideControls, duration)
    };

    container.addEventListener('mousemove', controlToggle);
    container.addEventListener('click', controlToggle);

    container.addEventListener('mouseleave', function () {
        hideControls();
    })

    progress_slider.value = 0;
}

const stClick = (el) => {
    el.children[0].children[1].classList.add('inactive');
    Array.from(st_main.querySelectorAll(`div:not(#${id})`)).map((el) => el.classList.add("inactive"));
    st_sub.querySelector("#" + el.id).classList.add("active");
};

function resetSt() {
    const nodes = Array.from(st_main.querySelectorAll(".inactive"));
    nodes.map(node => { node.classList.remove("inactive")});
    st_sub.querySelector(".active").classList.remove("active");
}

// if (Hls.isSupported()) {
//     var hls = new Hls();
//     hls.loadSource('/cache/1.m3u8');
//     hls.attachMedia(video);
//     hls.on(Hls.Events.MANIFEST_PARSED,function() {
//         video.play();
//     });
// } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
//     video.src = 'localhost:8080/cache/1.m3u8';
//     video.addEventListener('loadedmetadata',function() {
//         video.play();
//     });
// }