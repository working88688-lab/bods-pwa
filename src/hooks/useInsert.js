/**
 * 每间隔指定长度插入广告
 * @param {number} len
 * @param {array} data
 * @param {Object} banner
 */
import _ from 'lodash'

export default function useInsert(len, data, banner) {
  const chunkList = _.chunk(data, len)
  let resultData = []
  chunkList.forEach(one => {
    one.push({ type: 'banner', data: banner })
    resultData = _.concat(resultData, one)
  })
  return resultData
}
