import { Plugin, PluginSettingTab, App, Setting, Notice, Editor, MarkdownView, TFile, Modal } from 'obsidian';
import { convertLatexToMarkdown } from './src/converter';
import { PluginSettings, DEFAULT_SETTINGS } from './src/settings';

export default class LatexToMarkdownPlugin extends Plugin {
    settings: PluginSettings;

    async onload() {
        await this.loadSettings();

        // ── Ribbon icon ─────────────────────────────────────────────────
        this.addRibbonIcon('file-input', 'convert latex to markdown', () => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (view) {
                this.convertActiveNote(view.editor);
            } else {
                new Notice('open a note first to convert latex.');
            }
        });

        // ── Command: Convert selection or entire note ────────────────────
        this.addCommand({
            id: 'convert',
            name: 'convert current note or selection',
            editorCallback: (editor: Editor) => {
                this.convertActiveNote(editor);
            },
        });

        // ── Command: Import .tex file ────────────────────────────────────
        this.addCommand({
            id: 'import',
            name: 'import file',
            callback: () => {
                this.importLatexFile();
            },
        });

        // ── Command: Paste clipboard as Markdown ─────────────────────────
        this.addCommand({
            id: 'paste',
            name: 'paste as markdown',
            editorCallback: (editor: Editor) => {
                this.pasteLatexAsMarkdown(editor).catch(console.error);
            },
        });

        // ── Command: Preview conversion ──────────────────────────────────
        this.addCommand({
            id: 'preview',
            name: 'preview conversion',
            editorCallback: (editor: Editor) => {
                this.previewConversion(editor);
            },
        });

        // ── Settings tab ─────────────────────────────────────────────────
        this.addSettingTab(new LatexToMarkdownSettingTab(this.app, this));
    }

    onunload() {
        // cleanup if needed
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // ════════════════════════════════════════════════════════════════════
    // Core actions
    // ════════════════════════════════════════════════════════════════════

    private convertActiveNote(editor: Editor) {
        const selection = editor.getSelection();

        if (selection && selection.trim().length > 0) {
            // Convert selected text
            const converted = convertLatexToMarkdown(selection, this.settings);
            editor.replaceSelection(converted);
            new Notice('✅ selection converted from latex to markdown.');
        } else {
            // Convert entire note
            const content = editor.getValue();
            const converted = convertLatexToMarkdown(content, this.settings);
            editor.setValue(converted);
            new Notice('✅ entire note converted from latex to markdown.');
        }
    }

    private importLatexFile(): void {
        // Create an invisible file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.tex,.latex,.ltx';
        input.setCssProps({ display: 'none' });
        document.body.appendChild(input);

        input.addEventListener('change', () => {
            const processFile = async () => {
                const file = input.files?.[0];
                if (!file) {
                    return;
                }

                const text = await file.text();
                const converted = convertLatexToMarkdown(text, this.settings);

                // Create new note with the converted content
                const baseName = file.name.replace(/\.(tex|latex|ltx)$/, '');
                let fileName = `${baseName}.md`;
                let counter = 1;

                // Ensure unique filename
                while (this.app.vault.getAbstractFileByPath(fileName)) {
                    fileName = `${baseName} (${counter}).md`;
                    counter++;
                }

                const newFile = await this.app.vault.create(fileName, converted);
                const leaf = this.app.workspace.getLeaf(false);
                if (newFile instanceof TFile) {
                    await leaf.openFile(newFile);
                }

                new Notice(`✅ imported "${file.name}" as "${fileName}".`);
            };

            processFile()
                .catch(err => {
                    new Notice(`❌ error importing file: ${err}`);
                    console.error('latex import error:', err);
                })
                .finally(() => {
                    document.body.removeChild(input);
                });
        });

        input.click();
    }

    private async pasteLatexAsMarkdown(editor: Editor) {
        try {
            const clipboardText = await navigator.clipboard.readText();

            if (!clipboardText || clipboardText.trim().length === 0) {
                new Notice('📋 clipboard is empty.');
                return;
            }

            const converted = convertLatexToMarkdown(clipboardText, this.settings);
            editor.replaceSelection(converted);
            new Notice('✅ pasted and converted latex from clipboard.');
        } catch (err) {
            new Notice('❌ could not read clipboard. check permissions.');
            console.error('clipboard error:', err);
        }
    }

    private previewConversion(editor: Editor) {
        const selection = editor.getSelection();
        const source = (selection && selection.trim().length > 0) ? selection : editor.getValue();
        const converted = convertLatexToMarkdown(source, this.settings);
        new ConversionPreviewModal(this.app, source, converted, (result: string) => {
            if (selection && selection.trim().length > 0) {
                editor.replaceSelection(result);
            } else {
                editor.setValue(result);
            }
        }).open();
    }
}

