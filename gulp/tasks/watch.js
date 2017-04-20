'use strict';
const gulp = require('gulp');

let task = done => {
    gulp.watch(['./**/*.js.flow', '!node_modules', '!node_modules/**'], ['babel']);
};

module.exports = [['default'], task];
