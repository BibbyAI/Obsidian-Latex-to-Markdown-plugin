# LaTeX to Markdown — Obsidian Plugin

Convert LaTeX documents and snippets into clean, Obsidian-flavored Markdown with a single command.

## ✨ Features

- **Convert in-place** — Select LaTeX text in any note and convert it instantly
- **Import `.tex` files** — Open a file picker, select a `.tex` file, and get a new Markdown note
- **Paste as Markdown** — Copy LaTeX from any source and paste it already converted
- **Preview before applying** — Side-by-side preview modal to review the conversion
- **Configurable** — Heading offsets, math delimiter style, wikilinks, and more

## 🔄 What Gets Converted

| LaTeX | Markdown |
|---|---|
| `\section{Title}` | `## Title` |
| `\textbf{bold}` | `**bold**` |
| `\textit{italic}` | `*italic*` |
| `\texttt{code}` | `` `code` `` |
| `$E = mc^2$` | `$E = mc^2$` |
| `\begin{equation}...\end{equation}` | `$$...$$` |
| `\begin{itemize} \item ...` | `- ...` |
| `\begin{enumerate} \item ...` | `1. ...` |
| `\begin{tabular}...\end{tabular}` | Markdown table |
| `\href{url}{text}` | `[text](url)` |
| `\includegraphics{img}` | `![](img)` |
| `\cite{key}` | `[key]` |
| `\ref{label}` | `[[#label]]` |
| `\begin{verbatim}...\end{verbatim}` | Fenced code block |
| `\begin{minted}{python}...\end{minted}` | ` ```python ... ``` ` |

Plus: accented characters (`\'e` → `é`), footnotes, abstracts, quote environments, special characters (`\&`, `\%`, etc.), and much more.

## 🚀 Installation

### From Community Plugins (recommended)
1. Open **Settings → Community plugins → Browse**
2. Search for **"LaTeX to Markdown"**
3. Click **Install**, then **Enable**

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/NileshArnaiya/obsidian-latex-to-markdown/releases)
2. Create a folder: `<your-vault>/.obsidian/plugins/latex-to-markdown/`
3. Copy the three files into that folder
4. Restart Obsidian and enable the plugin in Settings → Community plugins

## 🛠 Usage

### Commands (Ctrl/Cmd + P)
| Command | Description |
|---|---|
| **Convert LaTeX to Markdown** | Converts the selected text, or the entire note if nothing is selected |
| **Import LaTeX file as Markdown** | Opens a file picker to import a `.tex` file |
| **Paste LaTeX as Markdown** | Reads LaTeX from your clipboard and inserts converted Markdown |
| **Preview LaTeX to Markdown conversion** | Opens a side-by-side preview before applying |

### Ribbon Icon
Click the **file-input** icon in the left sidebar for quick access to the converter.

## ⚙️ Settings

| Setting | Default | Description |
|---|---|---|
| Heading offset | `0` | Shift heading levels (e.g. `1` makes `\section` → `##`) |
| Math delimiter style | `$$` | Choose between `$$ ... $$` or `\[ ... \]` |
| Use Wikilinks | `true` | Convert `\ref{}` to `[[#label]]` vs `[label](#label)` |
| Preserve comments | `false` | Keep LaTeX `%` comments as HTML comments |
| Convert citations | `true` | Convert `\cite{}` to `[key]` notation |

## 🏗 Development

```bash
# Clone this repo into your vault's plugins folder
cd <your-vault>/.obsidian/plugins/
git clone https://github.com/NileshArnaiya/obsidian-latex-to-markdown.git latex-to-markdown
cd latex-to-markdown

# Install dependencies
npm install

# Build (watch mode)
npm run dev

# Production build
npm run build
```

## 📄 License

MIT — see [LICENSE](LICENSE).
