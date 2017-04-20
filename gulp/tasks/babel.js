'use strict';
const fs = require('fs');
const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

let task = () => {
    let babelrc = JSON.parse(fs.readFileSync('.babelrc', 'utf8') || '{}');

    return gulp.src(['./**/*.js.flow', '!node_modules', '!node_modules/**'])
        .pipe(sourcemaps.init())
        .pipe(babel(babelrc))
        .pipe(rename(path => {
            // Fix file extension for double ext files (.js.flow)
            path.extname = path.basename.endsWith('.js') ? '' : '.js';
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
};

module.exports = [['eslint'], task];
