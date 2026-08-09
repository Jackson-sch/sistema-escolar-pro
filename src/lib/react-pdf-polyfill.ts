import React from "react";

// Polyfill React 19 internals for @react-pdf/renderer in Next.js 16 Server environment
const R = React as any;
if (R) {
  // Check all possible internal object names in React 18 & React 19 (client, server, dev/warn)
  const internals =
    R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    R.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
    R.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
    R.__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    R.__SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    {};

  if (!R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = internals;
  }

  const secret = R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  if (secret) {
    if (secret.S === undefined) secret.S = internals.S ?? null;
    if (secret.H === undefined) secret.H = internals.H ?? null;
    if (secret.A === undefined) secret.A = internals.A ?? null;
    if (secret.T === undefined) secret.T = internals.T ?? null;

    if (!secret.ReactCurrentDispatcher) {
      secret.ReactCurrentDispatcher =
        secret.H ||
        secret.S ||
        internals.ReactCurrentDispatcher ||
        { current: null };
    }
    if (!secret.ReactCurrentOwner) {
      secret.ReactCurrentOwner =
        secret.A ||
        internals.ReactCurrentOwner ||
        { current: null };
    }
    if (!secret.ReactCurrentBatchConfig) {
      secret.ReactCurrentBatchConfig =
        secret.T ||
        internals.ReactCurrentBatchConfig ||
        { transition: null };
    }
  }
}
