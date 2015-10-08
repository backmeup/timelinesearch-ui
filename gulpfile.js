var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var concatCss = require('gulp-concat-css');

gulp.task('unminified', function() {
  gulp.src('src/*')
    .pipe(concat('spatiotemporal-search.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('no-deps', function() {
  gulp.src(['vendor/simplehistogram/*.js', 'vendor/dateflipper/*.js', 'src/*'])
    .pipe(concat('spatiotemporal-search.no-deps.min.js'))
    .pipe(uglify('spatiotemporal-search.no-deps.min.js'))
    .pipe(gulp.dest('dist'));
    
  gulp.src(['vendor/simplehistogram/*.css', 'vendor/dateflipper/*.css', 'index.css'])
    .pipe(concatCss('spatiotemporal-search.no-deps.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', function() {
  gulp.src('src/*')
    .pipe(concat('spatiotemporal-search.min.js'))
    .pipe(uglify('spatiotemporal-search.min.js'))
    .pipe(gulp.dest('dist'));
});
