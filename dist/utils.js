"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const icons_1 = require("./icons");
function checkEnvironmentChanges(hugo) {
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
exports.checkEnvironmentChanges = checkEnvironmentChanges;
function checkIcons(hugo, items) {
    const themePath = hugo.alfredMeta.themeFile;
    const lastTheme = hugo.config.get("lastTheme");
    try {
        fs_extra_1.default.statSync(path_1.default.join(__dirname, "icons"));
    }
    catch (e) {
        hugo.config.set("lastTheme", hugo.alfredMeta.theme);
        icons_1.Icons.rebuild(items, { theme: hugo.alfredTheme });
        return;
    }
    if (!lastTheme || lastTheme !== hugo.alfredMeta.theme) {
        hugo.config.set("lastTheme", hugo.alfredMeta.theme);
        icons_1.Icons.rebuild(items, { theme: hugo.alfredTheme });
        return;
    }
    if (themePath) {
        const themeFile = hugo.cacheFile(themePath);
        themeFile.on("change", () => {
            icons_1.Icons.rebuild(items, { theme: hugo.alfredTheme });
        });
        themeFile.get();
    }
    icons_1.Icons.rebuild(items, { onlyMissing: true, theme: hugo.alfredTheme });
}
exports.checkIcons = checkIcons;
function fileExists(p) {
    try {
        fs_extra_1.default.statSync(p);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.fileExists = fileExists;
