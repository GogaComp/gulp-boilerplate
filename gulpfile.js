

// Variables
const
	src_dir			= "_src", // source
	dist_dir		= "dist", // dist
	gulp				= require("gulp"), // gulp
	scss				= require("gulp-sass"), // sass
	webp				= require("gulp-webp"), // webp convert
	fileinclude	= require("gulp-file-include"), // file include
	browsersync	= require("browser-sync").create(), // browser sync
	webphtml		= require("gulp-webp-html"), // auto webp in html
	webpcss			= require("gulp-webp-css"), // auto webp in css
	autoprefixer= require("gulp-autoprefixer"), // autoprefixer for browsers
	del					= require("del"), // for clean
	cleancss		= require("gulp-clean-css"), // clean and compress css
	uglify			= require("gulp-uglify-es").default, // uglify js
	groupmedia	= require("gulp-group-css-media-queries"), // group media queries
	rename			= require("gulp-rename"), // rename files
	htmlbeautify= require("gulp-html-beautify"), // pretty html
	imagemin		= require("gulp-imagemin"); // minify images
	// dirs for tasks
	dist = { // for dist
		html: dist_dir + "/",
		css: 	dist_dir + "/css/",
		js: 	dist_dir + "/js/",
		img: 	dist_dir + "/img/",
	},
	source = { // for source files
		html: [src_dir + "/*.html", "!" + src_dir + "/_*.html", ],
		css: 	src_dir + "/scss/**/*.scss",
		js: 	[src_dir + "/js/**/*.js", "!" + src_dir + "/js/**/_*.js"],
		img: 	src_dir + "/img/*.*",
	},
	watch = {
		html:	src_dir + "/*.html",
		css:	source.css,
		js:		src_dir + "/js/**/*.js",
		img: 	source.img,
	}
	cleanhtml = dist_dir + "/*.html",


//
// Build tasks
//

gulp.task("html", function () // html
{
	return gulp.src(source.html)
		.pipe(fileinclude()) // include files
		.pipe(webphtml()) // auto webp integration
		.pipe(htmlbeautify()) // pretty html
		.pipe(gulp.dest(dist.html)) // copy html
		.pipe(browsersync.stream());
});

gulp.task("css", function () // css
{
	return gulp.src(source.css)
		.pipe(scss({ // compile scss
			outputStyle: "expanded"
		}))
		.pipe(groupmedia()) // group media queries
		.pipe(webpcss())
		.pipe(autoprefixer({ // prefix
			overrideBrowserslist: ['last 5 versions'],
			cascade: true
		}))
		.pipe(gulp.dest(dist.css))
		.pipe(rename({ // rename
			extname: ".min.css"
		}))
		.pipe(cleancss()) // compress css
		.pipe(gulp.dest(dist.css))
		.pipe(browsersync.stream());
});

gulp.task("js", function ()
{
	return gulp.src(source.js)
		.pipe(fileinclude()) // include files
		.pipe(gulp.dest(dist.js))
		.pipe(uglify()) // uglify(compress)
		.pipe(rename({ // rename
			extname: ".min.js"
		}))
		.pipe(gulp.dest(dist.js))
		.pipe(browsersync.stream());
});

gulp.task("img", function ()
{
	return gulp.src(source.img)
		.pipe(imagemin())
		.pipe(gulp.dest(dist.img))
		.pipe(webp())
		.pipe(gulp.dest(dist.img))
		.pipe(browsersync.stream());
});

gulp.task("browsersync", function ()
{
	browsersync.init({
		server: {
			baseDir: dist_dir
		},
		notify: false
	});
});

//
// Clean tasks
//

gulp.task("clean:html", function ()
{
	return del(cleanhtml);
});

gulp.task("clean:css", function ()
{
	return del(dist.css);
});

gulp.task("clean:js", function ()
{
	return del(dist.js);
});

gulp.task("clean:img", function ()
{
	return del(dist.img);
});

//
// Watch task
//

gulp.task("watch", function ()
{
	gulp.watch(watch.html, gulp.series("clean:html", "html"))
	gulp.watch(watch.css, gulp.series("clean:css", "css"))
	gulp.watch(watch.js, gulp.series("clean:js", "js"))
	gulp.watch(watch.img, gulp.series("clean:img", "img"))
});

//
// Start
//

let start = gulp.series(
	"clean:html", "clean:css", "clean:js", "clean:img",
	"html", "css", "js", "img");

exports.default = gulp.series(start, gulp.parallel("watch", "browsersync"));