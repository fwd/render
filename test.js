const render = require('./src/index');

;(async () => {

  await render({
    output: './test/image.png',
    html: '<html><body>Hello world!</body></html>'
  })

  await render('test.png', {
  	template: ''
  })

})()