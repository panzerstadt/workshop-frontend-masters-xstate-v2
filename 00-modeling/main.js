import '../style.css';

// Create a state machine transition function either using:
// - a switch statement (or nested switch statements)
// - or an object (transition lookup table)

// Also, come up with a simple way to "interpret" it, and
// make it an object that you can `.send(...)` events to.

// minimal
const transition = (state, event) => {
    switch (state.status) {
        case 'loading':
            if (event.type === 'LOADED') return { status: "playing" }
            return state
        case 'playing':
            if (event.type === 'PAUSE') return { status: "pausing" }
            return state
        case 'pausing':
            if (event.type === 'PLAY') return { status: "playing" }
            return state
        default:
            return state
    }
}

// minimal
const thing = {
    state: { status: "loading" },
    send(event) {
        this.state = transition(this.state, event)
        console.log("new state: ", this.state)
    }
}

window.thing = thing
// diagram: https://excalidraw.com/#json=jrzOKDhbI4sykOSPKoTTa,lmIn4Aza0Xsgqtj4MMR-Xw

// with action (sync) -> while transitioning, also do this
// also called side effects
const transitionWithAction = (state, event) => {
    switch (state.status) {
        case 'loading':
            if (event.type === 'LOADED') {
                event.action?.();  // side effect
                return { status: "playing" };
            }
            return state
        case 'playing':
            if (event.type === 'PAUSE') {
                event.action?.();
                return { status: "pausing" };
            }
            return state
        case 'pausing':
            if (event.type === 'PLAY') {
                event.action?.();
                return { status: "playing" };
            }
            return state;
        default:
            return state;
    }
}
const thing2 = {
    state: { status: "loading" },
    send(event) {
        this.state = transitionWithAction(this.state, event);
        console.log("new state: ", this.state);
    }
}
window.thing2 = thing2;
// now you can execute arbitrary actions while transitioning
// thing2.send({type: "PAUSE", action: () => {alert("yo")}})


// object map style, minimal
let timer;
let songProgress = 0;
let songLength = 0;
let songName = 'Some Song'
const newSong = () => {
    songLength = Math.max(Math.floor(Math.random() * 30), 10);
    songName = Array.from(songName).reverse().join("");
    songProgress = 0;

    document.getElementById("scrubber").max = songLength
    document.getElementById("elapsed").innerHTML = songProgress
    document.getElementById("length").innerHTML = " / " + songLength
    document.getElementById("song-title").innerHTML = songName
}
const tick = () => {
    timer = setInterval(() => {
        songProgress++;
        if (songProgress > songLength) {
            thing3.send({ type: "NEXT" })
        }
        document.getElementById("elapsed").innerHTML = songProgress;
        document.getElementById("scrubber").value = songProgress;
    }, 1000)
}
const stop = () => {
    clearInterval(timer)
}


const machine = {
    initial: "loading",
    states: {
        loading: {
            on: {
                LOADED: {
                    target: 'playing',
                    action: () => {
                        alert("wow imma start playing yowza")
                        document.getElementById("button-loading").hidden = true;
                        newSong()
                        tick()
                    }
                },

            }
        },
        playing: {
            on: {
                PAUSE: {
                    target: 'pausing',
                    action: () => {
                        stop()
                    }
                },
                NEXT: {
                    target: 'playing',
                    action: () => {
                        newSong()
                    }
                },
                SCRUB_START: {
                    target: 'scrubbing',
                    action: () => {
                        stop()
                    }
                }
            }
        },
        scrubbing: {
            on: {
                SCRUB_END: {
                    target: 'playing', // could also 'remember' last player state?
                    action: (payload) => {
                        if (payload.progress) {
                            songProgress = payload.progress
                            document.getElementById("elapsed").innerHTML = songProgress
                        }
                        tick()
                    }
                },
            }
        },
        pausing: {
            on: {
                PLAY: {
                    target: "playing",
                    action: () => {
                        tick()
                    }
                },
                NEXT: {
                    target: 'playing',
                    action: () => {
                        newSong()
                    }
                },
                SCRUB_START: {
                    target: 'scrubbing',
                    action: () => {
                        stop()
                    }
                }
            }
        },
    }
}

const thing3 = {
    state: machine.initial,
    send(event) {
        const nextState = machine.states[this.state].on?.[event.type]

        if (nextState) {
            // fire side effect if exists
            nextState.action?.(event.payload)

            // log stuff
            console.log("event:", event.type, " next state:", nextState);
            document.getElementById('state').innerHTML = nextState.target;

            // update state in machine
            this.state = nextState.target;
        }
    }
}
window.thing3 = thing3;
document.getElementById('state').innerHTML = thing3.state;
// while playing, thing3.send({type: "PAUSE", action: () => {alert("WOW")}})