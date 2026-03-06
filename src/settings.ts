export interface PluginSettings {
    headingOffset: number;
    mathDelimiterStyle: 'dollar' | 'brackets';
    useWikilinks: boolean;
    preserveComments: boolean;
    convertCitations: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
    headingOffset: 0,
    mathDelimiterStyle: 'dollar',
    useWikilinks: true,
    preserveComments: false,
    convertCitations: true,
};
