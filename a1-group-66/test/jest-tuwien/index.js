const {testVisual} = require('./visual.js');
const {validateHtml} = require('./validate.js');

const path = require('path');

function setupHtmlTests(file) {
    beforeEach(async () => {
        await jestPuppeteer.resetPage();
        await page.goto(`file:${path.resolve(file)}`);
    })
}

module.exports = { testVisual, validateHtml, setupHtmlTests }
