const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const useref = require('gulp-useref');
const fileinclude = require('gulp-file-include');
const del = require('del');
const gulpif = require('gulp-if');
const size = require('gulp-size');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');

gulp.task('serve', ['html:serve', 'styles', 'scripts', 'images'], () => {
    browserSync.init({
        server: { 
            baseDir: ['.tmp', 'app'],
        }
    });

    gulp.watch('app/images/**/*').on('change', browserSync.reload);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch([
        'app/*.html',
        'app/components/*.html',
        'app/components/**/*.html'
    ], ['html:serve']);
});
    
gulp.task('styles', () => {
    return gulp.src('app/styles/*.scss')
        .pipe(sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', sass.logError))
        .pipe(autoprefixer({ browsers: ['last 3 versions'] }))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(browserSync.stream());
});

gulp.task('scripts', () => {
    return gulp.src('app/scripts/*.js')
        .pipe(babel({ presets: ['env'] }))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(browserSync.stream());
});

gulp.task('images', () => {
    return gulp.src('app/images/*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            optimizationLevel: 6,
            svgoPlugins: [{ cleanupIDs: false }]
        }))
        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.stream());
});

gulp.task('html', ['styles', 'scripts'], () => {
    return gulp.src('app/*.html')
        .pipe(useref({searchPath: ['.tmp', 'app', '.']}))
        .pipe(gulpif(/\.js$/, uglify({ 
            compress: { drop_console: true }
        })))
        .pipe(gulpif(/\.css$/, cssnano({ 
            safe: true, 
            autoprefixer: false 
        })))
        .pipe(fileinclude({ 
            prefix: '@@',
            basepath: '@file' 
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            processConditionalComments: true,
            removeComments: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeRedundantAttributes: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('html:serve', ['styles', 'scripts'], () => {
    return gulp.src('app/*.html')
        .pipe(fileinclude({ 
            prefix: '@@',
            basepath: '@file' 
        }))
        .pipe(useref({searchPath: ['.tmp', 'app', '.']}))
        .pipe(gulp.dest('.tmp'))
        .pipe(browserSync.stream());
});

gulp.task('extras', () => {
    return gulp.src([
        'app/*.*',
        '!app/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});
    
gulp.task('build', ['html', 'images', 'extras'], () => {
    return gulp.src('dist/**/*')
        .pipe(size({ title: 'build', gzip: true }));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('default', ['clean'], () => {
    gulp.start('build');
});