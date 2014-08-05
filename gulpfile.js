var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var gulpImports = require('gulp-imports');
var nodemon = require('gulp-nodemon');
var path = require('path');

gulp.task('js', function(){
    return gulp.src([
        'src/ValidationRule_bower.js'
    ])
    .pipe(gulpImports())
    .pipe(concat('fieldval-rules.js'))
    .pipe(gulp.dest('./'))
    .pipe(uglify())
    .pipe(concat('fieldval-rules.min.js'))
    .pipe(gulp.dest('./'))
    .on('error', gutil.log);
})

gulp.task('default', function(){
    gulp.watch(['src/**/*.js'], ['js']);
});