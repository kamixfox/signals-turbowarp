import { state, getActiveHandlerCount, raiseErrorInternal, runtime } from "./shared.js";

export function fireAction(args) {
  const name = args.NAME;
  const count = getActiveHandlerCount(state.actionHandlers, name);

  if (count === 0) {
    raiseErrorInternal("SignalsError", "This action/query has no handler.");
    return;
  }
  if (count >= 2) {
    raiseErrorInternal("SignalsError", "Action has multiple handlers.");
    return;
  }

  if (!state.actionQueues.has(name)) {
    state.actionQueues.set(name, []);
  }
  state.actionQueues.get(name).push(args.DATA);
  try {
    if (runtime) {
      runtime.startHats("signalsextension_whenActionReceived");
    }
  } catch (e) {
    raiseErrorInternal("SignalsError", e && e.message ? e.message : String(e));
  }
}

export function querySignal(args) {
  const name = args.NAME;
  const count = getActiveHandlerCount(state.queryHandlers, name);

  if (count === 0) {
    raiseErrorInternal("SignalsError", "This action/query has no handler.");
    return Promise.resolve("");
  }
  if (count >= 2) {
    raiseErrorInternal("SignalsError", "Query has multiple handlers.");
    return Promise.resolve("");
  }

  const queryId = ++state.queryCounter;
  if (!state.queryQueues.has(name)) {
    state.queryQueues.set(name, []);
  }
  state.queryQueues.get(name).push({ id: queryId, data: args.DATA });

  try {
    if (runtime) {
      runtime.startHats("signalsextension_whenQueryRequested");
    }
  } catch (e) {
    raiseErrorInternal("SignalsError", e && e.message ? e.message : String(e));
  }

  return new Promise((resolve) => {
    state.queryResolvers.set(queryId, resolve);

    setTimeout(() => {
      if (state.queryResolvers.has(queryId)) {
        state.queryResolvers.delete(queryId);
        raiseErrorInternal("SignalsError", "Query did not return a value.");
        resolve("");
      }
    }, 2000);
  });
}

export function emitEvent(args) {
  const name = args.NAME;
  if (!state.eventQueues.has(name)) {
    state.eventQueues.set(name, []);
  }
  state.eventQueues.get(name).push(args.DATA);
  try {
    if (runtime) {
      runtime.startHats("signalsextension_whenEventEmitted");
    }
  } catch (e) {
    raiseErrorInternal("SignalsError", e && e.message ? e.message : String(e));
  }
}

export function getSignalData(args, util) {
  if (state.threadData.has(util.thread)) {
    return state.threadData.get(util.thread);
  }
  return state.currentData !== null ? state.currentData : "";
}
