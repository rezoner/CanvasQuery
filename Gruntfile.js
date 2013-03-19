module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: '/*!\n' +
                ' * CanvasQuery v<%= pkg.version %>\n' +
                ' * http://canvasquery.com/\n' +
                ' *\n' +
                ' * Copyright (c) 2012-2013 http://rezoner.net\n' +
                ' *\n' +
                ' * Released under the MIT license\n' +
                ' * http://opensource.org/licenses/MIT\n' +
                ' */\n',
        separator: '\n'
      },
      dist: {
        src: [
          'src/intro.js',
          'src/core.js',
          'src/wrapper.js',
          'src/color.js',
          'src/exports.js',
          'src/outro.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.title %> v<%= pkg.version %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};