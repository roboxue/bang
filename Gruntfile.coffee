module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      app:
        expand: true
        cwd: 'src'
        src: ['**/*.coffee']
        dest: 'lib'
        ext: '.js'
    stylus:
      compile:
        files:
          'lib/bang.css': 'src/bang.styl'
    watch:
      app:
        files: ['**/*.coffee', 'manifest.json']
        tasks: ['coffee', 'copy']
      stylesheet:
        files: ['**/*.styl']
        tasks: ['stylus', 'copy']
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
    copy:
      dist:
        files: [
          {src: ['lib/**/*.js', 'lib/**/*.css'], dest: 'dist/', filter: 'isFile'}
          {src: 'lib/bootstrap/glyphicons-halflings-regular.eot', dest: 'dist/lib/fonts/glyphicons-halflings-regular.eot'},
          {src: 'lib/bootstrap/glyphicons-halflings-regular.svg', dest: 'dist/lib/fonts/glyphicons-halflings-regular.svg'},
          {src: 'lib/bootstrap/glyphicons-halflings-regular.ttf', dest: 'dist/lib/fonts/glyphicons-halflings-regular.ttf'},
          {src: 'lib/bootstrap/glyphicons-halflings-regular.woff', dest: 'dist/lib/fonts/glyphicons-halflings-regular.woff'},
          {src: ['manifest.json'], dest: 'dist/'}
        ]
          

  # These plugins provide necessary tasks.
  grunt.loadNpmTasks 'grunt-bower-task'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-stylus'

  # Default task.
  grunt.registerTask 'default', ['coffee', 'stylus', 'bower', 'copy']

