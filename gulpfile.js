'use strict';
var gulp = require('gulp');
var del = require('del');
var path = require('path');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');

// Load plugins
var $ = require('gulp-load-plugins')();

// Styles
gulp.task('styles', function () {
    return gulp.src('app/styles/main.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());
});

// HTML
gulp.task('html', function () {
    return gulp.src('app/*.html')
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Clean
gulp.task('clean', function (cb) {
    cb(del.sync(['dist/styles', 'dist/scripts', 'dist/images']));
});

// Bundle
gulp.task('bundle', ['styles'], function(){
    var assets = $.useref.assets();
    return gulp.src('app/*.html')
               .pipe(assets)
               .pipe(assets.restore())
               .pipe($.useref())
               .pipe(gulp.dest('dist'));
});

gulp.task('javascript', function() {
  var bundler = browserify({
      entries: ['./app/scripts/main.js'],
      debug: true
  })

  var bundle = function() {
    return bundler
      .bundle()
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/scripts/'));
  };

  return bundle();
});


// Webserver
gulp.task('serve', function () {
    gulp.src('./dist')
        .pipe($.webserver({
            livereload: true,
            port: 9000
        }));
});
//
// Robots.txt and favicon.ico
gulp.task('extras', function () {
    return gulp.src(['app/*.txt', 'app/*.ico'])
        .pipe(gulp.dest('dist/'))
        .pipe($.size());
});

// Watch
gulp.task('watch', ['build', 'serve'], function () {
    // Watch .html files
    gulp.watch('app/*.html', ['html']);
    // Watch .js files
    gulp.watch(['app/scripts/**/*.js'], ['javascript']);
    // Watch .scss files
    gulp.watch('app/styles/**/*.scss', ['styles']);
    // Watch image files
    gulp.watch('app/images/**/*', ['images']);
});

// Build
gulp.task('build', ['html', 'bundle', 'javascript', 'images', 'extras']);

// Default task
gulp.task('default', ['clean', 'build']);
