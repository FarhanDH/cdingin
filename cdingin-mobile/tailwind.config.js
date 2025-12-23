/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#057895",
                secondary: "#01a2c6",
                destructive: "#f92f2f",
            },
            fontFamily: {
                sans: ["Rubik_400Regular"],
            },
        },
    },
    plugins: [],
}
