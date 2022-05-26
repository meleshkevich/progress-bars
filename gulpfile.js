// load modules
const gulp         = require('gulp');
const del          = require('del');
const fs           = require('fs');
const path         = require('path');
const browsersync_server = require('browser-sync').create();
const htmlmin      = require('gulp-htmlmin');
const sass         = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cache        = require('gulp-cached');
const csso         = require('gulp-csso');
const rename       = require('gulp-rename');
const sourcemaps   = require('gulp-sourcemaps');
const vinyl_named  = require('vinyl-named');
const webpack_compiler = require('webpack');
const webpack      = require('webpack-stream');
const assets       = require('./gulp-assets');

// assets to bundles
let entries = {
        css: {},
        js: {}
    },
    outputs = {
        css: {},
        js: {}
    },
    bundle_nr = 0;

for (let entry in assets) {
    let output = assets[entry];

    // prepend ./src/ to relative paths
    if (!entry.match(/^\.?\//) && !entry.match(/^src\//)) {
        entry = './src/' + entry;
    }
    entry = './' + entry.replace(/^\.?\//, '');

    // prepend ./src/ to relative paths
    if (!output.match(/^\.?\//) && !output.match(/^dist\//)) {
        output = './dist/' + output;
    }
    output = './' + output.replace(/^\.?\//, '');

    if (output.match(/\.css$/)) {
        entries.css[entry] = entry;
        outputs.css[entry] = output;
    } else if (output.match(/\.js$/)) {
        entries.js[`bundle${++bundle_nr}`] = entry;
        outputs.js[`bundle${bundle_nr}`] = output;
    }
}

// creates default src folder structure
function createStructure(done) {
    const folders = [
        'dist',
        'src',
    ];
    const files = ([
        'src/index.html',
    ])
    .concat(Object.keys(entries.css))
    .concat(Object.values(entries.js));

    folders.forEach(dir => {
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log('folder created:', dir);
        }
    });

    files.forEach(file => {
        if(!fs.existsSync(file)) {
            const dir = path.dirname(file);
            if(!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFileSync(file, '');
            console.log('file created:', file);
        }
    });

    return done();
}

// deletes all assets (HTML, fonts, images) in dist
function cleanAssets(done) {
    return del(
        ['dist/**/*'],
        { force: true }
    );
}

// publish HTML files src into dist
function publishHtml(done, for_production = false) {
    let pipeline = gulp.src('src/**/*.{html,htm}')
        .pipe(cache('html'));

    if (for_production) {
        pipeline.pipe(htmlmin({ collapseWhitespace: true }));
    }

    return pipeline.pipe(gulp.dest('dist'));
}

// publish HTML for production
function publishHtmlProduction(done) {
    return publishHtml(done, true);
}

// publish HTML for development
function publishHtmlDevelopment(done) {
    return publishHtml(done, false);
}

// Copy all static files from src into dist
function publishStatic(done) {
    return gulp.src(["src/**/*.*", "!src/**/*.{html,htm,css,scss,js,jsx}"])
        .pipe(cache('static'))
        .pipe(gulp.dest('dist'));
}

// compile SCSS files
function publishCss(done, for_production = false) {
    let output_path = null;
    let pipeline = gulp.src(Object.values(entries.css), {base: '.'})
    .pipe(rename(function(path) {
        const entry = './' + path.dirname.replace('\\', '/') + '/' + path.basename + path.extname;
        const output = outputs.css[entry];
        let dirs = output.split('/');
        let filename = dirs.pop();
        let exts = filename.split('.');
        let ext = exts.pop();
        output_path = {
            dirname: dirs.join('/'),
            basename: exts.join('.'),
            extname: '.'+ext
        }
        return path;
    }))
        .pipe(cache('css'))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))

    if (for_production) {
        pipeline.pipe(autoprefixer({
            overrideBrowserslist: [
                "last 2 version",
                "> 2%"
            ],
            cascade: false
        }))
        .pipe(csso());
    }

    return pipeline
        .pipe(rename(function(path) {
            return output_path;
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
}

function publishCssProduction(done) {
    return publishCss(done, true);
}

function publishCssDevelopment(done) {
    return publishCss(done, false);
}

function publishJs(done, for_production = false) {

    const webpack_config = {
        mode: for_production ? 'production' : 'development',
        entry: entries.js,
        output: {
            filename: (chunkData) => {
                return outputs.js[chunkData.chunk.name];
            },
        },
    }

    if (!for_production) {
        webpack_config.devtool = 'source-map';
    }

    let pipeline = gulp.src(Object.values(entries.js))
        // .pipe(cache('js'))
        .pipe(vinyl_named())
        .pipe(webpack(webpack_config, webpack_compiler));

    return pipeline.pipe(gulp.dest('.'));
}

function publishJsProduction(done) {
    return publishJs(done, true);
}

function publishJsDevelopment(done) {
    return publishJs(done, false);
}

// watch files
function watchFiles(done) {
    gulp.watch(["src/**/*.*", "!src/**/*.{html,htm,css,scss,js,jsx}"], gulp.series(publishStatic, reload));
    gulp.watch("src/**/*.{html,htm}", gulp.series(publishHtml, reload));
    gulp.watch("src/**/*.{css,scss}", gulp.series(publishCss, reload));
    gulp.watch("src/**/*.{js,jsx}", gulp.series(publishJs, reload));
    // gulp.watch("src/fonts/**/*", gulp.series(publishFonts, reload));
    // gulp.watch("src/**/*.{png,jpg,jpeg,gif,svg}", gulp.series(publishImages, reload));

}

// browserSync server
function serve(done) {
    browsersync_server.init({
        server: {
            baseDir: './dist/'
        }
    });
    done();
}

// browserSync reload
function reload(done) {
    browsersync_server.reload();
    done();
}

// export tasks
exports.structure = createStructure;
exports.publish   = gulp.series(cleanAssets, publishHtml, publishStatic);
exports.build     = gulp.series(cleanAssets, publishHtmlProduction,  publishStatic, publishCssProduction, publishJsProduction);
exports.build_dev = gulp.series(cleanAssets, publishHtmlDevelopment, publishStatic, publishCssDevelopment, publishJsDevelopment);
exports.watch     = gulp.series(cleanAssets, publishHtmlDevelopment, publishStatic, publishCssDevelopment, publishJsDevelopment, serve, watchFiles);
