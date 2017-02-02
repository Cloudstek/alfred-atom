var fs = require('fs'),
    path = require('path'),
    fuzzaldrin = require('fuzzaldrin');

var AtomUtil = {};

/**
 * File exists
 * @param {string} file File path
 * @return {boolean}
 */
function fileExists(file)
{
    try {
        fs.statSync(file);
        return true;
    }
    catch (e) {
        return false;
    }
}

/**
 * Project title
 * @param {object} project Project object
 * @return {string}
 */
function getTitle(project)
{
    var title = project.title;

    if (project.group) {
        title += ' - ' + project.group;
    }

    return title;
}

/**
 * Project subtitle
 * @param {object} project Project object
 * @return {string}
 */
function getSubtitle(project)
{
    return project.paths.join(', ')
}

/**
 * Project icon
 * @param {object} project Project object
 * @return {string} Icon file
 */
function getIcon(project)
{
    var iconPaths = project.paths.map(function(iconPath) {
        return path.join(iconPath, 'icon.png');
    });

    if (project.icon) {
        var icon = project.icon.replace('icon-', '') + '-128.png';
        iconPaths.unshift(path.join('octicons', icon));
    }

    for (var i = 0; i < iconPaths.length; i++) {
        if(fileExists(iconPaths[i])) {
            return iconPaths[i];
        }
    }
    return 'icon.png';
}

/**
 * Get atom arguments
 * @param {object} project Project object
 * @param {array} args Extra commandline arguments
 * @param {string} app Command to open project paths with
 * @return {string}
 */
function getArgument(project)
{
    return '"' + project.paths.join('" "') + '"';
}

/**
 * Filter projects
 *
 * @param {array} projects Projects list
 * @param {string} query Search query
 * @param {array} keys Project object keys to search
 * @return {array} Filtered and sorted projects
 */
AtomUtil.filterProjects = function(projects, query, keys)
{
    if (query) {
        var scoredCandidates = {};

        for (projectIndex in projects) {
            let project = projects[projectIndex];
            for (keyIndex in keys) {
                let key = keys[keyIndex];
                let score = fuzzaldrin.score(project[key], query);

                if (score > 0) {
                    if (!scoredCandidates[project.title]) {
                        scoredCandidates[project.title] = {project, score};
                        continue;
                    }
                    scoredCandidates[project.title].score += score
                }
            }
        }

        // Sort by score
        scoredCandidates = Object.entries(scoredCandidates).sort((a, b) => {
            return b[1].score - a[1].score;
        });

        // Only return projects
        projects = scoredCandidates.map((a) => {
            return a[1].project;
        });
    }

    return projects;
}

/**
 * Parse projects
 * @param {object} object Projects list
 * @param {string} query Search query
 * @return {object}
 */
AtomUtil.parseProjects = function(object, query)
{
    var projects = [];

    // Check and add project to list.
    Object.keys(object || {}).map(function(key) {
        var project = object[key];
        if (project && project.paths && project.title) {
            projects.push(project);
        }
    });

    if (query) {
        // Perform search.
        projects = this.filterProjects(projects, query, ['title', 'group']);
    }
    else {
        // Return all projects.
        projects = projects.sort(function(a, b) {
            return a.title.localeCompare(b.title);
        });
    }

    // Return list.
    return projects.map(function(project) {
        return {
            title: getTitle(project),
            subtitle: getSubtitle(project),
            icon: getIcon(project),
            arg: getArgument(project),
            valid: true
        };
    });
};

module.exports = AtomUtil;
