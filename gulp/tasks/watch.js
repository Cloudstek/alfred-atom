var gulp = require('gulp');

var task = function (done) {
    gulp.watch(['./**/*.js.flow', '!node_modules', '!node_modules/**'], ['babel']);
};

module.exports = [['default'], task];
