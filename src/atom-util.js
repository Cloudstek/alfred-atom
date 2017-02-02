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

function getUid(project)
{
    return project.title.toLowerCase().replace(' ', '_');
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
    let iconPaths = project.paths.map((projectPath) => {
        return path.join(projectPath, 'icon.png');
    });

    if (project.icon) {
        let icon = project.icon.replace('icon-', '') + '-128.png';
        iconPaths.unshift(path.join('octicons', icon));
    }

    for (let iconPath in iconPaths) {
        if(fileExists(iconPaths[iconPath])) {
            return iconPaths[iconPath];
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
    // TODO: Use fuzzaldrin directly once it has support for multpiple keys. PR has been made.
    if (query) {
        let scoredCandidates = {};

        for (let projectIndex in projects) {
            let project = projects[projectIndex];
            for (let keyIndex in keys) {
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

    // Sort projects
    projects = projects.sort(function(a, b) {
        return a.title.localeCompare(b.title);
    });

    // Perform search.
    if (query) {
        projects = this.filterProjects(projects, query, ['title', 'group']);
    }

    // Return list.
    return projects.map(function(project) {
        var item = {
            title: getTitle(project),
            subtitle: getSubtitle(project),
            icon: getIcon(project),
            arg: getArgument(project),
            valid: true,
            text: {
                copy: getArgument(project)
            }
        };

        // If atom filters results, set UID.
        if(!query) {
            item.uid = getUid(project);
        }

        return item;
    });
};

module.exports = AtomUtil;
