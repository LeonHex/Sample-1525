var gulp = require('gulp');
var jest = require('jest-cli');

gulp.task('test', function(done){
  jest.runCLI({
    coverage: true,
    colors: true,
    verbose: true
  }, '.', function() {
    done();
  });
});
