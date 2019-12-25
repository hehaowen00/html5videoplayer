const setAttrs = (el, attrs) => {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

const toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
};

const createElement = (type, {id, classes} = {}) => {
    element = document.createElement(type);
    if (classes !== undefined) {
        element.classList.add(...classes);
    }
    if (id !== undefined) {
        element.id = id;
    }
    return element;
};

const Icons = {
    'play': () => {
        var img = document.createElement('img');
        img.className = 'icon';
        img.src = '/svg/play_icon.svg';
        return img;
    },
    'pause': () => {
        var img = document.createElement('img');
        img.className = 'icon';
        img.src = '/svg/pause_icon.svg';
        return img;
    },
    'expand': () => {
        var img = document.createElement('img');
        img.className = 'icon';
        img.src = '/svg/expand_icon.svg';
        return img;
    },
    'gear': () => {
        var img = document.createElement('img');
        img.className = 'icon';
        img.src = '/svg/gear_icon.svg';
        return img;
    },
    'speaker': () => {
        var img = document.createElement('img');
        img.className = 'icon';
        img.src = '/svg/speaker_icon.svg';
        return img;
    },
    'muted': () => {
        var img = document.createElement('img');
        img.className = 'icon';
        img.src = '/svg/mute_icon.svg';
        return img;
    }
};

class VideoPlayer {
    constructor(videoElement, options) {
        this.video_title = options.title;
        this.video = videoElement.cloneNode(true);

        this.container = createElement('div', {classes: ['video-container', 'unselectabe']});

        this.init_title();
        this.init_captions();
        this.init_controls();
        
        videoElement.parentNode.replaceChild(this.container, videoElement);
        this.container.appendChild(this.title);
        this.container.appendChild(this.video);
        this.container.appendChild(this.captions);
        this.container.appendChild(this.controls);

        this.state = {
            is_playing: false,
            settings_open: false,
        };
    }

    init_title() {
        this.title = createElement('div', {classes: ['video-title', 'unselectable']});
        this.title.appendChild(document.createTextNode(this.video_title));
    }

    init_captions() {
        this.captions = createElement('div', {classes: ['captions', 'unselectable']});
        this.caption = createElement('div', {id: 'caption'});
        this.captions.appendChild(this.caption);
    }

    init_controls() {
        this.controls = createElement('div', {classes: ['video-controls', 'unselectable']})

        this.buttons = document.createElement('div');
        this.buttons.className = 'buttons';

        this.init_progress_bar();
        this.init_play_btn();
        this.init_time_label();
        this.init_fullscreen_btn();
        this.init_settings_ui();
        this.init_volume_slider();
        this.init_mute_btn();
        
        this.buttons.appendChild(this.play_btn);
        this.buttons.appendChild(this.time_label);
        this.buttons.appendChild(this.fs_btn);
        this.buttons.appendChild(this.settings);
        this.buttons.appendChild(this.volume_slider);
        this.buttons.appendChild(this.mute_btn);

        this.controls.appendChild(this.pbar);
        this.controls.appendChild(this.buttons);
    }

    init_progress_bar() {
        this.pbar = createElement('div', {classes: ['progress-bar']});
        this.pstate = createElement('div', {classes: ['progress-state']});
        
        this.pslider = createElement('input', {classes: ['progress-bar', 'right']});
        setAttrs(this.pslider, {
            'type': 'range',
            'min': '0',
            'value': '0'
        });

        this.pbar.appendChild(this.pstate);
        this.pbar.appendChild(this.pslider);     
    }

    init_play_btn() {
        this.play_btn = createElement('button', {classes: ['play']});
        this.play_btn.appendChild(Icons['play']());
        this.play_btn.appendChild(Icons['pause']());
    }

    init_time_label() {
        this.time_label = createElement('span', {classes: ['time-label']});
    }

    init_fullscreen_btn() {
        this.fs_btn = createElement('button', {classes: ['svg-icon', 'right']});
        this.fs_btn.appendChild(Icons['expand']());
    }

