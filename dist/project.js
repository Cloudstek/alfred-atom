"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cson_parser_1 = __importDefault(require("cson-parser"));
const change_case_1 = __importDefault(require("change-case"));
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const utils = __importStar(require("./utils"));
const icons_1 = require("./icons");
class Projects {
    /**
     * Parse project
     */
    static parse(project, octicons) {
        if (project.paths.length === 0) {
            console.warn("Skipping project missing paths, possibly a template.");
            return null;
        }
        if (!octicons) {
            octicons = icons_1.Icons.all();
        }
        const item = {
            uid: Buffer.from(this.title(project) + this.subTitle(project), "utf8").toString("base64"),
            title: this.title(project),
            subtitle: this.subTitle(project),
            icon: {
                path: this.icon(project, octicons),
            },
            arg: this.openArgument(project, this.atomApp),
            valid: project.paths && project.paths.length > 0,
            mods: {
                alt: {
                    valid: true,
                    subtitle: "Open project path(s) in terminal",
                    arg: this.openArgument(project, this.terminalApp),
                },
                cmd: {
                    valid: true,
                    subtitle: "Open in new window",
                    arg: this.openArgument(project, this.atomApp, ["-n"]),
                },
                ctrl: {
                    valid: true,
                    subtitle: "Open in development mode",
                    arg: this.openArgument(project, this.atomApp, ["-d"]),
                },
                fn: {
                    valid: true,
                    subtitle: "Append project path(s) to last open window",
                    arg: this.openArgument(project, this.atomApp, ["-a"]),
                },
                shift: {
                    valid: true,
                    subtitle: "Open project path(s) in finder",
                    arg: this.openArgument(project, "Finder"),
                },
            },
        };
        return item;
    }
    /**
     * Parse a list of projects
     */
    static parseAll(projects) {
        const results = [];
        const octicons = icons_1.Icons.all();
        for (const project of projects) {
            const p = this.parse(project, octicons);
            if (p && p !== null) {
                results.push(p);
            }
        }
        return results;
    }
    /**
     * Parse all projects from a CSON file.
     */
    static parseCson(file) {
        // Read projects file
        const projects = cson_parser_1.default.parse(file) || [];
        return this.parseAll(projects);
    }
    /**
     * Find git repositories and turn it into a list of results
     */
    static findGitRepositories(projectHome, prettifyTitle = true) {
        const projects = [];
        const dirs = glob_1.default.sync("*/.git", {
            cwd: projectHome,
        });
        dirs.forEach((dir) => {
            dir = dir.substring(0, dir.indexOf("/.git"));
            const project = {
                title: prettifyTitle ? change_case_1.default.title(dir) : dir,
                group: "Git repository",
                paths: [
                    path_1.default.resolve(projectHome, dir),
                ],
            };
            projects.push(project);
        });
        return this.parseAll(projects);
    }
    /**
     * Project title
     */
    static title(project) {
        let title = project.title;
        if (project.group) {
            title += " - " + project.group;
        }
        return title;
    }
    /**
     * Project sub-title
     */
    static subTitle(project) {
        return project.paths.join(", ");
    }
    /**
     * Project icon
     */
    static icon(project, octicons) {
        const iconPaths = [];
        if (!octicons) {
            octicons = icons_1.Icons.all();
        }
        if (project.icon) {
            // Octicon
            if (project.icon.startsWith("icon-")) {
                const octiconNames = Object.keys(octicons);
                if (octiconNames.indexOf(project.icon.slice(5)) >= 0) {
                    return path_1.default.join(__dirname, "icons", project.icon.slice(5) + ".png");
                }
            }
            // Replace tilde
            if (project.icon.startsWith("~/")) {
                const homedir = process.env.HOME || "";
                project.icon = path_1.default.resolve(homedir, project.icon.slice(2));
            }
            // Search for project icon if its path is relative
            if (!path_1.default.isAbsolute(project.icon)) {
                for (const p of project.paths) {
                    iconPaths.push(path_1.default.resolve(p, project.icon));
                }
            }
            // Absolute path
            if (utils.fileExists(project.icon)) {
                return project.icon;
            }
        }
        // Search every project root dir for icon.png
        for (const p of project.paths) {
            iconPaths.push(path_1.default.join(p, "icon.png"));
        }
        // Find project icon
        for (const p of iconPaths) {
            if (utils.fileExists(p)) {
                return p;
            }
        }
        return "icon.png";
    }
    /**
     * Open arguments
     *
     * @param {Project} project Atom project definition
     * @param {string} app Application name
     * @param {Array.string} args Application arguments
     *
     * @return {string} Open command
     */
    static openArgument(project, app, args) {
        // Build shell command
        let command = [
            "open",
            "-na",
            `"${app}"`,
        ];
        // Append project path(s)
        if (project.paths) {
            command.push('"' + project.paths.join('" "') + '"');
        }
        // Append arguments
        if (args && args.length > 0) {
            command.push("--args");
            command = command.concat(args);
        }
        return command.join(" ");
    }
}
Projects.atomApp = process.env.atomApp || "Atom";
Projects.terminalApp = process.env.terminalApp || "Terminal";
exports.Projects = Projects;
