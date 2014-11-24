var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var gulpImports = require('gulp-imports');
var nodemon = require('gulp-nodemon');
var path = require('path');

var mocha = require('gulp-mocha');

gulp.task('js', function(){
    return gulp.src([
        'src/FVRule_bower.js'
    ])
    .pipe(gulpImports())
    .pipe(concat('fieldval-rules.js'))
    .pipe(gulp.dest('./'))
    .pipe(uglify())
    .pipe(concat('fieldval-rules.min.js'))
    .pipe(gulp.dest('./'))
    .on('error', gutil.log);
})

gulp.task('test', function(){
    gulp.src(['test/test.js'])
    .pipe(mocha());
});

gulp.task('default', function(){
    gulp.start('js','test');
    gulp.watch(['src/**/*.js'], ['js','test']);
    gulp.watch(['test/**/*.js'], ['test']);
});