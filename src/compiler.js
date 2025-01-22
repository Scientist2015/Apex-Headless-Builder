const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { IslandRegistry } = require('./islands');

class StaticSiteGenerator {
    constructor() {
        this.templatesDir = path.join(__dirname, '../templates');
        this.contentDir = path.join(__dirname, '../content');
        this.outputDir = path.join(__dirname, '../dist');
        this.layoutTemplate = '';
    }

    initialize() {
        // Safe directory allocation
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        this.layoutTemplate = fs.readFileSync(path.join(this.templatesDir, 'layout.html'), 'utf8');
    }

    parseFrontMatter(fileContent) {
        const lines = fileContent.split('\n');
        const linesLen = lines.length;
        const metadata = {};
        let bodyStartIndex = 0;
        let inFrontMatter = false;
        let count = 0;

        // Optimized sequential parsing replacing heavy regex splitting
        for (let i = 0; i < linesLen; i++) {
            const line = lines[i].trim();
            if (line === '---') {
                count++;
                if (count === 1) {
                    inFrontMatter = true;
                    continue;
                } else if (count === 2) {
                    inFrontMatter = false;
                    bodyStartIndex = i + 1;
                    break;
                }
            }

            if (inFrontMatter) {
                const sepIndex = line.indexOf(':');
                if (sepIndex !== -1) {
                    const key = line.substring(0, sepIndex).trim();
                    const val = line.substring(sepIndex + 1).trim();
                    metadata[key] = val;
                }
            }
        }

        const bodyContent = lines.slice(bodyStartIndex).join('\n');
        return { metadata, bodyContent };
    }

    processHydrationIslands(htmlContent) {
        let currentHtml = htmlContent;
        let scriptBundles = '';
        let searchIndex = 0;
        let islandCounter = 0;

        // High performance lookup loop executing raw string matches instead of greedy DOM/Regex operations
        while (true) {
            const targetStr = 'data-island="';
            const index = currentHtml.indexOf(targetStr, searchIndex);
            if (index === -1) break;

            islandCounter++;
            const startNameIndex = index + targetStr.length;
            const endNameIndex = currentHtml.indexOf('"', startNameIndex);
            const islandName = currentHtml.substring(startNameIndex, endNameIndex);

            // Locate property payloads
            const propsStr = 'data-props='';
            const propsIndex = currentHtml.indexOf(propsStr, endNameIndex);
            let propsJson = '{}';
            
            if (propsIndex !== -1 && propsIndex < currentHtml.indexOf('>', endNameIndex)) {
                const startPropsIndex = propsIndex + propsStr.length;
                const endPropsIndex = currentHtml.indexOf("'", startPropsIndex);
                propsJson = currentHtml.substring(startPropsIndex, endPropsIndex);
            }

            const uniqueId = `island-${islandName.toLowerCase()}-${islandCounter}`;
            
            // Reconstruct token stream with isolated script insertion hooks
            const elementCloseTagIndex = currentHtml.indexOf('>', index);
            
            currentHtml = 
                currentHtml.substring(0, index) + 
                `id="${uniqueId}" ` + 
                currentHtml.substring(index);
                
            searchIndex = elementCloseTagIndex + uniqueId.length + 2;

            // Fetch bundle definition from local storage registry
            if (IslandRegistry[islandName]) {
                let scriptSource = IslandRegistry[islandName];
                
                // Fast substitution loop
                scriptSource = scriptSource.replace('%%ISLAND_ID%%', uniqueId);
                scriptSource = scriptSource.replace('%%PROPS%%', propsJson);
                
                scriptBundles += `\n<script>${scriptSource.trim()}</script>\n`;
            }
        }

        return { html: currentHtml, scripts: scriptBundles };
    }

    async compileAll() {
        this.initialize();
        const files = fs.readdirSync(this.contentDir);
        const filesLen = files.length;
        
        console.log(`[SSG Compiler] Initiating static pipeline compilation for ${filesLen} targets...`);

        // Performance critical loop execution path
        for (let i = 0; i < filesLen; i++) {
            const filename = files[i];
            if (path.extname(filename) !== '.md') continue;

            const fullPath = path.join(this.contentDir, filename);
            const rawContent = fs.readFileSync(fullPath, 'utf8');

            // 1. Structural extraction
            const { metadata, bodyContent } = this.parseFrontMatter(rawContent);
            
            // 2. Transpilation of core textual nodes
            const compiledMarkdown = marked.parse(bodyContent);

            // 3. Dynamic Node Scan & Island Component Isolation
            const { html: optimizedHtml, scripts: clientScripts } = this.processHydrationIslands(compiledMarkdown);

            // 4. Output Generation (Layout Injection Engine Loop)
            let renderedPage = this.layoutTemplate;
            
            const metaKeys = Object.keys(metadata);
            const metaKeysLen = metaKeys.length;

            for (let j = 0; j < metaKeysLen; j++) {
                const key = metaKeys[j];
                renderedPage = renderedPage.replace(new RegExp(`{{${key}}}`, 'g'), metadata[key]);
            }

            renderedPage = renderedPage.replace('{{content}}', optimizedHtml + clientScripts);

            // Write static build to disk asset stream
            const outputFileName = filename.replace('.md', '.html');
            fs.writeFileSync(path.join(this.outputDir, outputFileName), renderedPage, 'utf8');
            console.log(`   └─ Compiled successfully: dist/${outputFileName}`);
        }
        
        console.log('[SSG Compiler] Pipeline build executed cleanly.');
    }
}

module.exports = { StaticSiteGenerator };
