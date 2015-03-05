module.exports = (grunt) ->
  chromeExtensionVersionNumber = grunt.file.readJSON('src/extensions/chrome/manifest.json').version
  console.log 'Chrome Extension Version Number ' + chromeExtensionVersionNumber

  grunt.initConfig
    clean:
      app: ['dist', 'release', 'tmp']
      test: ['test/client.test.js']
    bower:
      install:
        options:
          targetDir: 'tmp/lib'
          install: true
          verbose: false
          cleanTargetDir: true
          cleanBowerDir: false
          bowerOptions:
            production: true
    mustache:
      app:
        src: ['src/**/*.mustache']
        dest: 'tmp/src/templates.js'
        options:
          prefix: 'define(function(){ return '
          postfix: ';});'
    coffee:
      core:
        expand: true
        cwd: "src/"
        src: ["collections/*.coffee", "models/*.coffee", "views/*.coffee", "routers/*.coffee"]
        dest: "tmp/src"
        ext: ".js"
      chrome:
        files:
          'tmp/chrome/master.js': 'src/extensions/chrome/master.coffee'
      testClient:
        options:
          bare: true
        expand: true
        flatten: true
        cwd: "test/"
        src: ["**/*.test.coffee"]
        dest: "test/tmp"
        ext: ".js"
    lineremover:
      excludeSourceMapping:
        files:
          'tmp/lib/bootstrap/bootstrap.css': 'tmp/lib/bootstrap/bootstrap.css'
        options:
          exclusionPattern: "sourceMappingURL"
    copy:
      chrome:
        files: [
          {expand: true, src: ['*.png'], dest: 'dist/chrome/'}
          {expand: true, flatten: true, cwd: 'tmp/lib', src: ['**/*.css'], dest: 'dist/chrome/css/'}
          {expand: true, cwd: 'tmp/lib/bootstrap/', src: [
            'glyphicons-halflings-regular.eot', 'glyphicons-halflings-regular.svg', 'glyphicons-halflings-regular.ttf', 'glyphicons-halflings-regular.woff', 'glyphicons-halflings-regular.woff2'
          ], dest: 'dist/chrome/fonts/'}
          {expand: true, cwd: 'src/extensions/chrome/', src: ['manifest.json', 'background.js'], dest: 'dist/chrome/'}
          {expand: true, flatten: true, src: [
            "node_modules/requirejs/require.js"
            "node_modules/mustache/mustache.js"
            "tmp/lib/**/*.js"
          ], dest: "dist/chrome/lib/"}
          {expand: true, flatten: true, src: [
            "tmp/src/**/*.js"
          ], dest: "dist/chrome/app/"}
          {expand: true, flatten: true, src: [
            "tmp/chrome/master.js", "src/extensions/chrome/background.js"
          ], dest: "dist/chrome/"}
        ]
    stylus:
      bower:
        options:
          compress: false
        files:
          'tmp/lib/Bang.css': 'src/styles/Bang.styl'
    watch:
      app:
        files: ['src/**/*.coffee', 'src/extensions/chrome/*']
        tasks: ['mustache', 'coffee', 'stylus', 'lineremover', 'copy']
      testClient:
        files: ['test/client/**/*.coffee']
        tasks: ['coffee:testClient']
    compress:
      chrome:
        options:
          archive: "release/bang_#{chromeExtensionVersionNumber}.zip"
          mode: "zip"
        files: [
          {expand: true, cwd: 'dist/chrome/', src: ['**'], dest: "bang/"}
        ]
    open:
      test:
        path: 'test/client.html'

  # These plugins provide necessary tasks.
  grunt.loadNpmTasks 'grunt-bower-task'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-compress'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-line-remover'
  grunt.loadNpmTasks 'grunt-mustache'
  grunt.loadNpmTasks 'grunt-open'

  # Default task.
  grunt.registerTask 'default', ['clean:app', 'bower', 'mustache', 'coffee', 'stylus', 'lineremover', 'copy', 'compress']
  grunt.registerTask 'buildTest', ['clean', 'bower', 'mustache', 'coffee', 'stylus', 'lineremover', 'copy']
  grunt.registerTask 'testClient', ['clean', 'bower', 'mustache', 'coffee', 'stylus', 'lineremover', 'copy', 'open:test']
