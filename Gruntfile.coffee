module.exports = (grunt) ->
  chromeExtensionVersionNumber = grunt.file.readJSON('src/extensions/chrome/manifest.json').version
  console.log 'Chrome Extension Version Number ' + chromeExtensionVersionNumber

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
        src: ['src/extensions/chrome/*.mustache']
        dest: 'lib/templates.js'
        options:
          prefix: 'bangExtensionTemplates = '
          postfix: ';'
    coffee:
      app:
        options:
          bare: true
          join: true
        files:
          'lib/master.js': [
            'src/views/*.coffee'
            'src/extensions/chrome/master.coffee'
          ]
          'lib/milk/milk.js': 'node_modules/milk/milk.coffee'
      testClient:
        options:
          bare: true
          join: true
        files:
          'test/client.test.js': [
            'test/**/*.test.coffee'
          ]
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
            "lib/underscore/underscore.js"
            "lib/backbone/backbone.js"
            "lib/URIjs/URI.js"
            "lib/milk/milk.js"
          ]
          'lib/master.js': [
            'lib/templates.js'
            'lib/master.js'
          ]
    uglify:
      options:
        preserveComments: "some"
      app:
        files:
          'lib/lib.min.js': 'lib/lib.js'
    copy:
      chrome:
        files: [
          {expand: true, src: ['*.png'], dest: 'dist/chrome'}
          {expand: true, flatten: true, cwd: 'lib', src: ['**/*.css'], dest: 'dist/chrome/css', filter: 'isFile'}
          {expand: true, cwd: 'lib/bootstrap/', src: [
            'glyphicons-halflings-regular.eot', 'glyphicons-halflings-regular.svg', 'glyphicons-halflings-regular.ttf', 'glyphicons-halflings-regular.woff', 'glyphicons-halflings-regular.woff2'
          ], dest: 'dist/chrome/fonts'}
          {expand: true, cwd: 'src/extensions/chrome/', src: ['manifest.json', 'background.js'], dest: 'dist/chrome/'}
          {expand: true, flatten: true, cwd: 'lib', src: ['lib.min.js', 'Bang.js/Bang.js', 'master.js'], dest: 'dist/chrome/lib/'}
        ]
      opera:
        files: [
          {expand: true, src: ['*.png'], dest: 'dist/opera'}
          {expand: true, flatten: true, cwd: 'lib', src: ['**/*.css'], dest: 'dist/opera/css', filter: 'isFile'}
          {expand: true, cwd: 'lib/bootstrap/', src: [
            'glyphicons-halflings-regular.eot', 'glyphicons-halflings-regular.svg', 'glyphicons-halflings-regular.ttf', 'glyphicons-halflings-regular.woff', 'glyphicons-halflings-regular.woff2'
          ], dest: 'dist/opera/fonts'}
          {expand: true, cwd: 'src/extensions/chrome/', src: ['manifest.json', 'background.js'], dest: 'dist/opera/'}
          {expand: true, flatten: true, cwd: 'lib', src: ['lib.min.js', 'Bang.js/Bang.js', 'master.js'], dest: 'dist/opera/lib/'}

          {expand: true, flatten: true, src: ["lib/jquery/jquery.js","lib/d3/d3.js","lib/underscore/underscore.js","lib/backbone/backbone.js","lib/URIjs/URI.js","lib/milk/milk.js"], dest: 'dist/opera/src/lib'}
          {expand: true, cwd: 'src', src: ['views/*.coffee'], dest: 'dist/opera/src/'}
          {expand: true, flatten: true, cwd: 'src', src: ['extensions/chrome/*.coffee', 'extensions/chrome/*.js'], dest: 'dist/opera/src/'}
          {expand: true, cwd: 'bower_components/Bang.js/src', src: ['collections/*.coffee', 'models/*.coffee', 'views/*.coffee'], dest: 'dist/opera/src/'}
        ]
    watch:
      app:
        files: ['src/**/*.coffee', 'src/extensions/chrome/*']
        tasks: ['mustache', 'coffee:app', 'lineremover', 'concat', 'uglify', 'copy']
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
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-line-remover'
  grunt.loadNpmTasks 'grunt-mustache'
  grunt.loadNpmTasks 'grunt-open'

  # Default task.
  grunt.registerTask 'default', ['clean:app', 'bower', 'mustache', 'coffee:app', 'lineremover', 'concat', 'uglify', 'copy', 'compress']
  grunt.registerTask 'buildTest', ['clean', 'bower', 'mustache', 'coffee', 'lineremover', 'concat', 'uglify', 'copy']
  grunt.registerTask 'testClient', ['clean', 'bower', 'mustache', 'coffee', 'lineremover', 'concat', 'uglify', 'copy', 'open:test']
