const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const useref = require('gulp-useref');
const del = require('del');
const gulpif = require('gulp-if');
const size = require('gulp-size');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');

gulp.task('serve', ['styles', 'scripts', 'images'], () => {
    browserSync.init({ server: { baseDir: ['.tmp', 'app'] } });
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/*.html').on('change', browserSync.reload);
    gulp.watch('app/images/**/*').on('change', browserSync.reload);
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
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{ cleanupIDs: false }]
        }))
        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.stream());
});
  
gulp.task('html', ['styles', 'scripts'], () => {
    return gulp.src('app/*.html')
    .pipe(useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe(gulpif(/\.js$/, uglify({ compress: {drop_console: true }})))
    .pipe(gulpif(/\.css$/, cssnano({ safe: true, autoprefixer: false })))
    .pipe(gulp.dest('dist'))
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
    return gulp.src('dist/**/*').pipe(size({ title: 'build', gzip: true }));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('default', ['clean'], () => {
    gulp.start('build');
});