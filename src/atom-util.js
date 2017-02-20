'use strict';
const fs = require('fs');
const path = require('path');
const fuzzaldrin = require('fuzzaldrin');

var AtomUtil = {};

/**
 * File exists
 * @param {string} file File path
 * @return {boolean}
 */
function fileExists(file) {
    try {
        fs.statSync(file);
        return true;
    } catch (err) {
        return false;
    }
}

function getUid(project) {
    return project.title.toLowerCase().replace(' ', '_');
}

/**
 * Project title
 * @param {object} project Project object
 * @return {string}
 */
function getTitle(project) {
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
function getSubtitle(project) {
    return project.paths.join(', ');
}

/**
 * Project icon
 * @param {object} project Project object
 * @return {string} Icon file
 */
function getIcon(project) {
    let iconPaths = [];

    if (project.icon) {
        if (fileExists(project.icon)) {
            return project.icon;
        }

        let icon = project.icon.replace('icon-', '') + '-128.png';
        iconPaths.unshift(path.join('octicons', icon));
    }

    // Search every project root dir for icon.png
    project.paths.map(projectPath => {
        iconPaths.push(path.join(projectPath, 'icon.png'));
        return projectPath;
    });

    for (let iconPath in iconPaths) {
        if (fileExists(iconPaths[iconPath])) {
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
function getArgument(project) {
    return '"' + project.paths.join('" "') + '"';
}

/**
 * Parse project
 * @param {object} project Atom project
 * @return {Promise}
 */
async function parseProject(project) {
    var score = null;
    var filtered = 'score' in project;

    // Item is filtered project and we have to work some magic.
    if (filtered) {
        score = project.score;
        project = project.project;
    }

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

    // Add sorting criteria (uid or match score)
    if (filtered) {
        item.score = score;
    } else {
        item.uid = getUid(project);
    }

    return item;
}

/**
 * Filter projects
 *
 * @param {Array} projects Projects list
 * @param {String} query Search query
 * @param {Array} keys Project object keys to search
 * @return {Array} Filtered and sorted projects
 */
async function filterProjects(projects, query, keys) {
    if (!query) {
        return [];
    }

    const projectPromises = projects
        .map(async project => {
            let candidate = {project: project, score: 0};

            const candidatePromises = keys.map(async key => {
                return fuzzaldrin.score(project[key], query);
            });

            let scores = await Promise.all(candidatePromises);

            scores.map(score => {
                candidate.score += score;
                return score;
            });

            return candidate;
        });

    let filteredProjects = await Promise.all(projectPromises);

    return filteredProjects.filter(project => project.score > 0);
}

/**
 * Parse projects
 * @param {object} object Projects list
 * @param {string} query Search query
 * @return {Promise}
 */
AtomUtil.parseProjects = async (object, query) => {
    var projects = [];
    var promises = [];

    // Check and add project to list.
    Object.keys(object || {}).map(key => {
        let project = object[key];
        if (project && project.paths && project.title) {
            projects.push(project);
        }
        return key;
    });

    // Perform search.
    if (query) {
        projects = await filterProjects(projects, query, ['title', 'group']);
    }

    // Parse projects async
    projects.map(project => {
        promises.push(parseProject(project));
        return project;
    });

    // Await all promises
    return Promise.all(promises)
        .then(projects => {
            projects = projects || [];

            if (query) {
                // Sort by score
                projects = projects.sort((a, b) => {
                    return b.score - a.score;
                });
            } else {
                // Sort by title
                projects = projects.sort((a, b) => {
                    return a.title.localeCompare(b.title);
                });
            }

            // Return projects
            return projects;
        });
};

module.exports = AtomUtil;
