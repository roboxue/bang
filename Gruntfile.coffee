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
        tasks: ['coffee', 'copy', 'lineremover']
      stylesheet:
        files: ['**/*.styl']
        tasks: ['stylus', 'copy', 'lineremover']
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
          {src: ['*.png'], dest: 'dist/'}
          {src: ['lib/**/*.js', 'lib/**/*.css'], dest: 'dist/', filter: 'isFile'}
          {src: 'lib/bootstrap/glyphicons-halflings-regular.eot', dest: 'dist/lib/fonts/glyphicons-halflings-regular.eot'},
          {src: 'lib/bootstrap/glyphicons-halflings-regular.svg', dest: 'dist/lib/fonts/glyphicons-halflings-regular.svg'},
          {src: 'lib/bootstrap/glyphicons-halflings-regular.ttf', dest: 'dist/lib/fonts/glyphicons-halflings-regular.ttf'},
          {src: 'lib/bootstrap/glyphicons-halflings-regular.woff', dest: 'dist/lib/fonts/glyphicons-halflings-regular.woff'},
          {src: ['manifest.json'], dest: 'dist/'}
        ]
    lineremover:
      excludeSourceMapping:
        files:
          'dist/lib/bootstrap/bootstrap.css': 'dist/lib/bootstrap/bootstrap.css'
        options:
          exclusionPattern: "sourceMappingURL"

  # These plugins provide necessary tasks.
  grunt.loadNpmTasks 'grunt-bower-task'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-line-remover'

  # Default task.
  grunt.registerTask 'default', ['coffee', 'stylus', 'bower', 'copy', 'lineremover']

