'use strict';

var Hugo = require('alfred-hugo');
var CSON = require('cson-parser');
var path = require('path');

var Project = require('./project');
var Icons = require('./icons');

Hugo.action('projects', function (query) {
    var homedir = process.env.HOME || '';
    var projectsPath = path.resolve(homedir, '.atom', 'projects.cson');

    var projectsFile = Hugo.cacheFile(projectsPath, 'projects');

    projectsFile.on('change', function (cache, file) {
        var projects = CSON.parse(file) || [];

        projects = Project.parseAll(projects);

        projects.sort(function (a, b) {
            var nameA = a.title.toLowerCase();
            var nameB = b.title.toLowerCase();

            if (nameA < nameB) {
                return -1;
            }

            if (nameA > nameB) {
                return 1;
            }

            return 0;
        });

        cache.store(projects);
    });

    var projects = projectsFile.get();

    if (projects && Array.isArray(projects)) {
        Hugo.addItems(projects);
    }

    Hugo.addItem({
        title: 'Rebuild project icons',
        arg: {
            variables: {
                task: 'rebuild-icons'
            }
        }
    });

    Hugo.filterItems(query);

    if (Hugo.itemCount < 1) {
        Hugo.addItem({
            title: 'No projects found.'
        });
    }

    Hugo.feedback();
});

Hugo.action('rebuild-icons', function () {
    var themePath = Hugo.alfredMeta.themeFile;
    var lastTheme = Hugo.cache.get('lastTheme');

    if (!lastTheme) {
        Hugo.cache.set('lastTheme', Hugo.alfredMeta.theme);
        Icons.rebuild();
        return;
    }

    if (lastTheme !== Hugo.alfredMeta.theme) {
        Hugo.cache.set('lastTheme', Hugo.alfredMeta.theme);
        Icons.rebuild();
        return;
    }

    if (themePath) {
        var themeFile = Hugo.cacheFile(themePath, 'theme');

        themeFile.on('change', function () {
            Icons.rebuild();
        });

        themeFile.get();
    }
});