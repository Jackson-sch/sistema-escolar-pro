import React from "react";

// Polyfill React 19 internals for @react-pdf/renderer in Next.js 16 Server environment.
//
// Next.js route handlers (src/app/api/documentos/*) resolve "react" with the
// "react-server" export condition, whose build (react.react-server.*) ONLY exports
// __SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE — it does NOT export
// __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.
//
// @react-pdf/reconciler v2 (bundled inside @react-pdf/renderer 4.x) reads
// React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE and expects the
// React 19.2 internals shape (H/S/A/T/actQueue/...). Without it, rendering crashes with
// "TypeError: Cannot read properties of undefined (reading 'S')" (reconciler-33) or
// fails later in scheduling when actQueue is undefined. We install that shape here,
// mirroring the initial values React's own client build starts with.
const R = React as any;
if (R) {
  const client =
    R.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  if (!client) {
    const internals = {
      // React 19.2 short-name internals (reconciler-33 assigns these itself during
      // rendering, so null initial values are fine — React's client build does the same).
      H: null, // ReactCurrentDispatcher
      S: null, // ReactCurrentOwner
      A: null, // ReactCurrentBatchConfig
      T: null, // ReactCurrentActQueue (transitions)
      // Must be null (NOT undefined): the reconciler checks `null !== actQueue` and then
      // calls `actQueue.push(...)`, so undefined would crash the scheduler path.
      actQueue: null,
      asyncTransitions: 0,
      isBatchingLegacy: false,
      didScheduleLegacyUpdate: false,
      didUsePromise: false,
      thrownErrors: [] as unknown[],
      getCurrentStack: null,
      recentlyCreatedOwnerStacks: 0,
    } as any;

    R.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = internals;

    // Legacy long-form names expected by the older React 18 reconciler build
    // (reconciler-23) in case it is ever selected.
    internals.ReactCurrentDispatcher = { current: null };
    internals.ReactCurrentOwner = { current: null };
    internals.ReactCurrentBatchConfig = { transition: null };
    if (!R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = internals;
    }
  } else {
    // Client internals already exist (default "react" build). Just ensure the
    // reconciler-critical keys are defined. The long-form legacy names
    // (ReactCurrentDispatcher/...) are only read by the React ≤18 reconciler build
    // (reconciler-23), which is never selected with React 19.x, so they are skipped here.
    const ensure = (key: string, value: unknown) => {
      if ((client as any)[key] === undefined) (client as any)[key] = value;
    };
    ensure("H", null);
    ensure("S", null);
    ensure("A", null);
    ensure("T", null);
    ensure("actQueue", null);
    ensure("asyncTransitions", 0);
    ensure("isBatchingLegacy", false);
    ensure("didScheduleLegacyUpdate", false);
    ensure("didUsePromise", false);
    ensure("thrownErrors", []);
    ensure("getCurrentStack", null);
    ensure("recentlyCreatedOwnerStacks", 0);
    if (!R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = client;
    }
  }
}
