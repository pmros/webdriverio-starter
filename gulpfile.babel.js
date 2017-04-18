import gulp from 'gulp'
import http from 'http'
import connect from 'connect'
import serveStatic from 'serve-static'
import selenium from 'selenium-standalone'
import webdriver from 'gulp-webdriver'

let httpServer

gulp.task('http', done => {
  const app = connect().use(serveStatic('test/fixtures'));
  httpServer = http.createServer(app).listen(9000, done);
});

gulp.task('selenium', done => {
    selenium.install({
        logger (message) {
            process.stdout.write(`${message} \n`)
        },
        progressCb: (totalLength, progressLength) => {
            process.stdout.write(`Downloading drivers ${Math.round(progressLength / totalLength * 100)}% \r`)
        }
    }, err => {
        if (err) return done(err)

        selenium.start({
            spawnOptions: {
                stdio: 'ignore'
            }
        }, (err, child) => {
            selenium.child = child
            console.log('Selenium error: ', err)
            done()
        })
    })
})

gulp.task('test', ['http', 'selenium'], () => {
    return gulp.src('wdio.conf.js')
        .pipe(webdriver({
            logLevel: 'verbose',
            waitforTimeout: 12345,
            framework: 'mocha'
        })).once('end', () => {
            selenium.child.kill()
            httpServer.close()
        })
})
