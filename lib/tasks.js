var tasks = (function(){

  var browserSync = require('browser-sync');

  var paths;
  var pipeline = {
    before:[],
    middle:[],
    after:[]
  };

  var tasksConfig = {};
  var watchFolders = [];

  var getWatchFolder = function(property) {
    if (config.if(property)) {
      var configProperty = config.get(property);
      if (task.core.has(configProperty, 'watch')) {
        return [configProperty.watch];
      }
    }
    return [];
  };

  var init = function() {
    paths = config.if('paths') ? config.get('paths') : false;
    tasksConfig = config.if('config') ? config.get('config') : false;

    watchFolders = watchFolders.concat(getWatchFolder('css'));
    watchFolders = watchFolders.concat(getWatchFolder('js'));
    watchFolders = watchFolders.concat(getWatchFolder('twig'));
  };

  var addToPipeline = function(subTaskPipeline) {
    pipeline.before = pipeline.before.concat(subTaskPipeline.before);
    pipeline.middle = pipeline.middle.concat(subTaskPipeline.middle);
    pipeline.after = pipeline.after.concat(subTaskPipeline.after.reverse());
  };

  var http = function(tasks) {

    gulp.task('http', gulp.series(tasks, function() {
      browserSync.stream();
      browserSync.init({
        server: {
            baseDir: paths.server
        },
        logLevel: 'info',
        notify: true
      });

      message.wait();

      return gulp.watch(watchFolders, gulp.series(tasks, function(done){
          browserSync.reload();
          message.wait();
          done();
        }))
        .on('change', function(path) {
          message.event('change', path);
        })
        .on('unlink', function(path) {
          message.event('unlink', path);
        })
        .on('add', function(path) {
          message.event('add', path);
        });
    }));
  };

  var watch = function(tasks) {
    gulp.task('watch', gulp.series(tasks, function() {
      message.wait();
      return gulp.watch(watchFolders, gulp.series(tasks, function(done){
          message.wait();
          done();
        }))
        .on('change', function(path) {
          message.event('change', path);
        })
        .on('unlink', function(path) {
          message.event('unlink', path);
        })
        .on('add', function(path) {
          message.event('add', path);
        });
    }));
  };

  var build = function(tasks){
    gulp.task('default', gulp.series(tasks, function(done){
      done();
    }));
  };

  return {
    init: function(){
      init();
      addToPipeline(task.timer.get());
      addToPipeline(task.shell.get());
      addToPipeline(task.css.get());
      addToPipeline(task.js.get());
      addToPipeline(task.vendors.get());
      addToPipeline(task.html.get());
      pipeline.after.reverse();
      var pipelineList = pipeline.before.concat(pipeline.middle.concat(pipeline.after));
      build(pipelineList);
      watch(pipelineList);
      http(pipelineList);
    }
  };
})();