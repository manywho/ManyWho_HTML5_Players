var gulp = require('gulp');
var replace = require('gulp-replace');
var argv = require('yargs').argv;

gulp.task('default', function () {
      
    gulp.src('build/**/*.*')
		.pipe(replace('cdn.manywho.com', argv.cdn))
        .pipe(gulp.dest('dist/build'));
    
    gulp.src('css/**/*.*')
		.pipe(replace('cdn.manywho.com', argv.cdn))
        .pipe(gulp.dest('dist/css'));

    gulp.src('extensions/**/*.*')
		.pipe(replace('cdn.manywho.com', argv.cdn))
        .pipe(gulp.dest('dist/extensions'));

    gulp.src('images/**/*.*')
        .pipe(gulp.dest('dist/images'));

    gulp.src('draw/**/*.*')
		.pipe(replace('cdn.manywho.com', argv.cdn))
        .pipe(gulp.dest('dist/draw'));

    gulp.src('js/**/*.*')
		.pipe(replace('cdn.manywho.com', argv.cdn))
        .pipe(gulp.dest('dist/js'));

    gulp.src('run/**/*.*')
		.pipe(replace('cdn.manywho.com', argv.cdn))
        .pipe(gulp.dest('dist/run'));

    gulp.src('translate/**/*.*')
		.pipe(replace('cdn.manywho.com', argv.cdn))
        .pipe(gulp.dest('dist/translate'));

    gulp.src('favicon.ico')
        .pipe(gulp.dest('dist'));

    gulp.src('manywho.fileDataProxy.js')
        .pipe(gulp.dest('dist'));
		
	gulp.src('players/*.htm')
		.pipe(replace('cdn.manywho.com', argv.cdn))
        .pipe(gulp.dest('dist_players'));

});