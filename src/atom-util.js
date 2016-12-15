var fs = require('fs'),
  path = require('path'),
  fuzzaldrin = require('fuzzaldrin');

var AtomUtil = {};

function fileExists(file) {
  try {
    // TODO: Should probably use async version
    fs.statSync(file);
    return file;
  }
  catch (e) {}
}

function getTitle(project) {
  return project.title;
}

function getSubtitle(project) {
  var subtitle = project.paths.join(', ');
  if (project.group) {
    subtitle += ' [' + project.group + ']';
  }
  return subtitle;
}

function getIcon(project) {
  var iconPaths = project.paths.map(function(iconPath) {
    return path.join(iconPath, 'icon.png');
  });

  if (project.icon) {
    var icon = project.icon.replace('icon-', '') + '-128.png';
    iconPaths.unshift(path.join('octicons', icon));
  }

  for (var i = 0; i < iconPaths.length; i++) {
    var iconPath = fileExists(iconPaths[i]);
    if (iconPath) {
      return iconPath;
    }
  }
  return 'icon.png';
}

function getArgument(project) {
  var arg = project.paths.join(' ');
  if (project.devMode) {
    arg += ' -d';
  }
  return arg;
}

AtomUtil.parseProjects = function(object, query) {
  var projects = [];

  Object.keys(object || {}).map(function(key) {
    var project = object[key];
    if (project && project.paths && project.title) {
      projects.push(project);
    }
  });

  if (query) {
    projects = fuzzaldrin.filter(projects, query, {key: 'title'});
  }
  else {
    projects = projects.sort(function(a, b) {
      return a.title.localeCompare(b.title);
    });
  }

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
