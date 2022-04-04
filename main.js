import './style.css';
import { createMachine } from 'xstate';

/**
 * switch statement style
 */

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

// TODO: doesn't this also work the same?
function eventFirstTransition(state, event) {
    switch (event.type) {
        case "FETCH":
            if (state.status === 'idle') {
                console.log("starting to fetch data");
                return { status: "loading" };
            }
        default:
            return state
    }
}
window.eventTransition = eventFirstTransition

/**
 * object lookup style
 * 
 * simple rules
 * - states must have status
 * - events must have types
 */
const machine = {
    initial: "idle",
    states: {
        idle: {
            on: {
                FETCH: "loading"
            }
        },
        loading: {}
    }
}
function machineTransition(state, event) {
    const nextStatus = machine.states[state.status].on?.[event.type] ?? state.status

    return {
        status: nextStatus
    }
}
/**
 * try:
 * machineTransition({ status: machine.initial },{ type:"FETCH" })
 */
window.machine = machine
window.machineTransition = machineTransition


// this is the same thing, but flipped.
// it all boils down to english grammar.
const eventMachine = {
    initial: "DONE",
    events: {
        FETCH: {
            whileStatus: {
                loading: "DONE",
                idle: "CANCEL"
            }
        },
        DONE: {
            whileStatus: {
                idle: "FETCH"
            }
        }
    }
}
function eventMachineTransition(state, event) {
    const nextEvent = eventMachine.events[event.type].whileStatus?.[state.status] ?? event.type

    return {
        event: nextEvent
    }
}
window.eventMachineTransition = eventMachineTransition