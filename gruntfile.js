module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"), // Initialize configuration file, which is package.json.

        notify_hooks: {
            options: {
                enable: true,
                max_jshint_notifications: 5
            }
        },

        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: "img/",
                    src: ["**/*.{png,jpg,gif}"],
                    dest: "img/"
                }]
            }
        },

        sass: {
            dist: {
                options: {
                    style: "expanded",
                    sourcemap: "none"
                },
                files: {
                    "css/styles.css" : "sass/styles.scss"
                }
            }
        },

        uncss: {
            dist: {
                files: {
                    "css/styles.css" : ["index.html"]
                }
            }
        },

        // Definition for a used plugin, in this case cssmin.
        cssmin: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: "css/",
                    src: ["*.css", "!*.min.css"],
                    dest: "css/",
                    ext: ".min.css"
                }]
            }
        }
    });

    // Loading Grunt tasks.
    grunt.loadNpmTasks("grunt-contrib-imagemin");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-uncss");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-notify");


    // Default task.
    grunt.registerTask("default", ["imagemin", "sass", "uncss", "cssmin"]);

    // Necessary for grunt-notify task.
    grunt.task.run("notify_hooks");
};