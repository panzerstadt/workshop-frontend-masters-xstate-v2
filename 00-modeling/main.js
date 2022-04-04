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
const machine = {
    initial: "loading",
    states: {
        loading: {
            on: {
                LOADED: 'playing',
                action: () => {
                    alert("wow imma start playing yowza")
                    document.getElementById("button-loading").hidden = true
                }
            }
        },
        playing: {
            on: {
                PAUSE: 'pausing',
                action: () => { alert("i pausing har") }
            }
        },
        pausing: {
            on: {
                PLAY: "playing",
                action: () => { alert("imma continue playing!") }
            }
        }
    }
}

const thing3 = {
    state: machine.initial,
    send(event) {
        const nextState = machine.states[this.state].on?.[event.type]

        if (nextState) {
            machine.states[this.state].on?.action?.() // fire side effect if exists
            console.log("next state: ", nextState);
            this.state = nextState;
        }
    }
}
window.thing3 = thing3;
// while playing, thing3.send({type: "PAUSE", action: () => {alert("WOW")}})