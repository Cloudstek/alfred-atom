'use strict';
const alfy = require('alfy');
const cson = require('season');
const AtomUtil = require('./lib/atom-util');

const projects = cson.readFileSync(process.env.HOME + '/.atom/projects.cson');

// Parse projects.
AtomUtil
    .parseProjects(projects, alfy.input)
    .then(projects => {
        if (projects.length < 1) {
            alfy.output([{
                title: 'No projects found.'
            }]);

            return;
        }

        alfy.output(projects);
    });
