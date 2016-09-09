module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"), // Initialize configuration file, which is package.json.

        // Notify success and failure informations.
        notify_hooks: {
            options: {
                duration: 5,
                enable: true,
                max_jshint_notifications: 5,
                success: true
            }
        },

        // Start a static web server.
        connect: {
            // Server for development.
            dev: {
                options: {
                    base: "app",
                    debug: true,
                    hostname: "localhost",
                    livereload: true,
                    port: 3000
                }
            },
            // Server for tests before distribution.
            beta: {
                options: {
                    base: "app",
                    debug: true,
                    hostname: "localhost",
                    keepalive: true,
                    port: 3001
                }
            },
            // Server for distribution tests.
            dist: {
                options: {
                    base: "dist",
                    debug: true,
                    hostname: "localhost",
                    keepalive: true,
                    port: 3002
                }
            }
        },

        // Watcher for changes in files.
        watch: {
            options: {
                dateFormat: function(time) {
                    grunt.log.writeln('The watch finished in ' + time + 'ms at ' + (new Date()).toString());
                    grunt.log.writeln('Waiting for more changes...');
                },
                livereload: true
            },
            // Watch for changes at .html files in app directory.
            watch_html: {
                files: ["app/*.html"]
            },
            // Watch for changes at .scss files in app directory.
            watch_sass: {
                files: ["app/sass/*.scss"],
                tasks: ["sass"] // If changes occured, then run sass task (compile from SCSS to CSS).
            },

            grunt: {
                files: ["gruntfile.js"],
                options: {
                    reload: true
                }
            }
        },

        // Dynamically compile SASS to CSS.
        sass: {
            dist: {
                options: {
                    lineNumber: true,
                    noCache: true,
                    sourcemap: "none",
                    style: "expanded"
                },
                files: [{
                    cwd: "app/sass",
                    dest: "app/css",
                    expand: true,
                    ext: ".css",
                    src: ["*.scss"]
                }]
            }
        },

        // Validate .html files within app directory.
        htmllint: {
            all: ["app/*.html"],
            options: {
                force: true
            }
        },

        // Help with writing clean SASS code.
        scsslint: {
            allFiles: [
                "app/sass/*.scss"
            ],
            options: {
                colorizeOutput: true,
                config: ".scss-lint.yml",
                force: true
            }
        },

        // Remove unused CSS code in index.html from app/css/style.css and libraries.
        uncss: {
            custom: {
                files: {
                    "app/css/style.css" : ["app/index.html"] // Remove unused CSS from app/css/style.css, need to comment all libraries in index.html and leave only css/style.css. Make it second, in such case comment the first one.
                }
            },
            libs: {
                files: {
                    "app/css/libs.min.css" : ["app/index.html"] // Remove unused CSS from all libraries, need to comment css/style.css in index.html and leave only libraries to uncss. Make it first, in such case comment the second one.
                }
            }
        },

        // Dynamically minify unminified .css files.
        cssmin: {
            my_target: {
                files: [{
                    cwd: "app/css",
                    dest: "app/css",
                    expand: true,
                    ext: ".min.css",
                    src: ["*.css", "!*.min.css"]
                }]
            }
        },

        // Concat all JS libraries minified code in dist/js directory.
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */',
                separator: ";\n",
                stripBanner: true
            },
            dist: {
                dest: "app/js/libs.min.js",
                src: ["app/js/jquery.min.js", "app/js/bootstrap.min.js"] // Bootstrap always after jQuery.
            }
        },

        // Dynamically minify images.
        imagemin: {
            dynamic: {
                files: [{
                    cwd: "app/img",
                    dest: "dist/img",
                    expand: true,
                    src: ["**/*.{png,jpg,gif}"]
                }]
            }
        },

        // Copy fonts, img directories, 2 CSS minified/concated files and 1 JS minified/concated file from working directory to distribution directory.
        copy: {
            main: {
                cwd: "app",
                dest: "dist",
                expand: true,
                src: ["fonts/*", "img/*", "css/libs.min.css", "css/style.min.css", "js/libs.min.js"]
            }
        },

        // Dynamically minify unminified .html files (collapsing whitespaces to 1 space and removing comments). Before using comment/uncomment necessary code in index.html, look for 'CSS./JavaScript' and 'CSS/JavaScript afer Grunt.'.
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    removeComments: true
                },
                files: [{
                    cwd: "app",
                    dest: "dist",
                    expand: true,
                    src: "*.html"
                }]
            }
        }
    });

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    // Loading Grunt tasks.
    grunt.loadNpmTasks("grunt-notify");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-html");
    grunt.loadNpmTasks("grunt-scss-lint");
    grunt.loadNpmTasks("grunt-uncss");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-imagemin");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");


    // Default task - in this check whether or not gruntfile.js changed.
    grunt.registerTask("default", ["watch:grunt"]);

    // Custom tasks, all tasks are ordered like they should be executed during development life cycle.
    grunt.registerTask("html_dev", ["connect:dev", "watch:watch_html"]); // Task for HTML development.
    grunt.registerTask("css_dev", ["connect:dev", "watch:watch_sass"]); // Task for CSS development.
    grunt.registerTask("quality", ["htmllint", "scsslint"]); // Task for check code quality.
    grunt.registerTask("optimize_custom", ["uncss:custom", "cssmin"]); // Task for code optimalization custom code.
    grunt.registerTask("optimize_libs", ["uncss:libs", "cssmin", "concat"]); // Task for code optimalization libraries code.
    grunt.registerTask("dist", ["imagemin", "copy", "htmlmin"]); // Task for distribution.
    grunt.registerTask("test", ["connect:dist"]); // Task for distribution tests.

    // Necessary for grunt-notify task.
    grunt.task.run("notify_hooks");
};