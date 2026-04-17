<template>
  <div class="page-content pom-category-page">
    <div class="top-type-box">
        <van-tabs v-model="activId" @click="onClickTab" :swipe-threshold="2" class="subcomponent" animated>
          <div slot="nav-left" class="type-title">类型：</div>
          <van-tab v-for="item in typeList" :key="item.thirdCategoryId" :title="item.thirdCategoryName"
            :name="item.thirdCategoryId">
            <GameList :secondCategoryId="item.secondCategoryId" :expand="item.expand" :id="item.thirdCategoryId"
              :downloadList="downloadList" />
          </van-tab>
        </van-tabs>
      </div>
  </div>
</template>

<script>
import { productClick } from '@/apis/media'
import _ from 'lodash'
import { Dialog } from 'vant'
import GameList from './components/gameList.vue'

export default {
  name: 'PomCategory',
  components: { GameList },
  props: {
    categoryId: {
      type: String,
      default: '',
    },
    typeList: Array,
    downloadList: Array,
  },
  data() {
    return {
      activId: null,
    }
  },
  computed: {
    isApp() {
      return this.$store.state.isApp
    },
  },
  created() { },
  activated() { },
  destroyed() { },
  methods: {
    onClickTab(name, title) {
      // console.log(name, title, this.activId);
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
            }).then(async () => { })
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
  },
}
</script>

<style lang="less" scoped>
 .pom-category-page {
  ::v-deep .subcomponent {
    display: unset !important;

    .van-tab__pane {
      overflow: unset;
    }
  }
}

::v-deep .top-type-box {
    color: #000;
    font-size: 15px;
    position: relative;
    padding: 0 12px;

    .van-sticky--fixed {
      left: unset;
      right: unset;
      top: 0 !important;
    }

    .type-title {
      height: 26px;
      line-height: 26px;
      white-space: nowrap;
      box-sizing: content-box;
      // background: rgb(60, 5, 5);
      position: sticky;
      left: 0;
      z-index: 9;
    }

    .van-tabs__wrap {
      height: 28px;
      line-height: 28px;
      box-sizing: content-box;
      // background: linear-gradient(to right, rgb(60, 5, 5), rgb(0, 0, 0));
      padding: 10px 0;
      position: sticky;
      top: 0;
      z-index: 9;

      .van-tabs__line {
        display: none;
      }

      .van-tabs__nav {
        padding-left: 0;
        padding-bottom: 0;
      }

      .van-tab {
        margin: 0 6px;
        height: 24px;
        line-height: 24px;
        border: 1px solid var(--theme-color);
        border-radius: 12px;
        font-size: 14px;
        padding: 0 10px;
      }

      .van-tab--active {
        background: var(--theme-color);
        color: #fff;
      }
    }
  }
</style>
