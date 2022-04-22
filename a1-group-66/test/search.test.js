const tu = require('./jest-tuwien');

describe('Search', () => {
    tu.setupHtmlTests('../www/search.html');
    tu.testVisual('small desktop');
    tu.testVisual('large desktop');
    tu.testVisual('mobile', fullPage = false);
    tu.validateHtml();
    test('does not use JavaScript', async () => {        
        await expect(page).not.toMatchElement('script');
    });
});
