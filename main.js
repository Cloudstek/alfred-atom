#!/usr/bin/env node

var AlfredNode = require('alfred-workflow-nodejs'),
  workflow = AlfredNode.workflow,
  CSON = require('season'),
  AtomUtil = require('./src/atom-util');

AlfredNode.actionHandler.onAction('projects', function(query) {
  var file = process.env.HOME + '/.atom/projects.cson';

  CSON.readFile(file, function(err, object) {
    var projects = [];

    if (err) {
      projects.push({
        title: 'No projects file found',
        subtitle: file
      });
    }
    else {
      projects = AtomUtil.parseProjects(object, query);
      if (projects.length < 1) {
        projects.push({
          title: 'No projects found'
        });
      }
    }

    projects.map(function(project) {
      workflow.addItem(new AlfredNode.Item(project));
    });
    workflow.feedback();
  });
});

AlfredNode.run();
