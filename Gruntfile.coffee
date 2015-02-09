module.exports = (grunt) ->
  versionNumber = grunt.file.readJSON('manifest.json').version
  console.log 'Version Number ' + versionNumber

  grunt.initConfig
    clean:
      app: ['lib', 'dist', 'release']
      test: ['test/client.test.js']
    bower:
      install:
        options:
          targetDir: './lib'
          install: true
          verbose: false
          cleanTargetDir: true
          cleanBowerDir: false
          bowerOptions:
            production: true
    mustache:
      app:
        src: 'src/templates/'
        dest: 'lib/templates.js'
        options:
          prefix: 'bangTemplates = '
          postfix: ';'
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
          ]
          'lib/master.js': 'src/master.coffee'
          'lib/milk/milk.js': 'node_modules/milk/milk.coffee'
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
    lineremover:
      excludeSourceMapping:
        files:
          'lib/bootstrap/bootstrap.css': 'lib/bootstrap/bootstrap.css'
        options:
          exclusionPattern: "sourceMappingURL"
    concat:
      library:
        files:
          'lib/lib.js': [
            "lib/jquery/jquery.js"
            "lib/d3/d3.js"
            "lib/bootstrap/bootstrap.js"
            "lib/underscore/underscore.js"
            "lib/backbone/backbone.js"
            "lib/URIjs/URI.js"
            "lib/milk/milk.js"
            "lib/templates.js"
          ]
      source:
        options:
          stripBanners: true
        files:
          'lib/bang.js': 'lib/bang.js'
    uglify:
      app:
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
          {src: ['src/background.js', 'lib/lib.min.js', 'lib/bang.js', 'lib/master.js'], dest: 'dist/'}
        ]
    watch:
      app:
        files: ['src/**/*.coffee', '**/*.styl', 'src/templates/*.mustache', 'manifest.json']
        tasks: ['mustache', 'coffee:app', 'stylus', 'lineremover', 'concat', 'uglify', 'copy']
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
  grunt.loadNpmTasks 'grunt-mustache'
  grunt.loadNpmTasks 'grunt-open'

  # Default task.
  grunt.registerTask 'default', ['clean:app', 'bower', 'mustache', 'coffee:app', 'stylus', 'lineremover', 'concat', 'uglify', 'copy', 'compress']
  grunt.registerTask 'buildTest', ['clean', 'bower', 'mustache', 'coffee', 'stylus', 'lineremover', 'concat', 'uglify', 'copy']
  grunt.registerTask 'testClient', ['clean', 'bower', 'mustache', 'coffee', 'stylus', 'lineremover', 'concat', 'uglify', 'copy', 'open:test']
