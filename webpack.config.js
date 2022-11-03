const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        index: ['./src/index.js', './src/database.js', './src/loginForms.js'],
        polls: ['./src/polls.js', './src/database.js'],
        accountPage: ['./src/accountPage.js', './src/database.js']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    watch: true
};