    init_settings_ui() {
        this.settings = createElement('div', {classes: ['dropup', 'right']});

        this.settings_btn = createElement('button', {classes: ['svg-icon', 'dropbtn', 'settings']});
        this.settings_btn.appendChild(Icons['gear']());
        this.settings.appendChild(this.settings_btn);

        this.settings_menu = createElement('div', {classes: ['dropup-content']});
        this.settings.appendChild(this.settings_menu);
        
        this.settings_main = createElement('div');
        this.settings_menu.appendChild(this.settings_main);

        this.settings_options = createElement('div');
        this.settings_menu.appendChild(this.settings_options);
        
        this.settings_menu.style.display = 'none';

        //

        this.playback_speed_item = createElement('div', {id: 'opt1'});
        this.settings_main.appendChild(this.playback_speed_item);

        this.playback_link = createElement('a', {classes: ['st-item']});
        this.playback_speed_item.appendChild(this.playback_link);

        let playback_text = createElement('span', {classes: ['left', 'bold']});
        playback_text.textContent = 'Playback Speed';
        this.playback_link.appendChild(playback_text);

        this.playback_value = createElement('span', {classes: ['right']});
        this.playback_value.textContent = 'Normal';
        this.playback_link.appendChild(this.playback_value);

        this.playback_options = createElement('div', {classes: ['st-opt']});
        this.playback_options.appendChild(createElement('hr'));
        this.settings_options.appendChild(this.playback_options);

        //

        this.captions_item = createElement('div', {id: 'opt2'});
        this.settings_main.appendChild(this.captions_item);

        this.captions_link = createElement('a', {classes: ['st-item']});
        this.captions_item.appendChild(this.captions_link);

        let captions_text = createElement('span', {classes: ['left', 'bold']});
        captions_text.textContent = 'Subtitles / CC';
        this.captions_link.appendChild(captions_text);

        this.captions_value = createElement('span', {classes: ['right']});
        this.captions_value.textContent = 'Disabled';
        this.captions_link.appendChild(this.captions_value);

        this.captions_options = createElement('div', {classes: ['st-opt']});
        this.captions_options.appendChild(createElement('hr'));
        this.settings_options.appendChild(this.captions_options);

        //

        this.quality_item = createElement('div', {id: 'opt3'});
        this.settings_main.appendChild(this.quality_item);

        this.quality_link = createElement('a', {classes: ['st-item']});
        this.quality_item.appendChild(this.quality_link);

        let quality_text = createElement('span', {classes: ['left', 'bold']});
        quality_text.textContent = 'Quality';
        this.quality_link.appendChild(quality_text);

        this.quality_value = createElement('span', {classes: ['right']});
        this.quality_link.appendChild(this.quality_value);

        this.quality_options = createElement('div', {classes: ['st-opt']});
        this.quality_options.appendChild(createElement('hr'));
        this.settings_options.appendChild(this.quality_options);
    }

    init_volume_slider() {
        this.volume_slider = createElement('div', {classes: ['volume-slider', 'right']});
        this.vslider = createElement('input');
        this.volume_slider.appendChild(this.vslider);
        setAttrs(this.vslider, {
            'type': 'range',
            'min': '1',
            'max': '100',
            'value': '100'
        });
    }

    init_mute_btn() {
        this.mute_btn = createElement('button', {classes: ['svg-icon', 'right', 'sound']});
        this.mute_btn.appendChild(Icons['speaker']());
        this.mute_btn.appendChild(Icons['muted']());
    }

