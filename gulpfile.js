//
// Variables
//

const src_dir = "_src", // source
  dist_dir = "dist", // dist
  gulp = require("gulp"), // gulp
  scss = require("gulp-sass"), // sass
  webp = require("gulp-webp"), // webp convert
  fileinclude = require("gulp-file-include"), // file include
  browsersync = require("browser-sync").create(), // browser sync
  webphtml = require("gulp-webp-html"), // auto webp in html
  webpcss = require("gulp-webp-css"), // auto webp in css
  autoprefixer = require("gulp-autoprefixer"), // autoprefixer for browsers
  del = require("del"), // for clean
  cleancss = require("gulp-clean-css"), // clean and compress css
  uglify = require("gulp-uglify-es").default, // uglify js
  groupmedia = require("gulp-group-css-media-queries"), // group media queries
  rename = require("gulp-rename"), // rename files
  htmlbeautify = require("gulp-html-beautify"), // pretty html
  babel = require("gulp-babel"), // Babel
  sourcemaps = require("gulp-sourcemaps"), // sourcemaps for css
  imagemin = require("gulp-imagemin"); // minify images
// dirs for tasks
(dist = {
  // for dist
  html: dist_dir + "/", // html
  css: dist_dir + "/css/", // css
  js: dist_dir + "/js/", // js
  img: dist_dir + "/img/", // img
}),
  (source = {
    // for source files
    html: [src_dir + "/*.html", "!" + src_dir + "/_*.html"], // html files and not _*.html
    css: src_dir + "/scss/**/*.scss", // scss
    js: [src_dir + "/js/**/*.js", "!" + src_dir + "/js/**/_*.js"], // js
    img: src_dir + "/img/*.*", // img
  }),
  (watch = {
    // for watch files
    html: src_dir + "/*.html", // html
    css: source.css, // css
    js: src_dir + "/js/**/*.js", // js
    img: source.img, // img
  }),
  (vendor = {
    src: src_dir + "/vendor/**/*.*",
    dist: dist_dir + "/vendor/",
  });
(cleanhtml = dist_dir + "/*.html"), // html
  //
  // Build tasks
  //

  gulp.task("html", function () // html
  {
    return gulp
      .src(source.html) // files to modidy
      .pipe(fileinclude()) // include files
      .pipe(webphtml()) // auto webp integration
      .pipe(htmlbeautify()) // pretty html
      .pipe(gulp.dest(dist.html)) // copy html
      .pipe(browsersync.stream()); // watch browser sync
  });

gulp.task("css", function () // css files
{
  return gulp
    .src(source.css) // files to modidy
    .pipe(scss()) // compile scss or sass
    .pipe(groupmedia()) // group media queries
    .pipe(webpcss()) // integrate webp to css
    .pipe(
      autoprefixer({
        // prefix
        overrideBrowserslist: ["last 5 versions"],
        cascade: true,
      })
    )
    .pipe(sourcemaps.init()) // init source maps
    .pipe(sourcemaps.write()) // write soucemaps without plugins
    .pipe(gulp.dest(dist.css)) // copy css
    .pipe(
      rename({
        // rename with .min.css
        extname: ".min.css",
      })
    )
    .pipe(cleancss()) // compress css
    .pipe(gulp.dest(dist.css)) // copy compressed css
    .pipe(browsersync.stream()); // watch browser sync
});

gulp.task("js", function () // js files
{
  return gulp
    .src(source.js) // files to modify
    .pipe(fileinclude()) // include files
    .pipe(babel()) // use babel
    .pipe(gulp.dest(dist.js))
    .pipe(uglify()) // uglify(compress)
    .pipe(
      rename({
        // rename with .min.js
        extname: ".min.js",
      })
    )
    .pipe(gulp.dest(dist.js)) // copy js
    .pipe(browsersync.stream()); // watch browser sync
});

gulp.task("img", function () // for all imgs
{
  return gulp
    .src(source.img) // files to modify
    .pipe(imagemin()) // minify images
    .pipe(gulp.dest(dist.img)) // copy img
    .pipe(webp()) // convert to webp
    .pipe(gulp.dest(dist.img)) // copy webp
    .pipe(browsersync.stream()); // watch browser sync
});

gulp.task("vendor", function () {
  return gulp.src(vendor.src).pipe(gulp.dest(vendor.dist));
});

gulp.task("browsersync", function () // browser auto update
{
  browsersync.init({
    // init browser sync
    server: {
      baseDir: dist_dir, // dir to stream
    },
    online: true,
    notify: false, // no notify updates
  });
});

//
// Clean tasks
//

gulp.task("clean:html", function () {
  return del(cleanhtml); // del all .html
});

gulp.task("clean:css", function () {
  return del(dist.css); // del css dir
});

gulp.task("clean:js", function () {
  return del(dist.js); // del js dir
});

gulp.task("clean:img", function () {
  return del(dist.img); // del img dir
});

gulp.task("clean:vendor", function () {
  return del(vendor.dist); // del dist vendor dir
});

//
// Watch task
//

gulp.task("watch", function () // watch files task
{
  gulp.watch(watch.html, gulp.series("clean:html", "html")); // watch html files
  gulp.watch(watch.css, gulp.series("clean:css", "css")); // watch css files
  gulp.watch(watch.js, gulp.series("clean:js", "js")); // watch js files
  gulp.watch(watch.img, gulp.series("clean:img", "img")); // watch img files
  gulp.watch(vendor.src, gulp.series("clean:vendor", "vendor")); // watch vendor files
});

//
// Start
//

let build = gulp.series(
  // tasks for build
  "clean:html",
  "clean:css",
  "clean:js",
  "clean:img",
  "clean:vendor",
  "html",
  "css",
  "js",
  "img",
  "vendor"
);

exports.build = build; // build task
// you can also run "npm run build"
exports.dev = gulp.series(build, gulp.parallel("watch", "browsersync")); // dev task
// you can also run "npm run dev"
