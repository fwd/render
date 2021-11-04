const puppeteer = require('puppeteer')
const { Cluster } = require('puppeteer-cluster')

const { makeScreenshot } = require('./screenshot.js')

module.exports = async function(options) {
  
  const {
    html,
    content,
    output,
    puppeteerArgs = {},
  } = options

  if (!html) {
    throw Error('You must provide an html property.')
  }
  
  var _options = {
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: options.maxConcurrency || 4,
    puppeteerOptions: { ...puppeteerArgs, headless: true },
  }
      
  if (options.raspberry) options.puppeteerOptions.executablePath = '/usr/bin/chromium-browser',

  const cluster = await Cluster.launch(_options);

  let buffers = []

  await cluster.task(async ({ page, data: { content, output } }) => {

    const buffer = await makeScreenshot(page, { ...options, content, output })

    buffers.push(buffer);

  });

  const shouldBatch = Array.isArray(content)

  const contents = shouldBatch ? content : [{ ...content, output }]

  contents.forEach(content => {
    const { output, ...pageContent } = content
    cluster.queue({ output, content: pageContent })
  })

  await cluster.idle();
  await cluster.close();

  return shouldBatch ? buffers : buffers[0]

}

