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
            // Watch for changes in .html files.
            watch_html: {
                files: ["app/*.html"]
            },
            // Watch for changes in .scss files.
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

        // Validate .html files before distribution.
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

        // Remove unused CSS code.
        uncss: {
            options: {
                // Solving problems with Bootstrap's navbar.
                ignore: [/\w\.in/,
                    ".fade",
                    ".collapse",
                    ".collapsing",
                    /(#|\.)navbar(\-[a-zA-Z]+)?/,
                    /(#|\.)dropdown(\-[a-zA-Z]+)?/,
                    /(#|\.)(open)/,
                    ".modal",
                    ".modal.fade.in",
                    ".modal-dialog",
                    ".modal-document",
                    ".modal-scrollbar-measure",
                    ".modal-backdrop.fade",
                    ".modal-backdrop.in",
                    ".modal.fade.modal-dialog",
                    ".modal.in.modal-dialog",
                    ".modal-open",
                    ".in",
                    ".modal-backdrop"]
            },
            dist: {
                files: {
                    // All files to uncss should be uncommented in app/index.html, then new file style.css in app/css will be created.
                    "app/css/style.css" : ["app/index.html"]
                }
            }
        },

        // Dynamically minify CSS.
        cssmin: {
            my_target: {
                files: [{
                    cwd: "app/css",
                    dest: "app/css",
                    expand: true,
                    ext: ".min.css",
                    src: ["style.css"]
                }]
            }
        },

        // Concat all JS minified files.
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */',
                separator: ";\n",
                stripBanner: true
            },
            dist: {
                dest: "app/js/index.min.js",
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

        // Copy necessary resources and files.
        copy: {
            main: {
                cwd: "app",
                dest: "dist",
                expand: true,
                src: ["fonts/*", "img/*", "css/style.min.css", "js/index.min.js"]
            }
        },

        // Dynamically minify unminified .html files. Before using comment/uncomment necessary code in index.html, look for 'CSS./JavaScript' and 'CSS/JavaScript after Grunt.'.
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


    // Default task - in this check make server and check whether or not gruntfile.js changed.
    grunt.registerTask("default", ["connect:dev", "watch:grunt"]);

    // Custom tasks, all tasks are ordered like they should be executed during development life cycle.
    grunt.registerTask("html_dev", ["connect:dev", "watch:watch_html"]); // Task for HTML development.
    grunt.registerTask("css_dev", ["connect:dev", "watch:watch_sass"]); // Task for CSS development.
    grunt.registerTask("quality", ["htmllint", "scsslint"]); // Task for check code quality.
    grunt.registerTask("optimize", ["uncss", "cssmin", "concat"]); // Task for code optimalization.
    grunt.registerTask("beta", ["connect:beta"]); // Task for distribution tests.
    grunt.registerTask("dist", ["imagemin", "copy", "htmlmin"]); // Task for distribution.
    grunt.registerTask("test", ["connect:dist"]); // Task for distribution tests.

    // Necessary for grunt-notify task.
    grunt.task.run("notify_hooks");
};