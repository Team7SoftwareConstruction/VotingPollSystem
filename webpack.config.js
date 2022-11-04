const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        index: ['./src/index.js', './src/database.js', './src/loginForms.js', './src/auth.js'],
        polls: ['./src/polls.js', './src/database.js', './src/loginForms.js', './src/auth.js'],
        accountPage: ['./src/accountPage.js', './src/database.js', './src/loginForms.js', './src/auth.js']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    watch: true
};
