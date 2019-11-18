const fetch = require('node-fetch');
const fs = require('fs').promises;

async function main() {
    const items = await fetchItemsList(0, 728);
    fs.writeFile('data/items.json', JSON.stringify(items));
    
    for (const item of items) {
        const masterProgramPageHTML = await fetchMasterProgramPage(item.id);
        const file = `data/pages/${item.id}.html`;
        
        await fs.writeFile(file, masterProgramPageHTML);
    }
}

async function fetchMasterProgramPage(id) {
    const url = `https://www.mastersportal.com/studies/${id}`;
    
    console.log(`FETCHING ${url}`);
    const response = await fetch(url);

    return response.text();
}

async function fetchItemsList(start, end) {
    const itemsPerPage = 10; 
    const items = [];

    for (let pageStart = start; pageStart <= end; pageStart += itemsPerPage) {
        const pageItems = await fetchItemsListPage(pageStart);
        items.push(...pageItems);
    }

    return items;
}

async function fetchItemsListPage(start) {
    const url = `https://search.prtl.co/2018-07-23/?start=${start}&q=di-282%7Cen-4037%7Clv-master%7Ctc-EUR%7Cuc-29`;
    
    console.log(`FETCHING ${url}`);
    const response = await fetch(url);
 
    return response.json();
}

main().then(console.log, console.error);