import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import watch from 'gulp-watch';
import shell from 'gulp-shell';
import fs from 'fs-extra';

const BUILD_PATH = 'build';
const APP_PATH = 'app';

/**
 *  gulpfile.babel.js
 *
 *  Use `gulp dev` start dev-server and `gulp-build` to build project
 */
/* Task that cleans 'build' */
gulp.task('clean', () => del(BUILD_PATH));

/* Task that copies necessary files to 'build' */
gulp.task('copy', () =>
    ['app/images', 'app/lib', 'app/asserts','app/views', 'app/index.html','app/favicon.ico'].map(dir => fs.copySync(dir, dir.replace(APP_PATH, BUILD_PATH)))
);
gulp.task('copy-views', () => ['app/views', 'app/index.html'].map(dir => fs.copySync(dir, dir.replace(APP_PATH, BUILD_PATH))));
gulp.task('watch-views', () => watch(['app/views/**/*', 'app/*.html'], () => runSequence('copy-views')));
gulp.task('webpack-dev-server', shell.task('webpack-dev-server --progress --profile --colors --port 8081 --define CONFIG=\'"dev"\''));
gulp.task('webpack-dev-server-FS', shell.task('webpack-dev-server --progress --profile --colors --port 8081 --define CONFIG=\'"prodFS"\''));
gulp.task('webpack', shell.task('webpack --progress --profile --colors --define CONFIG=\'"devBuild"\''));
gulp.task('webpack-sit', shell.task('webpack --progress --profile --colors --define CONFIG=\'"sitBuild"\''));
gulp.task('webpack-HZ', shell.task('webpack --progress --profile --colors --define CONFIG=\'"prodBuild"\''));
gulp.task('webpack-FSDEV', shell.task('webpack --progress --profile --colors --define CONFIG=\'"prodFSDEV"\''));

// gulp process control
gulp.task('dev', () => runSequence('clean', 'copy', ['watch-views', 'webpack-dev-server'])); // 本地运行环境
gulp.task('build', () => runSequence('clean', 'copy', 'webpack')); // 本地环境打包
gulp.task('build-HZ', () => runSequence('clean', 'copy', 'webpack-HZ')); //  惠州正式环境打包
gulp.task('build-sit', () => runSequence('clean', 'copy', 'webpack-sit')); //  测试环境打包