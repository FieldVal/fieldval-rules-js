var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var gulpImports = require('gulp-imports');
var nodemon = require('gulp-nodemon');
var path = require('path');

var mocha = require('gulp-mocha');

var docs_to_json = require('sa-docs-to-json');

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
    .on('error', gutil.log)
    .on('end', function(){
        return gulp.start('test');
    });
});

gulp.task('test', function(){
    gulp.src(['test/test.js'])
    .pipe(mocha());
});

gulp.task('docs', function() {
    return gulp.src('./docs_src/*.json')
    .pipe(docs_to_json())
    .pipe(gulp.dest('./docs/'))
});

gulp.task('default', function(){
    gulp.start('js','docs');
    gulp.watch(['src/**/*.js'], ['js']);
    gulp.watch(['test/**/*.js'], ['test']);
    gulp.watch(['docs_src/**/*'], ['docs']);
});