    add_event_handlers() {
        this.video.addEventListener('loadeddata', e => {
            setAttrs(this.pslider, {'max': this.video.duration});
            this.init_settings_events();
            this.video_duration = toHHMMSS(this.video.duration);
            this.time_label.textContent = toHHMMSS(0) + '/' + this.video_duration;
        });

        this.video.addEventListener('click', e => {
            this.play_btn.click();
        });

        this.video.addEventListener('timeupdate', e => {
            const pos = this.video.currentTime / this.video.duration;
            this.pslider.value = this.video.currentTime;

            this.time_label.textContent = toHHMMSS(this.video.currentTime) + '/' + this.video_duration;

            if (this.video.ended) {
                this.play_btn.className = 'play';
                this.video.currentTime = 0;
                this.state.is_playing = false;
                showControls();
            }
        });

        const showControls = () => {
            this.title.style.transform = this.controls.style.transform = 'translateY(0)';
            this.captions.style.transform = 'translateY(0)';
        };

        const hideControls = () => {
            if (!this.state.is_playing | this.state.settings_open) {
                return;
            }

            this.title.style.transform = 'translateY(-100%)';
            this.captions.style.transform = 'translateY(35px)';
            this.controls.style.transform = 'translateY(100%) translateY(-6px)';
        };

        this.timeout = setTimeout(0);
        this.wait_duration = 1500;

        const toggleControls = () => {
            showControls();
            clearTimeout(this.timeout);
            this.timeout = setTimeout(hideControls, this.wait_duration);
        };

        this.container.addEventListener('mousemove', () => {
            toggleControls();
        });

        this.container.addEventListener('mouseleave', () => {
            hideControls();
        });

        this.controls.addEventListener('click', () => {
            toggleControls();
        });

        this.play_btn.addEventListener('click', e => {
            if (this.state.is_playing) {
                this.video.pause();
                this.play_btn.classList.add('play');
                this.play_btn.classList.remove('pause');
                this.state.is_playing = false;
            } else {
                this.video.play();
                this.play_btn.classList.remove('play');
                this.play_btn.classList.add('pause');
                this.state.is_playing = true;
            }
        });

        this.pslider.oninput = () => {
            this.video.currentTime = this.pslider.value;
        };

        this.vslider.oninput = () => {
            this.video.volume = this.vslider.value / 100.0;
        };

        this.mute_btn.addEventListener('click', () => {
            if (this.video.muted) {
                this.mute_btn.classList.remove('muted');
                this.mute_btn.classList.add('sound');
            } else {
                this.mute_btn.classList.remove('sound');
                this.mute_btn.classList.add('muted');
            }

            this.video.muted = !this.video.muted;
        });

        this.fs_btn.addEventListener('click', () => {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    this.caption.style.fontSize = "20px";
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                    this.caption.style.fontSize = "20px";
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                    this.caption.style.fontSize = "20px";
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                    this.caption.style.fontSize = "20px";
                }
            } else {
                element = this.container;
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                    this.caption.style.fontSize = "24px";
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                    this.caption.style.fontSize = "24px";
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    this.caption.style.fontSize = "24px";
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                    this.caption.style.fontSize = "24px";
                }
            }
        });
    }

    init_settings_events() {
        const reset_menu = () => {
            this.playback_link.style.display = 'block';
            this.captions_link.style.display = 'block';
            this.quality_link.style.display = 'block';
            
            this.playback_options.style.display = 'none';
            this.captions_options.style.display = 'none';
            this.quality_options.style.display = 'none';
        };

        this.settings_btn.addEventListener('click', () => {
            if (this.settings_menu.style.display == 'none') {
                this.settings_menu.style.display = 'block';
                this.state.settings_open = true;
            } else {
                this.settings_menu.style.display = 'none';
                this.state.settings_open = false;

                reset_menu();
            }
        });

        const addMenuOption = (text, fn) => {
            let item = createElement('a');
            let span = createElement('span', {classes: ['left']});

            item.addEventListener('click', fn);
            item.appendChild(span);
            span.textContent = text;

            return item;
        };

        const playback_option_click = (e) => {
            let value = e.target.textContent;
            this.playback_value.textContent = value;
            this.playback_value.style.display = '';

            if (value == 'Normal') {
                value = '1.0';
            }
            
            this.video.playbackRate = value;
            reset_menu();
        };

        ['0.25', '0.5', '0.75', 'Normal', '1.25', '1.5', '1.75', '2'].map((text) => {
            this.playback_options.appendChild(
                addMenuOption(text, playback_option_click));
        });

        this.playback_link.addEventListener('click', () => {
            this.playback_options.style.display = 'block';
            this.playback_value.style.display = 'none';
            this.captions_link.style.display = 'none';
            this.quality_link.style.display = 'none';
        });

        const captions_option_click = (e) => {
            console.log(e.target.textContent);
        };

        this.captions_options.appendChild(addMenuOption('Disabled', null));
        Array.from(this.video.textTracks).map((track) => {
            this.captions_options.appendChild(addMenuOption(track.label, null));
        });

        this.captions_link.addEventListener('click', () => {
            this.captions_options.style.display = 'block';
            this.captions_value.style.display = 'none';
            this.playback_link.style.display = 'none';
            this.quality_link.style.display = 'none';
        });
    }
}