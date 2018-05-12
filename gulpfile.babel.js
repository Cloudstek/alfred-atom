const fs = require('fs');
const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');

let babelrc = JSON.parse(fs.readFileSync('.babelrc', 'utf8') || '{}');

function babelTask() {
    return gulp.src(['./**/*.js.flow', '!node_modules', '!node_modules/**'])
        .pipe(sourcemaps.init())
        .pipe(babel(babelrc))
        .pipe(rename(path => {
            // Fix file extension for double ext files (.js.flow)
            path.extname = path.basename.endsWith('.js') ? '' : '.js';
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
}

function eslintTask() {
    return gulp.src(['./**/*.js.flow', './tests/*.js', '!node_modules', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format('node_modules/eslint-formatter-pretty'))
        .pipe(eslint.failAfterError());
}

function watchTask() {
    gulp.watch(['./**/*.js.flow', '!node_modules', '!node_modules/**'], babelTask);
}

gulp.task('babel', babelTask);
gulp.task('eslint', eslintTask);
gulp.task('default', gulp.series('eslint', 'babel'));
gulp.task('watch', gulp.series('default', watchTask));
