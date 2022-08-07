const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    concatCss = require('gulp-concat-css'),
    browserSync = require('browser-sync'),
    rollup = require('gulp-rollup');




gulp.task('scripts', gulp.series(function() {
    return gulp.src('./src/js/**/*.js')
        .pipe(rollup({
            input: './src/js/index.js',
            output: {
                format: 'iife'
            }
      }))
      .pipe(gulp.dest('dist/js'))
      .pipe(rename({ suffix: '.min' }))
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'))
      .pipe(browserSync.reload({stream:true}))

}));
// Styles
gulp.task('styles', gulp.series(function() {
  return gulp.src('src/css/*.css')
    .pipe(concatCss('bundle.css'))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ios 6', 'android 4'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream())
}));

// Themes
gulp.task('themes', gulp.series(function() {
    return gulp.src('src/css/themes/*.css')
        .pipe(gulp.dest('dist/css/themes'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css/themes'))
        .pipe(browserSync.reload({stream:true}))
}));

// Images
gulp.task('images', gulp.series(function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({stream:true}))
}));

// HTML
gulp.task('html', gulp.series(function() {
    return gulp.src('src/**/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream:true}))
}));

//Fonts
gulp.task('fonts', gulp.series(function() {
    return gulp.src('src/fonts/*')
        .pipe(gulp.dest('dist/fonts'))
        .pipe(browserSync.reload({stream:true}))
}));

// Clean
gulp.task('clean', gulp.series(function() {
    return gulp.src(['dist/*'], {read: false})
        .pipe(clean());
})); 

// Default task
gulp.task('default', gulp.series('clean', gulp.parallel('html', 'styles', 'themes', 'scripts', 'images', 'fonts')));

// Watch
gulp.task('watch', gulp.series(function() {
    browserSync.init({
        port: 8181,
        notify: false,
        server: {
            baseDir: 'dist',
        },
    })

    gulp.watch('src/css/themes/*.css', gulp.series('themes'));
    gulp.watch('src/js/**/*.js', gulp.series('scripts'));
    gulp.watch('src/images/**/*', gulp.series('images'));
    gulp.watch('src/fonts/*', gulp.series('fonts'));
    gulp.watch('src/*.html', gulp.series('html'));
    gulp.watch('src/css/*.css', gulp.series('styles'));
}));
