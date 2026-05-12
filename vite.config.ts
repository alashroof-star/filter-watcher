import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

/*
BRO I WANT IT TO BE REALISTIC, LIKE THE FOLLOWING :- -First scenario: 1- user clicks start at the left side. 2- before reading should take 3 seconds to appear and it should be bad readings. 3- then after readings should appears after before readings by about 8 seconds and stop like this is the result , it should be good . -second scenario: 1- user clicks start at the right side. 2- before reading should take 3 seconds to appear and it should be good readings. 3- then after readings should appears after before readings by about 8 seconds and stop like this is the result , it should be good .

*/