// ════════════════════════════════════════════════════════════════════════
// Preview Modal
// ════════════════════════════════════════════════════════════════════════

class ConversionPreviewModal extends Modal {
    private source: string;
    private converted: string;
    private onAccept: (result: string) => void;

    constructor(app: App, source: string, converted: string, onAccept: (result: string) => void) {
        super(app);
        this.source = source;
        this.converted = converted;
        this.onAccept = onAccept;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('latex-to-md-preview-modal');

        contentEl.createEl('h2', { text: 'latex to markdown preview' });

        // Side-by-side panels
        const container = contentEl.createDiv({ cls: 'latex-to-md-preview-container' });

        const leftPanel = container.createDiv({ cls: 'latex-to-md-preview-panel' });
        leftPanel.createEl('h3', { text: 'latex source' });
        const sourceEl = leftPanel.createEl('pre', { cls: 'latex-to-md-preview-code' });
        sourceEl.createEl('code', { text: this.source });

        const rightPanel = container.createDiv({ cls: 'latex-to-md-preview-panel' });
        rightPanel.createEl('h3', { text: 'markdown output' });
        const outputEl = rightPanel.createEl('pre', { cls: 'latex-to-md-preview-code' });
        outputEl.createEl('code', { text: this.converted });

        // Buttons
        const buttonContainer = contentEl.createDiv({ cls: 'latex-to-md-preview-buttons' });
        const acceptBtn = buttonContainer.createEl('button', { text: 'apply conversion', cls: 'mod-cta' });
        acceptBtn.addEventListener('click', () => {
            this.onAccept(this.converted);
            new Notice('✅ conversion applied.');
            this.close();
        });
        const cancelBtn = buttonContainer.createEl('button', { text: 'cancel' });
        cancelBtn.addEventListener('click', () => {
            this.close();
        });
    }

    onClose() {
        this.contentEl.empty();
    }
}

// ════════════════════════════════════════════════════════════════════════
// Settings Tab
// ════════════════════════════════════════════════════════════════════════

class LatexToMarkdownSettingTab extends PluginSettingTab {
    plugin: LatexToMarkdownPlugin;

    constructor(app: App, plugin: LatexToMarkdownPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl).setHeading().setName('latex to markdown settings');

        new Setting(containerEl)
            .setName('heading offset')
            .setDesc('add this value to heading levels (e.g. 1 makes \\section become ## instead of #).')
            .addSlider(slider => slider
                .setLimits(0, 4, 1)
                .setValue(this.plugin.settings.headingOffset)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.headingOffset = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('math delimiter style')
            .setDesc('choose the delimiter style for math blocks in the output.')
            .addDropdown(dropdown => dropdown
                .addOption('dollar', '$$ (dollar signs)')
                .addOption('brackets', '\\[ \\] (brackets)')
                .setValue(this.plugin.settings.mathDelimiterStyle)
                .onChange(async (value) => {
                    this.plugin.settings.mathDelimiterStyle = value as 'dollar' | 'brackets';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('use wikilinks for references')
            .setDesc('convert \\ref{} to [[#label]] (wikilink) instead of [label](#label).')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.useWikilinks)
                .onChange(async (value) => {
                    this.plugin.settings.useWikilinks = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('preserve latex comments')
            .setDesc('convert % comments to html comments instead of removing them.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.preserveComments)
                .onChange(async (value) => {
                    this.plugin.settings.preserveComments = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('convert citations')
            .setDesc('convert \\cite{} to [key] notation. disable if you prefer raw citation keys.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.convertCitations)
                .onChange(async (value) => {
                    this.plugin.settings.convertCitations = value;
                    await this.plugin.saveSettings();
                }));
    }
}
