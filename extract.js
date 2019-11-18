const fs = require('fs').promises;
const { JSDOM } = require('jsdom');
const unescape = require('unescape');

async function main() {
    const items = await readItemsList();
    const results = [];
    let skippedCount = 0;
    let count = 0;

    for (const item of items) {
        count++;
        console.log(`PARSE ${count} - ${item.id}`);
        const html = await readMasterProgramHTML(item.id);
        const programStructure = extractProgramStructure(html);
        
        if (programStructure.length === 0) {
            skippedCount++;
            console.log(`SKIPPED ${skippedCount}`);
            continue;
        }

        results.push({
            id: item.id,
            title: item.title,
            level: item.level,
            degree: item.degree,
            tuition_fee: item.tuition_fee,
            organisation: item.organisation,
            programStructure
        });
    }

    console.log(`SKIPPED ${skippedCount}`);
    await fs.writeFile('results/item.json', JSON.stringify(results, null, 2));
}

async function readItemsList() {
    const content = await fs.readFile('data/items.json');
    return JSON.parse(content);
}

async function readMasterProgramHTML(id) {
    const content = await fs.readFile(`data/pages/${id}.html`);
    return content.toString();
}

function extractProgramStructure(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const studyContents = document.querySelector('article#StudyContents');
    
    if (!studyContents) {
        console.log('SKIPPED: BROKEN PAGE');
        return [];
    }

    const matchedLines = studyContents.innerHTML.match(/<li>.+?<\/li>/g);

    if (matchedLines) {
        const results = [];

        for (const line of matchedLines) {
            const lineMatch = line.match(/<li>(.+?)<\/li>/);

            if (lineMatch) {
                const cleanLine = unescape(lineMatch[1])
                    .replace('&nbsp;', ' ')
                    .trim();
                    
                results.push( cleanLine );
            }
        }
        return results;
    } else {
        return [];
    }
}

main().then(console.log, console.error);