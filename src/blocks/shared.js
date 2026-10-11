let state = null;
let registerHandler = null;
let getActiveHandlerCount = null;
let raiseErrorInternal = null;

export function init(shared) {
  if (shared) {
    state = shared.state;
    registerHandler = shared.registerHandler;
    getActiveHandlerCount = shared.getActiveHandlerCount;
    raiseErrorInternal = shared.raiseErrorInternal;
  }
}

export { state, registerHandler, getActiveHandlerCount, raiseErrorInternal };
