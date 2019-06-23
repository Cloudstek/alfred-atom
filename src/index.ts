import cson from "cson-parser";
import untildify from "untildify";
import { Hugo, Item } from "alfred-hugo";

import { Icons } from "./icons";
import * as utils from "./utils";
import { Projects } from "./project";

const hugo = new Hugo();

hugo.action("projects", () => {
    // Projects file
    const projectsFile = hugo.cacheFile(untildify("~/.atom/projects.cson"));
    const configFile = hugo.cacheFile(untildify("~/.atom/config.cson"));

    // Check environment for changes
    utils.checkEnvironmentChanges(hugo);

    // Parse projects
    projectsFile.on("change", (cache, file) => {
        // Parse projects
        const p = Projects.parseCson(file);

        // Rebuild icons when needed
        Icons.rebuild(p, { onlyMissing: true, theme: hugo.alfredTheme });

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
        let _config: { [key: string]: any } = cson.parse(file) || {};

        _config = _config["*"] || {};

        cache.set("config", _config);
    });

    // Add projects to Hugo
    let projects = projectsFile.get().projects || [];

    // Get config
    const config = configFile.get().config || {};

    // Fetch all git projects
    if (config["project-manager"] && config["project-manager"].includeGitRepositories === true) {
        const projectHome = config.core.projectHome || untildify("~/github");
        const prettifyTitle = config["project-manager"].prettifyTitle === undefined ? true : config["project-manager"].prettifyTitle;

        // Find git repositories
        let gitProjects = Projects.findGitRepositories(projectHome, prettifyTitle) || [];

        // Don't include existing projects
        if (projects.length > 0) {
            gitProjects = gitProjects.filter((gitProject: Item) => {
                let existingPaths: string[] = [];

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
