export interface Octicon {
    name: string;
    width: number;
    height: number;
    path: string;
}

export interface Project {
    title: string;
    subtitle?: string;
    group?: string;
    icon?: string;
    paths: string[];
}

export interface IconsRebuildOptions {
    onlyMissing?: boolean;
    theme?: any;
}
