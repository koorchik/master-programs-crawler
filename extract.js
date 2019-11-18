const fs = require('fs').promises;
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

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
    const match = html.match(/StudyContents(.+?)article>/);

    if (!match) {
        console.log('SKIPPED: BROKEN PAGE');
        return [];
    }

    const studyContents = match[1]; 
    const matchedLines = studyContents.match(/<li>.+?<\/li>/g);

    if (matchedLines) {
        const results = [];

        for (const line of matchedLines) {
            const lineMatch = line.match(/<li>(.+?)<\/li>/);

            if (lineMatch) {
                const cleanLine = entities.decode(lineMatch[1])
                    .replace(/<.+?>/g, '')
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