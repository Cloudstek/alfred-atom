'use strict';
const gulp = require('gulp');
const eslint = require('gulp-eslint');

let task = () => {
    return gulp.src(['./**/*.js.flow', './tests/*.js', '!node_modules', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format('node_modules/eslint-formatter-pretty'))
        .pipe(eslint.failAfterError());
};

module.exports = task;
