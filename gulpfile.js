var gulp = require('gulp');

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

    gulp.src('players')
        .pipe(gulp.dest('dist_players'));

});