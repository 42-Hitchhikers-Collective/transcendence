import { defineConfig } from "vite";
/* 
  Switched to REACT-SWC: it builds faster and good for game development.
  If you want to switch back to the default babel plugin:
  - replace '@vitejs/plugin-react-swc' with '@vitejs/plugin-react'
  - remove the swc dependency from package.json
  The only reason to switch to the babel one is id we need babel specific feats like React Compiler or
  other specific plugins that most certainly won't be needed in our case.
*/
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      hmr:
        mode === "development" // sets Vite's HMR to default or 443 depending where it is being run
          ? true // if true, it means we are running the frontend locally, this enables HMR when testing frontedn via "npm run dev"
          : { protocol: "wss", clientPort: 443 }, // used for https for docker deployment - left as previously set up from @Welf
    },
  };
});
