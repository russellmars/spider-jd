const Router = require('koa-router')
const config = require('../config')
const getBrowser = require('../util/browser')
const axios = require('axios')
const request = require('request')
const Iconv = require('iconv-lite')
const nodejieba = require("nodejieba")
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const router = new Router({
  prefix: '/api/v1'
})

router.get('/', async (ctx, next) => {
  const browser = await getBrowser()
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
  page.close()

  let result = {
    success: false,
    list: []
  }
  if (products) {
    const subscribeFile = await fs.readFileAsync('subscribe.json')
    const subscribe = JSON.parse(subscribeFile.toString())
    const items = subscribe.items

    result = {
      success: true,
      list: products.map(item => {
        item.subscribe = items.indexOf(item.sku) > -1
        return item
      })
    }
  }
  ctx.body = result
})

const getCommentUrl = function(sku, page, pageSize = 10) {
  return `https://sclub.jd.com/comment/productPageComments.action?productId=${sku}&score=0&sortType=6&page=${page}&pageSize=${pageSize}&isShadowSku=0&rid=0&fold=1`
}
router.get('/items/:sku', async (ctx, next) => {
  const sku = ctx.params.sku
  const ITEM_URL = `https://item.jd.com/${sku}.html`
  const commentUrl = getCommentUrl(sku, 0)

  const fetchComments = function(page) {
    const url = getCommentUrl(sku, page)
    return axios.get(url, {
      responseType: 'arraybuffer'
    })
  }

  let comments = []
  await axios
    .all(Array.from({ length: 10 }).map((p, i) => fetchComments(i)))
    .then(
      axios.spread(function(...results) {
        comments = results.reduce(function(prev, curr, index) {
          const body = JSON.parse(Iconv.decode(curr.data, 'gb2312'))
          if (typeof body === 'object') {
            return prev.concat(body.comments)
          }
          return prev
        }, [])
      })
    )

  let allCommentInOneString = comments
    .map(comment => {
      return comment.content
    })
    .join(' ')

  ctx.body = {
    success: true,
    data: nodejieba.extract(allCommentInOneString, 100)
  }
})

router.get('/subscribe', async (ctx, next) => {
  const sku = ctx.query.sku
  const subscribeFile = await fs.readFileAsync('subscribe.json')
  const subscribe = JSON.parse(subscribeFile.toString())
  const items = subscribe.items
  if (items.indexOf(sku) === -1) {
    items.push(sku)
  }
  await fs.writeFileAsync('subscribe.json', JSON.stringify(subscribe))
  ctx.body = {
    success: true
  }
})

router.get('/unsubscribe', async (ctx, next) => {
  const sku = ctx.query.sku
  const subscribeFile = await fs.readFileAsync('subscribe.json')
  const subscribe = JSON.parse(subscribeFile.toString())
  const items = subscribe.items
  const index = items.indexOf(sku)
  if (index > -1) {
    items.splice(index, 1)
  }
  await fs.writeFileAsync('subscribe.json', JSON.stringify(subscribe))
  ctx.body = {
    success: true
  }
})
module.exports = router
