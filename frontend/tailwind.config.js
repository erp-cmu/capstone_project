/** @type {import('tailwindcss').Config} */
import preset from "frappe-ui/tailwind";

export default {
	presets: [preset],
	content: [
		"./index.html",
		"./src/**/*.{vue,js,ts,jsx,tsx}",
		"./node_modules/frappe-ui/src/components/**/*.{vue,js,jsx,ts,tsx}",
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
