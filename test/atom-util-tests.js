'use strict';
var path = require('path');
var expect = require('chai').expect;
var AtomUtil = require('../src/atom-util');

describe('Atom Util', () => {
    var object;

    beforeEach(() => {
        object = {
            project1: {
                title: 'Project #1',
                paths: ['dir/path1']
            },
            project2: {
                title: 'Project #2',
                paths: ['dir/path2']
            }
        };
    });

    describe('Projects object parsing', () => {
        it('parses basic object', done => {
            AtomUtil
                .parseProjects(object)
                .then(projects => {
                    expect(projects).to.have.lengthOf(2);
                    expect(projects[0]).to.deep.equal({
                        title: 'Project #1',
                        subtitle: 'dir/path1',
                        icon: 'icon.png',
                        arg: '"dir/path1"',
                        valid: true,
                        uid: 'project_#1',
                        text: {
                            copy: '"dir/path1"'
                        }
                    });
                    expect(projects[1]).to.deep.equal({
                        title: 'Project #2',
                        subtitle: 'dir/path2',
                        icon: 'icon.png',
                        arg: '"dir/path2"',
                        valid: true,
                        uid: 'project_#2',
                        text: {
                            copy: '"dir/path2"'
                        }
                    });

                    done();
                });
        });

        it('handles no arguments', done => {
            AtomUtil
                .parseProjects()
                .then(projects => {
                    expect(projects).to.be.a('array');
                    expect(projects).to.have.lengthOf(0);
                    done();
                });
        });

        it('handles undefined object', done => {
            AtomUtil
                .parseProjects(undefined, 'project')
                .then(projects => {
                    expect(projects).to.be.a('array');
                    expect(projects).to.have.lengthOf(0);
                    done();
                });
        });

        it('parses project with multiple paths', done => {
            object.project1.paths = ['dir/path3', 'dir/path4'];
            AtomUtil
                .parseProjects(object)
                .then(projects => {
                    expect(projects).to.have.lengthOf(2);
                    expect(projects[0]).to.deep.include({
                        subtitle: 'dir/path3, dir/path4',
                        arg: '"dir/path3" "dir/path4"'
                    });

                    done();
                });
        });

        it('append group', done => {
            object.project1.group = 'group1';
            AtomUtil
                .parseProjects(object)
                .then(projects => {
                    expect(projects[0].title).to.equal('Project #1 - group1');

                    done();
                });
        });

        it('checks paths for an icon', done => {
            var projectPath = path.join(__dirname, '..');
            object.project1.paths.push(projectPath);
            AtomUtil
                .parseProjects(object)
                .then(projects => {
                    expect(projects[0].icon).to.equal(path.join(projectPath, 'icon.png'));
                    expect(projects[1].icon).to.equal('icon.png');

                    done();
                });
        });

        it('accepts icon key', done => {
            object.project1.icon = 'icon-book';
            AtomUtil
                .parseProjects(object)
                .then(projects => {
                    expect(projects[0].icon).to.equal('octicons/book-128.png');
                    expect(projects[1].icon).to.equal('icon.png');

                    done();
                });
        });

        it('handles non-existing icon', done => {
            object.project2.icon = 'non-existing';
            AtomUtil
                .parseProjects(object)
                .then(projects => {
                    expect(projects[1].icon).to.equal('icon.png');

                    done();
                });
        });
    });

    describe('Projects filtering', () => {
        it('filters results by title', done => {
            AtomUtil
                .parseProjects(object, 'ct2')
                .then(projects => {
                    expect(projects).to.have.lengthOf(1);
                    expect(projects[0].title).to.equal('Project #2');

                    done();
                });
        });

        it('filters results by group', done => {
            object.project1.group = 'test group';
            AtomUtil
                .parseProjects(object, 'test group')
                .then(projects => {
                    expect(projects).to.have.lengthOf(1);
                    expect(projects[0].title).to.equal('Project #1 - test group');

                    done();
                });
        });

        it('handles empty filter query', done => {
            AtomUtil
                .parseProjects(object, '')
                .then(projects => {
                    expect(projects).to.have.lengthOf(2);

                    done();
                });
        });
    });

    describe('Malformed projects object', () => {
        it('handles missing title', done => {
            delete object.project1.title;
            AtomUtil
                .parseProjects(object, '')
                .then(projects => {
                    expect(projects).to.have.lengthOf(1);

                    done();
                });
        });

        it('handles missing path (templates)', done => {
            delete object.project1.paths;
            AtomUtil
                .parseProjects(object, '')
                .then(projects => {
                    expect(projects).to.have.lengthOf(1);

                    done();
                });
        });
    });
});
