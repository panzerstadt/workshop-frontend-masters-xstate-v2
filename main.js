import './style.css';
import { createMachine } from 'xstate';



// state: { status: 'idle' }
// event: { type: "FETCH" }

// like a reducer
// given current state + event -> next state
function transition(state, event) {
    switch (state.status) {
        case 'idle':
            if (event.type === 'FETCH') {
                console.log("starting to fetch data");
                return { status: "loading" };
            }
            return state;
        case 'loading':
            // other behaviour
            return state;
        default:
            console.log("nothing happens");
            return state;
    }
}

window.transition = transition