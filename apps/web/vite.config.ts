import path from "path";
import tailwindcss from "@tailwindcss/vite";
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
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        // This tells Vite: whenever you see "@", look in the "src" folder
        "@": path.resolve(__dirname, "./src"),
         "src": path.resolve(__dirname, "./src"),
      },
    },
  };
});
