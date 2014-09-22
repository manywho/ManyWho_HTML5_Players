var gulp = require('gulp');
var replace = require('gulp-replace');
var argv = require('yargs').argv;

gulp.task('default', function () {
   
    gulp.src('build/**/*.*')
        .pipe(gulp.dest('dist/build'));
    
    gulp.src('css/**/*.*')
        .pipe(gulp.dest('dist/css'));

    gulp.src('extensions/**/*.*')
        .pipe(gulp.dest('dist/extensions'));

    gulp.src('images/**/*.*')
        .pipe(gulp.dest('dist/images'));

    gulp.src('draw/**/*.*')
        .pipe(gulp.dest('dist/draw'));

    gulp.src('js/**/*.*')
        .pipe(gulp.dest('dist/js'));

    gulp.src('run/**/*.*')
        .pipe(gulp.dest('dist/run'));

    gulp.src('translate/**/*.*')
        .pipe(gulp.dest('dist/translate'));

    gulp.src('favicon.ico')
        .pipe(gulp.dest('dist'));

    gulp.src('manywho.fileDataProxy.js')
        .pipe(gulp.dest('dist'));

    if (argv.env == "staging") {

        console.log("Setting CDN to staging");

        gulp.src(['dist/**/*.css', 'dist/**/*.js', 'dist/**/*.html'])
            .pipe(replace('cdn.manywho.com', 'cdn.staging.manywho.com'))
            .pipe(gulp.dest('dist'));

        gulp.src('players/*.htm')
            .pipe(replace('cdn.manywho.com', 'cdn.staging.manywho.com'))
            .pipe(gulp.dest('dist_players'));

    }
	else {
	
	    gulp.src('players/*.htm')
        .pipe(gulp.dest('dist_players'));
	
	}

});