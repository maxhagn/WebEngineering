const tu = require('./jest-tuwien');

describe('Frame Configurator', () => {
    tu.setupHtmlTests('../www/config.html'); 
    tu.testVisual('small desktop');
    tu.testVisual('large desktop');
    tu.testVisual('mobile');
    tu.validateHtml();
    test('does not use JavaScript', async () => {        
        await expect(page).not.toMatchElement('script');
    });    
});
