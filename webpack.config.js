const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        index: ['./src/index.js', './src/database.js', './src/loginForms.js', './src/auth.js', './src/poll.js', './src/pollContainer.js', './src/vote.js', './src/errorMessage.js'],
        polls: ['./src/polls.js', './src/database.js', './src/loginForms.js', './src/auth.js', './src/poll.js', './src/pollContainer.js', './src/vote.js', './src/errorMessage.js'],
        userDash: ['./src/userDash.js', './src/database.js', './src/loginForms.js', './src/auth.js', './src/poll.js', './src/pollContainer.js', './src/vote.js', './src/errorMessage.js']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    watch: true
};
