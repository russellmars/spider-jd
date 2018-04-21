const Router = require('koa-router')
const puppeteer = require('puppeteer')
const config = require('../config')

const router = new Router({
  prefix: '/api/v1'
})

router.get('/', async (ctx, next) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(config.url)

  // await page.waitFor(2 * 1000)

  const ITEM_SELECTOR = '#J_goodsList li.gl-item'

  const ITEM_IMG_SELECTOR = '.p-img > a > img'

  const ITEM_LINK_SELECTOR = '.p-img > a'

  const ITEM_NAME_SELECTOR = '.p-name > a'

  const ITEM_PRICE_SELECTOR = '.p-price > strong > i'

  const products = await page.evaluate(
    (sItem, sImg, sLink, sName, sPrice) => {
      return [].map.call(document.querySelectorAll(sItem), $item => {
        const imgUrl =
          $item.querySelector(sImg).src ||
          $item.querySelector(sImg).dataset.lazyImg
        const link = $item.querySelector(sLink).href
        const name = $item.querySelector(sName).title
        const price = $item.querySelector(sPrice).innerText
        const sku = $item.dataset.sku
        return {
          sku,
          imgUrl,
          link,
          price,
          name
        }
      })
    },
    ITEM_SELECTOR,
    ITEM_IMG_SELECTOR,
    ITEM_LINK_SELECTOR,
    ITEM_NAME_SELECTOR,
    ITEM_PRICE_SELECTOR
  )

  ctx.body = { products }
})

module.exports = router
