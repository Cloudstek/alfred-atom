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
const untildify_1 = __importDefault(require("untildify"));
const alfred_hugo_1 = require("alfred-hugo");
const icons_1 = require("./icons");
const utils = __importStar(require("./utils"));
const project_1 = require("./project");
const hugo = new alfred_hugo_1.Hugo();
hugo.action("projects", () => {
    // Projects file
    const projectsFile = hugo.cacheFile(untildify_1.default("~/.atom/projects.cson"));
    const configFile = hugo.cacheFile(untildify_1.default("~/.atom/config.cson"));
    // Check environment for changes
    utils.checkEnvironmentChanges(hugo);
    // Parse projects
    projectsFile.on("change", (cache, file) => {
        // Parse projects
        const p = project_1.Projects.parseCson(file);
        // Rebuild icons when needed
        icons_1.Icons.rebuild(p, { onlyMissing: true, theme: hugo.alfredTheme });
        // Sort projects
        p.sort((a, b) => {
            const nameA = a.title.toLowerCase();
            const nameB = b.title.toLowerCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        cache.set("projects", p);
    });
    // Parse config
    configFile.on("change", (cache, file) => {
        // Read config file
        let _config = cson_parser_1.default.parse(file) || {};
        _config = _config["*"] || {};
        cache.set("config", _config);
    });
    // Add projects to Hugo
    let projects = projectsFile.get().projects || [];
    // Get config
    const config = configFile.get().config || {};
    // Fetch all git projects
    if (config["project-manager"] && config["project-manager"].includeGitRepositories === true) {
        const projectHome = config.core.projectHome || untildify_1.default("~/github");
        const prettifyTitle = config["project-manager"].prettifyTitle === undefined ? true : config["project-manager"].prettifyTitle;
        // Find git repositories
        let gitProjects = project_1.Projects.findGitRepositories(projectHome, prettifyTitle) || [];
        // Don't include existing projects
        if (projects.length > 0) {
            gitProjects = gitProjects.filter((gitProject) => {
                let existingPaths = [];
                for (const p of projects) {
                    const paths = p.subtitle.split(", ") || [];
                    existingPaths = existingPaths.concat(paths);
                }
                return !existingPaths.includes(gitProject.subtitle);
            });
        }
        projects = projects.concat(gitProjects);
    }
    // Add items
    hugo.items = hugo.items.concat(projects);
    // Check icons
    utils.checkIcons(hugo, projects);
    // Check if any projects found
    if (hugo.items.length === 0) {
        hugo.items.push({
            title: "No projects found.",
        });
    }
    // Output
    hugo.feedback();
});
hugo.run();
