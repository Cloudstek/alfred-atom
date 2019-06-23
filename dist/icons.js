"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const color_1 = __importDefault(require("color"));
const sharp_1 = __importDefault(require("sharp"));
class Icons {
    static all() {
        // Read octicons
        const octicons = fs_extra_1.default.readJsonSync(require.resolve("@primer/octicons/build/data.json"));
        return octicons;
    }
    /**
     * Get list of used icons in projects
     */
    static usedIcons(items) {
        const icons = {};
        // Read octicons
        const octicons = this.all();
        // Output path
        const iconPath = path_1.default.join(__dirname, "icons");
        for (const item of items) {
            if (!item.icon) {
                continue;
            }
            const icon = path_1.default.parse(item.icon.path);
            if (icon.dir === iconPath && octicons[icon.name] !== undefined) {
                icons[icon.name] = octicons[icon.name];
            }
        }
        return icons;
    }
    /**
     * Rebuild icon(s)
     */
    static async rebuild(items, options = {}) {
        // Output path
        const iconPath = path_1.default.join(__dirname, "icons");
        // Icon size
        let iconSize = 64;
        // Icon color
        let iconColor = color_1.default("#FFFFFF");
        // Decide color based on text or background color
        if (options.theme !== null) {
            try {
                iconColor = color_1.default(options.theme.result.text.color);
                iconSize = options.theme.result.iconSize;
            }
            catch (e) {
                // Fail silently
            }
        }
        else if (process.env.alfred_theme_background) {
            const bgColor = color_1.default(process.env.alfred_theme_background);
            iconColor = bgColor.grayscale().negate();
        }
        // Get used icons from projects list
        let icons = Object.entries(Icons.usedIcons(items));
        // Filter icons
        if (options && options.onlyMissing === true) {
            icons = icons.filter((icon) => {
                try {
                    fs_extra_1.default.statSync(path_1.default.join(iconPath, icon + ".png"));
                    return false;
                }
                catch (e) {
                    return true;
                }
            });
        }
        if (icons.length === 0) {
            return;
        }
        // Create icons dir if not exists
        fs_extra_1.default.ensureDir(path_1.default.join(__dirname, "icons"));
        for (const [name, icon] of icons) {
            // console.log(iconSize, iconColor.rgb().toString());
            // Add fill to SVG path
            const svgPath = icon.path.replace(/\/\>$/, ` fill="${iconColor.rgb().toString()}" />`);
            // Build SVG
            const svg = `<svg viewBox="0 0 ${icon.width} ${icon.height}" width="${iconSize}" height="${iconSize}" xmlns="http://www.w3.org/2000/svg">${svgPath}</svg>`;
            sharp_1.default(Buffer.from(svg))
                .png()
                .toFile(path_1.default.join(iconPath, `${name}.png`));
        }
    }
}
exports.Icons = Icons;
