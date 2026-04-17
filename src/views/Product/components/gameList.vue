<template>
  <div class="game-list-main">
    <Loading v-if="init" />
    <template v-else>
      <div v-if="list.length">
        <div class="box">
          <div class="item" v-for="(item, idx) in list" :key="idx" @click="onPlay(item)">
            <div class="con">
              <img v-lazy="item.product.productIcon.indexOf('http') > -1
                  ? item.product.productIcon
                  : imageBase + item.product.productIcon
                " class="icon" />
              <div class="float">
                <div class="left">
                  <img v-if="item.payType === 2" src="@/assets/images/gold.png" alt="" />
                  <span>{{ usePayType(item) }}</span>
                </div>
                <div class="right" v-if="
                  item.product.subscript &&
                  item.product.subscript.subscriptUrl
                ">
                  <img :src="imageBase + item.product.subscript.subscriptUrl" alt="" />
                </div>
              </div>
            </div>
            <div class="title van-ellipsis">{{ item.product.productName }}</div>
            <div class="count">
              <div>
                <van-icon name="eye-o" />
                <span>{{ formatStrNum(item.fakeFavorCount) || 0 }}</span>
              </div>
              <div>
                <img src="@/assets/images/download-icon.png" alt="" />
                <span>{{ formatStrNum(item.fakeViewCount) || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-box" v-else>
        <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="120" description="暂无数据哦~" />
      </div>
      <TopProduct :dataList="downloadList" />
    </template>
  </div>
</template>

<script>
import Loading from '@/components/Loading'
import TopProduct from '../TopProduct'
import {
  listMediaBySearchType,
  purchase,
  productClick,
  listPageBySecondCategoryId,
} from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import { Dialog } from 'vant'

export default {
  components: { Loading, TopProduct },
  props: {
    secondCategoryId: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
    expand: {
      type: String,
      default: '',
    },
    downloadList: Array,
  },
  data() {
    return {
      list: [],
      page: {
        pageNo: 1,
        pageSize: 200,
      },
      init: true,
      refreshing: false,
      loading: false,
      formatStrNum,
      formatDuration,
    }
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  methods: {
    onPlay(data) {
      this.$router.push({
          path: '/productDetail',
          query: {
              productId: data.mediaId
          }
      })
    },
    onJump(data) {
      if (data.product.productJumpType === 1) {
        // 跳转app安装链接
        if (this.device === 'ios') {
          window.location.href = data.productIosUrl
        } else if (this.device === 'android') {
          window.location.href = data.productAndroidUrl
        } else {
          if (data.product.productUrl) {
            window.open(data.product.productUrl, '_blank')
          } else {
            Dialog.alert({
              message: '请使用手机访问',
              confirmButtonText: '确定',
            }).then(async () => {})
          }
        }
      } else {
        // 跳转下载落地页
        if (this.isApp) {
          // this.$store.commit('SET_PREVROUTE', this.$route.fullPath)
          // const jumpData = JSON.stringify({
          //     jumpTo: data.product.productUrl
          // })
          // const jumpStr = encodeURI(jumpData)
          // this.$router.push({
          //     path: '/iframe',
          //     query: {
          //         jumpStr: jumpStr
          //     }
          // })
          window.open(data.product.productUrl, '_self')
        } else {
          window.open(data.product.productUrl, '_blank')
        }
      }
      productClick({ productId: data.mediaId })
    },
    usePayType({ payType, goldPayUnit }) {
      switch (payType) {
        case 1:
          return '免费'
        case 2:
          return goldPayUnit
        case 3:
          return `Lv${userLevel}`
        case 4:
          return `VIP`

        default:
          break
      }
    },
    async useData() {
      let res
      try {
        if (this.expand === '/all') {
          res = await listPageBySecondCategoryId({
            categoryId: this.secondCategoryId,
            mediaType: 6,
            ...this.page,
            orderType: 'SORT_PUBLISH',
          })
        } else {
          res = await listMediaBySearchType({
            ...this.page,
            mediaType: 6,
            orderType: 'SORT_PUBLISH_WEIGHT',
            categoryId: this.id,
          })
        }

        if (res && res.code === 0) {
          this.list = res.data.dataList
        }
      } catch (error) {
        throw error
      } finally {
        this.init && (this.init = false)
        this.loading && (this.loading = false)
      }
    },
  },
  created() {
    this.refreshing = true
    this.useData()
  },
  deactivated() {
  },
}
</script>

<style scoped lang="less">
.game-list-main {
  width: 100%;
    .top-product{
      padding-bottom: 20px;
    }
    .box {
      display: flex;
      flex-wrap: wrap;
      .item {
        width: calc((100% - 12px) / 2);
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-radius: 4px;
        // background: #1f1a1a;
        &:nth-of-type(2n) {
          margin-left: 12px;
        }
        .con {
          position: relative;
          & > img {
            width: 100%;
            aspect-ratio: 168 / 95;
            object-fit: cover;
            border-radius: 4px;
          }
          .float {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: space-between;
            .left {
              height: 18px;
              padding: 0 8px;
              display: flex;
              align-items: center;
              color: #fff;
              background: #d92514;
              border-radius: 4px;
              font-size: 11px;
              img {
                vertical-align: middle;
                width: 13px;
                height: 13px;
                margin-right: 2px;
              }
            }
            .right {
              img {
                width: 30px;
                height: 30px;
              }
            }
          }
        }
        .title {
          font-size: 12px;
          line-height: 1.5;
          margin: 5px 0;
        }
        .count {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2px;

          & > div {
            display: flex;
            align-items: center;
            font-size: 12px;
            line-height: 1.5;
            .van-icon {
              margin-right: 4px;
              font-size: 20px;
            }
            img {
              width: 20px;
              margin-right: 4px;
              vertical-align: middle;
            }
          }
        }
      }
      
    }
}
</style>
