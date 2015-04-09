var gulp = require('gulp');
var watch = require('gulp-watch');

gulp.task('lint', function () {
    var jshint = require('gulp-jshint');
    return gulp.src(['index.js', 'test/*.js', 'gulpfile.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('test', function () {
    var mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read: false }).pipe(mocha());
});

gulp.task('watch', function() {
  gulp.watch('**/*.js', ['default']);
});

gulp.task('default', ['lint', 'test']);
