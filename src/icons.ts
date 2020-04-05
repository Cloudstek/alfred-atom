import fs from "fs-extra";
import path from "path";
import color from "color";
import sharp from "sharp";
import {Item} from "alfred-hugo";

import {IconsRebuildOptions, Octicon} from "./types";

export class Icons {
    public static all() {
        // Read octicons
        const octicons: { [key: string]: Octicon } = fs.readJsonSync(require.resolve("@primer/octicons/build/data.json"));

        return octicons;
    }

    /**
     * Get list of used icons in projects
     */
    public static usedIcons(items: Item[]) {
        const icons: { [key: string]: Octicon } = {};

        // Read octicons
        const octicons = this.all();

        // Output path
        const iconPath = path.join(__dirname, "icons");

        for (const item of items) {
            if (!item.icon) {
                continue;
            }

            const icon = path.parse(item.icon.path);

            if (icon.dir === iconPath && octicons[icon.name] !== undefined) {
                icons[icon.name] = octicons[icon.name];
            }
        }

        return icons;
    }

    /**
     * Rebuild icon(s)
     */
    public static async rebuild(items: Item[], options: IconsRebuildOptions = {}) {
        // Output path
        const iconPath = path.join(__dirname, "icons");

        // Icon size
        let iconSize = 64;

        // Icon color
        let iconColor = color("#FFFFFF");

        // Decide color based on text or background color
        if (options.theme !== null) {
            try {
                iconColor = color(options.theme.result.text.color);
                iconSize = options.theme.result.iconSize;
            } catch (e) {
                // Fail silently
            }
        } else if (process.env.alfred_theme_background) {
            const bgColor = color(process.env.alfred_theme_background);
            iconColor = bgColor.grayscale().negate();
        }

        // Get used icons from projects list
        let icons = Object.entries(Icons.usedIcons(items));

        // Filter icons
        if (options && options.onlyMissing === true) {
            icons = icons.filter((icon) => {
                try {
                    fs.statSync(path.join(iconPath, icon + ".png"));
                    return false;
                } catch (e) {
                    return true;
                }
            });
        }

        if (icons.length === 0) {
            return;
        }

        // Create icons dir if not exists
        await fs.ensureDir(path.join(__dirname, "icons"));

        let sharpTasks: Promise<sharp.OutputInfo>[];

        for (const [name, icon] of icons) {
            // Add fill to SVG path
            const svgPath = icon.path.replace(/\/>$/, ` fill="${iconColor.rgb().toString()}" />`);

            // Build SVG
            const svg = `<svg viewBox="0 0 ${icon.width} ${icon.height}" width="${iconSize}" height="${iconSize}" xmlns="http://www.w3.org/2000/svg">${svgPath}</svg>`;

            sharpTasks.push(
                sharp(Buffer.from(svg))
                    .png()
                    .toFile(path.join(iconPath, `${name}.png`))
            );
        }

        await Promise.all(sharpTasks);
    }
}
