const gulp = require("gulp");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const imagemin = require("gulp-imagemin");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel"); //Viết ES6 
const browsersync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer"); //tự động thêm prefix vào code CSS
const cache = require("gulp-cache");
const del = require("del");
const plumber = require("gulp-plumber");
//new add
const sourcemaps = require("gulp-sourcemaps"); //dễ dàng debug hơn

/* Options
 * ------ */
const options = {
  pug: {
    src: ["app/pug/*.pug", "app/pug/!blocks/**", "app/pug/!layout/**"],
    all: "app/pug/**/*.pug",
    dest: "public",
  },
  scripts: {
    src: "app/js/**/*.js",
    dest: "public/js",
  },
  styles: {
    src: ["app/scss/**/*.scss", "app/sass/**/*.sass"],
    dest: "public/css",
  },
  images: {
    src: "app/images/*.+(png|jpeg|jpg|gif|svg)",
    dest: "public/images",
  },
  fonts: {
    src: "app/fonts/*",
    dest: "public/fonts",
  },
  browserSync: {
    baseDir: "public",
  },
  folder: {
    src: ["app/library/**/*.+(css|js)",],
    dest: "public/library",
  },
};

/* Browser-sync
 * ------------ */
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: options.browserSync.baseDir,
    },
    // port: 3452,
    port: Math.floor(Math.random() * 10000),
  });
  done();
}

/* Styles
 * ------ */

function styles() {
  return gulp
    .src(options.styles.src)
    .pipe(sourcemaps.init())
    .pipe(
      plumber(function (err) {
        console.log("Styles Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false,
        grid: true,
      })
    )
    .pipe(sourcemaps.write('../sourcemaps'))
    .pipe(gulp.dest(options.styles.dest))
    .pipe(
      browsersync.reload({
        stream: true,
      })
    );
}

/* Scripts
 * ------ */

function scripts() {
  return gulp
    .src(options.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(
      plumber(function (err) {
        console.log("Scripts Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(babel())
    .pipe(uglify())
    .pipe(sourcemaps.write('../sourcemaps')) //writes sourcemaps to directory:relative to dest!!
    .pipe(gulp.dest(options.scripts.dest))
    .pipe(
      browsersync.reload({
        stream: true,
      })
    );
}

/* Views
 * ------ */

function views() {
  return gulp
    .src(options.pug.src)
    .pipe(
      plumber(function (err) {
        console.log("Pug Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(options.pug.dest))
    .pipe(
      browsersync.reload({
        stream: true,
      })
    );
}

/* Images
 * ------ */

function images() {
  return gulp
    .src(options.images.src)
    .pipe(
      cache(
        imagemin({
          interlaced: true,
        })
      )
    )
    .pipe(gulp.dest(options.images.dest));
}

/*imagemin full option
/* https://www.npmjs.com/package/gulp-imagemin */
/*------
function images() {
  return gulp
    .src(options.images.src)
    .pipe(
      cache(
        imagemin([
          imagemin.gifsicle({interlaced: true}),
          imagemin.mozjpeg({quality: 75, progressive: true}),
          imagemin.optipng({optimizationLevel: 5}),
          imagemin.svgo({
            plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
            ]
          })
        ])
      )
    )
    .pipe(gulp.dest(options.images.dest));
}
----------------------*/




/* Fonts
 * ------ */

function fonts() {
  return gulp.src(options.fonts.src).pipe(gulp.dest(options.fonts.dest));
}

/* Copy folder
 * ------ */

function folder() {
  return gulp.src(options.folder.src).pipe(gulp.dest(options.folder.dest));
}


/* Clean up
 * ------ */

async function clean() {
  return Promise.resolve(del.sync("public"));
}

function watchFiles() {
  gulp.watch(options.pug.all, views);
  gulp.watch(options.styles.src, styles);
  gulp.watch(options.scripts.src, scripts);
  gulp.watch(options.images.src, images);
  gulp.watch(options.fonts.src, fonts);
  gulp.watch(options.folder.src, fonts);
}

/* Build
 * ------ */
const build = gulp.series(
  clean,
  gulp.parallel(styles, views, scripts, images, fonts, folder)
);
const watch = gulp.parallel(watchFiles, browserSync);
// export tasks
exports.styles = styles;
exports.views = views;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.fonts = folder;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
