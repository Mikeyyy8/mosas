import { generateReactHelpers } from "@uploadthing/react";
import { API_BASE_URL } from "@/lib/axios";

// The server's file router lives in server/WebStore/lib/uploadthing.js. It is plain
// JS, so there is no router type to import — the endpoint name is checked at runtime.
const UPLOADTHING_URL = `${API_BASE_URL}/uploadthing`;

/**
 * Two things are load-bearing here, and both only matter once the API is on its own
 * domain — locally the Vite proxy hides the need for either.
 *
 * 1. The url is absolute. A bare "/api/uploadthing" resolves against
 *    window.location.origin, which in production is the *static* host, where no such
 *    route exists — so every admin image upload 404s.
 *
 * 2. The custom fetch. uploadthing defaults to globalThis.fetch, which omits cookies
 *    on cross-origin requests. The route's middleware authorises the upload from the
 *    accessToken cookie, so without `credentials: "include"` it sees no token and
 *    rejects with FORBIDDEN. Applied only to our own API — the request that carries
 *    the file itself goes to uploadthing.com and has no business receiving our
 *    session cookie.
 */
export const { useUploadThing } = generateReactHelpers({
  url: UPLOADTHING_URL,
  fetch: (input, init) => {
    const target = input instanceof Request ? input.url : input.toString();
    return target.startsWith(UPLOADTHING_URL)
      ? fetch(input, { ...init, credentials: "include" })
      : fetch(input, init);
  },
});

export const IMAGE_ENDPOINT = "imageUploader";
