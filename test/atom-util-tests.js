var path = require('path'),
    expect = require('chai').expect,
    AtomUtil = require('../src/atom-util');

describe('Atom Util', function() {
    var object;

    beforeEach(function() {
        object = {
            'project1': {
                title: 'Project #1',
                paths: ['dir/path1']
            },
            'project2': {
                title: 'Project #2',
                paths: ['dir/path2']
            }
        };
    });

    describe('Projects object parsing', function() {
        it('parses basic object', function() {
            var projects = AtomUtil.parseProjects(object);
            expect(projects).to.have.lengthOf(2);
            expect(projects[0]).to.deep.equal({
                title: 'Project #1',
                subtitle: 'dir/path1',
                icon: 'icon.png',
                arg: '\"dir/path1\"',
                valid: true,
                uid: 'project_#1',
                text: {
                    copy: '\"dir/path1\"'
                }
            });
            expect(projects[1]).to.deep.equal({
                title: 'Project #2',
                subtitle: 'dir/path2',
                icon: 'icon.png',
                arg: '\"dir/path2\"',
                valid: true,
                uid: 'project_#2',
                text: {
                    copy: '\"dir/path2\"'
                }
            });
        });

        it('handles no arguments', function() {
            var projects = AtomUtil.parseProjects();
            expect(projects).to.be.a('array');
            expect(projects).to.have.lengthOf(0);
        });

        it('handles undefined object', function() {
            var projects = AtomUtil.parseProjects(undefined, 'project');
            expect(projects).to.be.a('array');
            expect(projects).to.have.lengthOf(0);
        });

        it('parses project with multiple paths', function() {
            object.project1.paths = ['dir/path3', 'dir/path4'];
            var projects = AtomUtil.parseProjects(object);
            expect(projects).to.have.lengthOf(2);
            expect(projects[0]).to.deep.include({
                subtitle: 'dir/path3, dir/path4',
                arg: '\"dir/path3\" \"dir/path4\"'
            });
        });

        it('append group', function() {
            object.project1.group = 'group1';
            var projects = AtomUtil.parseProjects(object);
            expect(projects[0].title).to.equal('Project #1 - group1');
        });

        it('checks paths for an icon', function() {
            var projectPath = path.join(__dirname, '..');
            object.project1.paths.push(projectPath);
            var projects = AtomUtil.parseProjects(object);
            expect(projects[0].icon).to.equal(path.join(projectPath, 'icon.png'));
            expect(projects[1].icon).to.equal('icon.png');
        });

        it('accepts icon key', function() {
            object.project1.icon = 'icon-book';
            var projects = AtomUtil.parseProjects(object);
            expect(projects[0].icon).to.equal('octicons/book-128.png');
            expect(projects[1].icon).to.equal('icon.png');
        });

        it('handles non-existing icon', function() {
            object.project2.icon = 'non-existing';
            var projects = AtomUtil.parseProjects(object);
            expect(projects[1].icon).to.equal('icon.png');
        });
    });

    describe('Projects filtering', function() {
        it('filters results by title', function() {
            var projects = AtomUtil.parseProjects(object, 'ct2');
            expect(projects).to.have.lengthOf(1);
            expect(projects[0].title).to.equal('Project #2');
        });

        it('filters results by group', function() {
            object.project1.group = 'test group';
            var projects = AtomUtil.parseProjects(object, 'test group');
            expect(projects).to.have.lengthOf(1);
            expect(projects[0].title).to.equal('Project #1 - test group');
        });

        it('handles empty filter query', function() {
            var projects = AtomUtil.parseProjects(object, '');
            expect(projects).to.have.lengthOf(2);
        });
    });

    describe('Malformed projects object', function() {
        it('handles missing title', function() {
            delete object.project1.title;
            var projects = AtomUtil.parseProjects(object, '');
            expect(projects).to.have.lengthOf(1);
        });

        it('handles missing path (templates)', function() {
            delete object.project1.paths;
            var projects = AtomUtil.parseProjects(object, '');
            expect(projects).to.have.lengthOf(1);
        });
    });
});
