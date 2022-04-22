const tu = require('./jest-tuwien');

describe('Shopping Cart', () => {
    tu.setupHtmlTests('../www/cart.html');
    tu.testVisual('small desktop');
    tu.testVisual('large desktop');
    tu.testVisual('mobile');
    tu.validateHtml();
    test('does not use JavaScript', async () => {        
        await expect(page).not.toMatchElement('script');
    });    
});
