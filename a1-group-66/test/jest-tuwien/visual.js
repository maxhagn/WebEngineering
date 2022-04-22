const { setupJestScreenshot } = require('jest-screenshot');
setupJestScreenshot();

function testVisual(device, fullPage = true, points = 1.5) {
    if (typeof device == 'string') {
        device = module.exports.devices[device];
    }
    const sizeDesc = fullPage ? `${device.viewport.width}px width` : `${device.viewport.width} x ${device.viewport.height}`
    const desc = `looks right on ${device.name} (${sizeDesc}) // visual // ${points}`;
    test(desc, async () => {
        jest.setTimeout(10000);
        await page.setViewport(device.viewport);
        await page.reload();
        await page._client.send('Animation.setPlaybackRate', { playbackRate: 10.0 });
        const image = await page.screenshot({fullPage: fullPage});
        expect(image).toMatchImageSnapshot();
    });
}

const devices = [
    {
        'name': 'small desktop',
        'viewport': {
            'width': 800,
            'height': 600,
            'deviceScaleFactor': 1,
            'isMobile': false,
            'hasTouch': false,
            'isLandscape': false
        }
    },

    {
        'name': 'medium desktop',
        'viewport': {
            'width': 1024,
            'height': 768,
            'deviceScaleFactor': 2,
            'isMobile': false,
            'hasTouch': false,
            'isLandscape': false
        }
    },

    {
        'name': 'large desktop',
        'viewport': {
            'width': 1920,
            'height': 1080,
            'deviceScaleFactor': 2,
            'isMobile': false,
            'hasTouch': false,
            'isLandscape': false
        }
    },

    {
        'name': 'mobile',
        'viewport': {
            'width': 414,
            'height': 736,
            'deviceScaleFactor': 3,
            'isMobile': true,
            'hasTouch': true,
            'isLandscape': false
        }
    }
]

module.exports = { testVisual, devices: {} }
for (const device of devices)
    module.exports.devices[device.name] = device;
