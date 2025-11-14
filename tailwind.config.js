module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './node_modules/flowbite/**/*.js',
    ],
    plugins: [
        require('flowbite/plugin'), // เพิ่ม Flowbite plugin
    ],
};
