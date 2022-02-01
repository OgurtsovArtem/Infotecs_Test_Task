/* eslint-disable camelcase */
const { src, dest } = require("gulp");
const gulp = require("gulp");
const browsersync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const del = require("del");
const scss = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const groupmedia = require("gulp-group-css-media-queries");
const cleancss = require("gulp-clean-css");
const rename = require("gulp-rename");
const ghPages = require("gh-pages");
const webphtml = require("gulp-webp-html");
const webpack = require("webpack-stream");
const svgsprite = require("gulp-svg-sprite");

// Названия папок
const project_folder = "dist";
const source_folder = "src";

// Пути к файлам
const path = {
  build: {
    html: `${project_folder}/`,
    style: `${project_folder}/style/`,
    js: `${project_folder}/js/`,
    icons: `${project_folder}/icons`,
  },
  src: {
    html: [`${source_folder}/pages/*.html`, `!${source_folder}/pages/_*.html`],
    style: `${source_folder}/style/style.scss`,
    js: `./${source_folder}/js/script.js`,
    json: `${source_folder}/*.json`,
    icons: `${source_folder}/icons/*.svg`,
  },
  watch: {
    html: `${source_folder}/**/*.html`,
    style: `${source_folder}/style/**/*.scss`,
    styleComponents: `${source_folder}/components/**/*.scss`,
    js: `${source_folder}/js/**/*.js`,
    json: `${source_folder}/*.json`,
    icons: `${source_folder}/icons/*.svg`,
  },
  clean: `./${project_folder}/`,
};
// Функции
function browserSync() {
  browsersync.init({
    server: {
      baseDir: `./${project_folder}/`,
    },
    port: 3000,
    // notify: false
  });
}
function json() {
  return src(path.src.json)
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream({ stream: true }));
}

function htmlHandler() {
  return src(path.src.html)
    .pipe(fileinclude({
      prefix: "@@",
      basepath: "@file",
    }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream({ stream: true }));
}

function styleHandler() {
  return src(path.src.style)
    .pipe(
      scss({
        outputStyle: "expanded",
      }),
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: false,
      }),
    )
    .pipe(groupmedia())
    .pipe(dest(path.build.style))
    .pipe(cleancss())
    .pipe(
      rename({
        extname: ".bundle.css",
      }),
    )
    .pipe(dest(path.build.style))
    .pipe(browsersync.stream({ stream: true }));
}

function jsHandler() {
  return src(path.src.js)
    .pipe(webpack({
      config: require("./webpack.config.js"),
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream({ stream: true }));
}

function icons() {
  return src(path.src.icons)
    .pipe(dest(path.build.icons))
    .pipe(browsersync.stream({ stream: true }));
}

function watchFiles() {
  gulp.watch([path.watch.html], htmlHandler);
  gulp.watch([path.watch.style], styleHandler);
  gulp.watch([path.watch.styleComponents], styleHandler);
  gulp.watch([path.watch.js], jsHandler);
  gulp.watch([path.watch.json], json);
  gulp.watch([path.watch.icons], icons);
}

function clean() {
  return del(path.clean);
}

gulp.task("deploy", () => ghPages.publish("dist", (err) => { console.log(err); }));

// Сценарии выполнения
const build = gulp.series(
  clean,
  gulp.parallel(
    styleHandler,
    htmlHandler,
    jsHandler,
    json,
    icons,
  ),
);
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.styleHandler = styleHandler;
exports.htmlHandler = htmlHandler;
exports.jsHandler = jsHandler;
exports.json = json;
exports.icons = icons;
exports.watch = watch;
exports.build = build;
exports.default = watch;
