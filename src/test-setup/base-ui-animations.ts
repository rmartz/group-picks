/**
 * Disable Base UI's animation-aware unmounting in happy-dom test environments.
 *
 * Base UI decides whether the runtime can animate by feature-detecting
 * `Element.getAnimations()` (see `useAnimationsFinished`). When that method is
 * absent it unmounts an exiting element synchronously; when it is present it
 * defers the unmount until the element's animations settle, which happens
 * asynchronously across an animation frame and a promise chain.
 *
 * happy-dom implemented `Element.getAnimations()` in 20.14.0. Under happy-dom
 * the returned animations never actually run, so the deferred unmount does not
 * complete within a synchronous test body — leaving the outgoing element in the
 * DOM alongside the incoming one. Role-based queries then match both, e.g.
 * `getByRole("tabpanel")` throwing "Found multiple elements" after a tab switch.
 *
 * Base UI exposes this global for exactly this situation: it "disables
 * animation-related code, even if supported by the runtime environment",
 * restoring the synchronous unmount that component tests assert against.
 */
declare global {
  var BASE_UI_ANIMATIONS_DISABLED: boolean;
}

globalThis.BASE_UI_ANIMATIONS_DISABLED = true;

export {};
