const tu = require('./jest-tuwien');

describe('Checkout', () => {
    tu.setupHtmlTests('../www/checkout.html');
    tu.testVisual('small desktop');
    tu.testVisual('large desktop');
    tu.testVisual('mobile');
    tu.validateHtml();
    test('does not use JavaScript', async () => {        
        await expect(page).not.toMatchElement('script');
    });    
});
