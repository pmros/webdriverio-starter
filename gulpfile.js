const gulp = require('gulp');
const http = require('http');
const connect = require('connect');
const serveStatic = require('serve-static');
const Launcher = require('webdriverio/build/lib/launcher');
const path = require('path');
const wdio = new Launcher(path.join(__dirname, 'wdio.conf.js'));

let httpServer;

gulp.task('http', done => {
  const app = connect().use(serveStatic('test/fixtures'));
  httpServer = http.createServer(app).listen(9000, done);
});

gulp.task('e2e', ['http'], () => {
  return wdio.run(code => {
    process.exit(code);
  }, error => {
    console.error('Launcher failed to start the test', error.stacktrace);
    process.exit(1);
  });
});

gulp.task('test', ['e2e'], () => {
  httpServer.close();
});
