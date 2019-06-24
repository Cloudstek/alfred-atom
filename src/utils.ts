import path from "path";
import fs from "fs-extra";

import { Hugo, Item } from "alfred-hugo";
import { Icons } from "./icons";

export function checkEnvironmentChanges(hugo: Hugo): void {
    let clearCache = false;

    // Terminal app
    if (process.env.terminalApp && hugo.config.get("terminalApp") !== process.env.terminalApp) {
        clearCache = true;
        hugo.config.set("terminalApp", process.env.terminalApp);
    }

    // Workflow version
    if (hugo.workflowMeta.version && hugo.config.get("wfVersion") !== hugo.workflowMeta.version) {
        clearCache = true;
        hugo.config.set("wfVersion", hugo.workflowMeta.version);
    }

    if (clearCache === true) {
        hugo.clearCacheSync();
    }
}

export function checkIcons(hugo: Hugo, items: Item[]): Promise<void> {
    const themePath = hugo.alfredMeta.themeFile;
    const lastTheme = hugo.config.get("lastTheme");

    try {
        fs.statSync(path.join(__dirname, "icons"));
    } catch (e) {
        hugo.config.set("lastTheme", hugo.alfredMeta.theme);
        Icons.rebuild(items, { theme: hugo.alfredTheme });
        return;
    }

    if (!lastTheme || lastTheme !== hugo.alfredMeta.theme) {
        hugo.config.set("lastTheme", hugo.alfredMeta.theme);
        Icons.rebuild(items, { theme: hugo.alfredTheme });
        return;
    }

    if (themePath) {
        const themeFile = hugo.cacheFile(themePath);

        themeFile.on("change", () => {
            Icons.rebuild(items, { theme: hugo.alfredTheme });
        });

        themeFile.get();
    }

    Icons.rebuild(items, { onlyMissing: true, theme: hugo.alfredTheme });
}

export function fileExists(p: string): boolean {
    try {
        fs.statSync(p);
        return true;
    } catch (err) {
        return false;
    }
}
