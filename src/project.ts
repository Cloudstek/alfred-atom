import cson from "cson-parser";
import {capitalCase} from "change-case";
import path from "path";
import glob from "glob";
import {Item} from "alfred-hugo";

import {Octicon, Project} from "./types";
import * as utils from "./utils";
import {Icons} from "./icons";

export class Projects {
    /**
     * Parse project
     */
    public static parse(project: Project, octicons?: { [key: string]: Octicon }): Item | null {
        if (project.paths.length === 0) {
            console.warn("Skipping project missing paths, possibly a template.");

            return null;
        }

        if (!octicons) {
            octicons = Icons.all();
        }

        return {
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
    }

    /**
     * Parse a list of projects
     */
    public static parseAll(projects: Project[]): Item[] {
        const results: Item[] = [];

        const octicons = Icons.all();

        for (const project of projects) {
            const p = this.parse(project, octicons);

            if (p) {
                results.push(p);
            }
        }

        return results;
    }

    /**
     * Parse all projects from a CSON file.
     */
    public static parseCson(file: string): Item[] {
        // Read projects file
        const projects: Project[] = cson.parse(file) || [];

        return this.parseAll(projects);
    }

    /**
     * Find git repositories and turn it into a list of results
     */
    public static findGitRepositories(projectHome: string, prettifyTitle: boolean = true): Item[] {
        const projects: Project[] = [];

        const dirs: string[] = glob.sync("*/.git", {
            cwd: projectHome,
        });

        dirs.forEach((dir) => {
            dir = dir.substring(0, dir.indexOf("/.git"));

            const project: Project = {
                title: prettifyTitle ? capitalCase(dir) : dir,
                group: "Git repository",
                paths: [
                    path.resolve(projectHome, dir),
                ],
            };

            projects.push(project);
        });

        return this.parseAll(projects);
    }

    private static atomApp: string =  process.env.atomApp || "Atom";
    private static terminalApp: string = process.env.terminalApp || "Terminal";

    /**
     * Project title
     */
    private static title(project: Project): string {
        let title: string = project.title;

        if (project.group) {
            title += " - " + project.group;
        }

        return title;
    }

    /**
     * Project sub-title
     */
    private static subTitle(project: Project): string {
        return project.paths.join(", ");
    }

    /**
     * Project icon
     */
    private static icon(project: Project, octicons: { [key: string]: Octicon }): string {
        const iconPaths: string[] = [];

        if (!octicons) {
            octicons = Icons.all();
        }

        if (project.icon) {
            // Octicon
            if (project.icon.startsWith("icon-")) {
                const octiconNames = Object.keys(octicons);
                if (octiconNames.indexOf(project.icon.slice(5)) >= 0) {
                    return path.join(__dirname, "icons", project.icon.slice(5) + ".png");
                }
            }

            // Replace tilde
            if (project.icon.startsWith("~/")) {
                const homedir = process.env.HOME || "";
                project.icon = path.resolve(homedir, project.icon.slice(2));
            }

            // Search for project icon if its path is relative
            if (!path.isAbsolute(project.icon)) {
                for (const p of project.paths) {
                    iconPaths.push(path.resolve(p, project.icon));
                }
            }

            // Absolute path
            if (utils.fileExists(project.icon)) {
                return project.icon;
            }
        }

        // Search every project root dir for icon.png
        for (const p of project.paths) {
            iconPaths.push(path.join(p, "icon.png"));
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
    private static openArgument(project: Project, app: string, args?: string[]): string {
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
