module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      app:
        expand: true
        cwd: 'src'
        src: ['**/*.coffee']
        dest: 'lib'
        ext: '.js'
    watch:
      app:
        files: ['**/*.coffee', 'manifest.json']
        tasks: ['coffee', 'copy']
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
          {expand: true, src: ['lib/**'], dest: 'dist/', filter: 'isFile'}
          {src: ['manifest.json'], dest: 'dist/'}
        ]
          

  # These plugins provide necessary tasks.
  grunt.loadNpmTasks 'grunt-bower-task'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  # Default task.
  grunt.registerTask 'default', ['coffee', 'bower', 'copy']

