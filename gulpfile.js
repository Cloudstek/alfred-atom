const gulp = require('./gulp')([
    'babel',
    'eslint',
    'watch'
]);

gulp.task('default', [
    'babel'
]);
