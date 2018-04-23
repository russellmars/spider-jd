const puppeteer = require('puppeteer')
let browser = null
const getBrowserInstance = async function () {
  if (browser) {
    return browser
  }
  browser = await puppeteer.launch()
  return browser
}

getBrowserInstance()

module.exports = getBrowserInstance
