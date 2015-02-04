module.exports = (grunt) ->
  versionNumber = grunt.file.readJSON('manifest.json').version
  console.log 'Version Number ' + versionNumber

  grunt.initConfig
    clean:
      app: ['bower_components', 'lib', 'dist', 'release']
      test: ['test/client.test.js']
    bower:
      install:
        options:
          targetDir: './lib',
          layout: 'byType',
          install: true,
          verbose: false,
          cleanTargetDir: false,
          cleanBowerDir: false,
          bowerOptions: {}
    coffee:
      app:
        options:
          bare: true
          join: true
        files:
          'lib/bang.js': [
            'src/models/*.coffee'
            'src/collections/*.coffee'
            'src/views/*.coffee'
            'src/bang.coffee'
          ]
      testClient:
        options:
          bare: true
          join: true
        files:
          'test/client.test.js': [
            'test/**/*.test.coffee'
          ]
    stylus:
      compile:
        files:
          'lib/bang.css': 'src/bang.styl'
    concat:
      library:
        files:
          'lib/lib.js': [
            "lib/jquery/jquery.js",
            "lib/d3/d3.js",
            "lib/bootstrap/bootstrap.js",
            "lib/underscore/underscore.js",
            "lib/backbone/backbone.js",
            "lib/URIjs/URI.js"
          ]
      source:
        options:
          stripBanners: true
        files:
          'lib/bang.js': 'lib/bang.js'
    uglify:
      lib:
        files:
          'lib/lib.min.js': 'lib/lib.js'
    copy:
      dist:
        files: [
          {src: ['*.png'], dest: 'dist/'}
          {src: ['lib/**/*.css'], dest: 'dist/', filter: 'isFile'}
          {src: 'lib/bootstrap/glyphicons-halflings-regular.eot', dest: 'dist/lib/fonts/glyphicons-halflings-regular.eot'}
          {src: 'lib/bootstrap/glyphicons-halflings-regular.svg', dest: 'dist/lib/fonts/glyphicons-halflings-regular.svg'}
          {src: 'lib/bootstrap/glyphicons-halflings-regular.ttf', dest: 'dist/lib/fonts/glyphicons-halflings-regular.ttf'}
          {src: 'lib/bootstrap/glyphicons-halflings-regular.woff', dest: 'dist/lib/fonts/glyphicons-halflings-regular.woff'}
          {src: 'lib/bootstrap/glyphicons-halflings-regular.woff2', dest: 'dist/lib/fonts/glyphicons-halflings-regular.woff2'}
          {src: ['manifest.json'], dest: 'dist/'}
          {src: ['src/background.js', 'lib/lib.min.js', 'lib/bang.js'], dest: 'dist/'}
        ]
    lineremover:
      excludeSourceMapping:
        files:
          'dist/lib/bootstrap/bootstrap.css': 'dist/lib/bootstrap/bootstrap.css'
        options:
          exclusionPattern: "sourceMappingURL"
    watch:
      app:
        files: ['src/**/*.coffee', 'manifest.json']
        tasks: ['coffee:app', 'copy', 'lineremover']
      stylesheet:
        files: ['**/*.styl']
        tasks: ['stylus', 'copy', 'lineremover']
      testClient:
        files: ['test/client/**/*.coffee']
        tasks: ['coffee:testClient']
    compress:
      main:
        options:
          archive: "release/bang_#{versionNumber}.zip"
          mode: "zip"
        files: [
          {expand: true, cwd: 'dist/', src: ['**'], dest: "bang/"}
        ]
    open:
      test:
        path: 'test/client.html'

  # These plugins provide necessary tasks.
  grunt.loadNpmTasks 'grunt-bower-task'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-compress'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-line-remover'
  grunt.loadNpmTasks 'grunt-open'

  # Default task.
  grunt.registerTask 'default', ['clean:app', 'bower', 'coffee:app', 'stylus', 'concat', 'uglify', 'copy', 'lineremover', 'compress']
  grunt.registerTask 'buildTest', ['clean', 'bower', 'coffee', 'stylus', 'concat', 'uglify', 'copy']
  grunt.registerTask 'testClient', ['clean', 'bower', 'coffee', 'stylus', 'concat', 'uglify', 'copy', 'open:test']
