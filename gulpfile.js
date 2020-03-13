function defaultTask(cb) {
    // place code for your default task here
    cb();
  }
  
  exports.default = defaultTask

var gulp = require('gulp');
var sourcemap = require('gulp-sourcemaps');   //записывает исходный scss для просмотра в devtools
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');  //ошибки выводит после выполнения, не прерывая
var postcss = require('gulp-postcss');  //преобразование css для браузеров, в него встраиваем автопрефиксер
var autoprefixer = require('autoprefixer');  //добавляет старые св-ва браузеров
var server = require('browser-sync').create();  //локальный сервер
var rename = require('gulp-rename');  //решает проблему с переименованием файлов
var csso = require('gulp-csso');  //минификатор css
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var del = require('del');

gulp.task('clean', function () {
  return del('build');
});

gulp.task('css', function () {
    return gulp.src('source/sass/style.scss')
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(sass())
        .pipe(postcss([autoprefixer()]))
        .pipe(csso())
        .pipe(rename('style.min.css'))
        .pipe(sourcemap.write('.'))
        .pipe(gulp.dest('build/css'));
    
  });

  gulp.task('refresh', function (done) {
    server.reload();
    done();
  });

  gulp.task('image', function () {
    return gulp.src('source/img/**/*.{png,jpg,svg}')
      .pipe(imagemin([
        imagemin.optipng({optimizationLevel: 1}),  //16 прогонов
        imagemin.jpegtran({progressive: true}),
        imagemin.svgo()
      ]))
      .pipe(gulp.dest('source/img'));
  });

  gulp.task('sprite', function () {
    return gulp.src('source/img/icon-*.svg')
      .pipe(svgstore({inlineSvg: true}))
      .pipe(rename('sprite.svg'))
      .pipe(gulp.dest('build/img'));
  });

  gulp.task('webp', function () {
    return gulp.src('source/img/**/*.{png,jpg}')
      .pipe(webp({quality: 95}))
      .pipe(gulp.dest('source/img'));
  }); 
 
  gulp.task('html', function () {
    return gulp.src('source/*.html')
      .pipe(posthtml([include()]))

      .pipe(gulp.dest('build'));
  }); 
   
  gulp.task('copy', function () {
    return gulp.src([
      'source/fonts/**/*.{woff,woff2}',
      'source/img/**',
      'source/js/**',
      'source/*.ico'], 
      {
      base: 'source'  //корень копирования
      })
      .pipe(gulp.dest('build'));
  });
  
  gulp.task('server', function () {
    server.init({
      server: 'build/'
    });
  
    gulp.watch('source/sass/**/*.{sass,scss}', gulp.series('css', 'refresh'));
    //gulp.watch('source/img/icon-*.svg', gulp.series('sprite', 'html'));
    gulp.watch('source/*.html', gulp.series('html', 'refresh')); //on('change',server.reload);
  });
  
  gulp.task('build', gulp.series('clean', 'copy', 'css', 'sprite', 'html'));
  gulp.task('start', gulp.series('build', 'server'));