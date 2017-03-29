const gulp = require('gulp'),
  babel = require('gulp-babel'),
  clean = require('gulp-clean'),
  flow = require('gulp-flowtype'),
  pump = require('pump'),
  watch = require('gulp-watch'),
  co = require('co'),
  runSequence = require('run-sequence'),
  thunkify = require('thunkify'),
  eslint = require('gulp-eslint'),
  fs = require('fs');


const SRC_PATH = './lib/**/*.js';
const TEST_PATH = './test/**/*.js';
const INTERFACE_PATH = './interface/**/*.js';
const OUTPUT_PATH = 'dist';
const OUTPUT_RELEASE = 'release';
const exists = thunkify(fs.exists);

function* hasBuildPath () {
  try {
    yield exists(OUTPUT_PATH);
    return false;
  } catch (err) {
    console.log(err);
    return true;
  }
}
gulp.task('clean', function (cb) {
  co(function* () {
    const hasPath = yield co(hasBuildPath());
    if (hasPath) {
      console.info('build文件夹存在，将删除');
      gulp.src(OUTPUT_PATH + '/*').pipe(clean({ force: true }));
    }
    cb();
  });
});

gulp.task('flow-check', function () {
  return gulp.src(SRC_PATH)
  .pipe(flow({}));
});


gulp.task('build-dev-test', function () {
  co(function* () {
    const hasPath = yield co(hasBuildPath());
    if (!hasPath) {
      // 测试时如果未打包才重新打包
      runSequence('build-dev');
    }
  });

});

gulp.task('build-only', function () {
  return pump([ gulp.src(SRC_PATH),
    babel(),
    gulp.dest(OUTPUT_PATH) ]);
});

gulp.task('build-dev', function (done) {
  runSequence('clean');
  setTimeout(() => {
    runSequence('build-only');
    done;
  }, 50);
});

const uglifyjs = require('uglify-js');
const minifier = require('gulp-uglify/minifier');

gulp.task('build-release', function () {
  const options = {
    preserveComments: 'license',
  };

  return pump([ gulp.src(OUTPUT_PATH + '/**/*.js'),
    minifier(options, uglifyjs),
    gulp.dest(OUTPUT_RELEASE) ]);
});


gulp.task('watch-dev', function () {
  return watch(SRC_PATH, function () {
    gulp.run('build-only');
  });
});
gulp.task('watch-release', function () {
  return watch(SRC_PATH, function () {
    gulp.run('build-release');
  });
});
gulp.task('watch-lint', function () {
  return watch([ SRC_PATH, TEST_PATH, INTERFACE_PATH ], function () {
    gulp.run('eslint');
  });
});
gulp.task('eslint', () => {
  return gulp.src([ 'lib/**/*.js', 'test/**/*.js', 'interface/**/*.js' ])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});
