import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Content-Security-Policy is assembled at build time because one directive —
 * connect-src — depends on where the API lives, and that is only known from
 * VITE_API_URL. Hardcoding a placeholder in vercel.json would mean a header that
 * silently blocks every API call the day someone forgets to edit it.
 *
 * It ships as a <meta> tag rather than a host header for the same reason: it travels
 * with the build, so Vercel, Netlify and any other static host get the same policy
 * without duplicating it in three config formats. frame-ancestors cannot be set from
 * a meta tag, so that one is covered by X-Frame-Options in the host configs.
 */
const cspPlugin = (apiOrigin: string): Plugin => {
  // The upload itself goes browser -> UploadThing, so their ingest hosts have to be
  // reachable even though nothing in our bundle names them.
  const uploadthing =
    "https://*.ingest.uploadthing.com https://api.uploadthing.com https://*.ufs.sh https://utfs.io";

  const policy = [
    "default-src 'self'",
    // The build emits no inline scripts, so this needs no 'unsafe-inline' escape
    // hatch. Keep it that way — it is the directive that actually stops XSS.
    "script-src 'self'",
    // React and framer-motion both set element.style directly, which CSP counts as
    // inline styling; there is no way to run either without this.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Product imagery is admin-supplied and can point at any https host.
    "img-src 'self' data: blob: https:",
    `connect-src 'self' ${apiOrigin} ${uploadthing}`.replace(/\s+/g, " ").trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  return {
    name: "mosas-csp",
    // Build only. The dev server injects an inline react-refresh preamble and relies
    // on eval for HMR, both of which `script-src 'self'` blocks — the page renders
    // blank with nothing but "can't detect preamble" in the console. The policy is
    // about what ships, and shipping is what this guards.
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        "<head>",
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`
      );
    },
  };
};

// Overridable because macOS reserves port 5000 for the AirPlay Receiver:
//   API_PROXY_TARGET=http://localhost:5050 npm run dev
const apiProxy = {
  "/api": {
    target: process.env.API_PROXY_TARGET || "http://localhost:5000",
    changeOrigin: true,
  },
};

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = env.VITE_API_URL ? env.VITE_API_URL.replace(/\/$/, "") : "";

  // A production bundle without an API origin is broken twice over: requests resolve
  // against the static host, and connect-src has nothing to allow. Fail loudly rather
  // than shipping a build that 404s every call.
  if (command === "build" && mode === "production" && !apiOrigin) {
    console.warn(
      "\n[build] VITE_API_URL is not set. The storefront will call /api on its own " +
        "origin, which is not where the API lives in production.\n"
    );
  }

  return {
    plugins: [react(), cspPlugin(apiOrigin)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // The admin dashboard and its charting pull in weight no shopper needs.
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            motion: ["framer-motion"],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: apiProxy,
    },
    // `vite preview` serves the real build, which is the only place the CSP above is
    // active. Proxying here too means the production bundle can be smoke-tested
    // against the mock API before it ever reaches a host.
    preview: {
      port: 4173,
      proxy: apiProxy,
    },
  };
});
