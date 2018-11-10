var gulp = require('gulp')
var sass = require('gulp-sass')
var px2rem = require('gulp-rem-plugin')
var uglify = require('gulp-uglify')
var browserSync = require('browser-sync').create()
var runSequence = require('run-sequence')
const path = require('path')
const chalk = require('chalk')
const exists = require('fs').existsSync
const autoprefixer = require('gulp-autoprefixer')
const proxy = require('http-proxy-middleware')
var babel = require("gulp-babel");
const rm = require('rimraf').sync
const rev = require('gulp-rev')
const revCollector = require('gulp-rev-collector')
const argv = process.argv
// 11011
const proxyOption = proxy('/chargebook', {
	target: 'http://10.0.52.31',
	changeOrigin: true,
})
let file = (argv[2] && argv[2].replace(/^-*/g, '')) || './'
rm(path.join(process.cwd(), 'dist'));
const filePath = path.resolve(__dirname, file)
if (!exists(filePath)) {
	console.log(chalk.red('项目不存在'))
	return
}
const htmlPath = `${filePath}/*.html`
const staticPath = `${filePath}/static/**`
gulp.task('sass', () => {
	return gulp.src(`${staticPath}/*.{scss,sass,css}`)
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(px2rem({ 'width_design': 750 }))
		.pipe(gulp.dest('dist'))
});
gulp.task('html', () => {
	return gulp.src(htmlPath)
		.pipe(gulp.dest('dist'))
})
gulp.task('rev', () => {
	return gulp.src(['distRev/**/*.json', htmlPath])
		.pipe(revCollector({
			replaceReved: true,
			dirReplacements: {
				js: '/js'
			}
		}))
		.pipe(gulp.dest('dist'))
})
gulp.task('server', () => {
	browserSync.init({
		server: 'dist',
		middleware: [proxyOption]
	});
});

gulp.task('js', () => {
	return gulp.src(`${staticPath}/js/*.js`)
		.pipe(babel({
			presets: ['es2015', 'stage-0']
		}))
		// .pipe(rev())
		// .pipe(uglify())
		.pipe(gulp.dest('dist/'))
	// .pipe(rev.manifest())
	// .pipe(gulp.dest('distRev/js'))
});

gulp.task('js:lib', () => {
	return gulp.src(`${staticPath}/lib/*.js`)
		.pipe(gulp.dest('dist'))
});
gulp.task('images', () => {
	return gulp.src(`${staticPath}/*.{png,jpg,jpeg,ico}`)
		.pipe(gulp.dest('dist'));
});
// 开启重刷新
gulp.task('reload', () => {
	return browserSync.reload();
})
gulp.task('watch', () => {
	gulp.watch(`${staticPath}/*.{scss,sass,css}`, () => runSequence('sass', 'reload'));
	gulp.watch(htmlPath, () => runSequence('html', 'reload'));
	gulp.watch(`${staticPath}/*.{png,jpg,jpeg}`, () => runSequence('images', 'reload'));
	gulp.watch(`${staticPath}/*.js`, () => runSequence('js', 'reload'));

});
gulp.task('default', () => runSequence(['sass', 'images', 'js', 'js:lib'], 'html', 'watch', 'server'));
