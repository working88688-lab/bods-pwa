<template>
  <div class="product-page vip">
    <Header title="应用中心" textColor="#222" @onClickLeft="onBack" />
    <Banner location="recommend_page" />
    <van-tabs
      v-model="activedTab"
      line-height="0"
      :ellipsis="false"
      lazy-render
      animated
    >
      <van-tab
        v-for="(tab, idx) in tabList"
        :key="idx"
        :title="tab.label"
        :name="tab.categoryId"
      >
        <template v-if="tab.child && tab.child.length">
          <Category
            :categoryId="tab.child[0].categoryId"
            :layout="tab.child[0].layout"
            :downloadList="downloadList"
          />
        </template>
      </van-tab>
    </van-tabs>
    <!-- <div class="pornTip">声明：推荐APP由XVIDEOS官方亲测无毒，请放心下载</div> -->
  </div>
</template>

<script>
import Banner from '@/components/Banner'
import Header from '@/components/Header'
import _ from 'lodash'
import { Dialog } from 'vant'
import { downloadApp } from '@/utils/tools'
import Category from './Category.vue'
import PomCategory from './PomCategory'
import { useSecondaryNavigation } from '@/hooks'
import { listMediaBySearchType } from '@/apis/media'

export default {
  name: 'Product',
  components: { Category, PomCategory, Banner, Header },
  computed: {
    device() {
      return this.$store.state.device
    },
    isApp() {
      return this.$store.state.isApp
    },
    tabList() {
      return useSecondaryNavigation('/product').filter(
        item => item.expand !== '/pornGame'
      )
    },
  },
  data() {
    return {
      activedTab: null,
      showBanner: true,
      scrollTop: [],
      downloadList: [],
    }
  },
  created() {
    if (
      this.$route.path === '/product' &&
      (window.navigator.standalone === false ||
        /Android/i.test(window.navigator.userAgent))
    ) {
      this.onInstall()
    }
    this.getDownloadList()
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    async getDownloadList() {
      let params = {
        pageNo: 1,
        pageSize: 100,
        mediaType: 6,
        searchType: 'RECOMMEND',
      }
      const res = await listMediaBySearchType(params)
      if (res && res.code === 0) {
        this.downloadList = res.data.dataList
      }
    },
    onInstall() {
      const uuid = this.$store.state.uuid
      const agentCode = this.$store.state.agentCode
      const inviteCode = this.$store.state.inviteCode
      const appName = agentCode || 'EMAUVLTD'
      const device = this.$store.state.device
      Dialog.confirm({
        message: '将应用安装到桌面',
        cancelButtonText: '下次再说',
        confirmButtonText: '立即安装',
      })
        .then(async () => {
          downloadApp(device, inviteCode, appName, uuid)
        })
        .catch(() => {})
    },
  },
  beforeRouteLeave(to, from, next) {
    const scroller = document.getElementsByClassName('van-tab__pane')
    const arr = []
    for (let i = 0; i < scroller.length; i++) {
      arr.push(scroller[i].scrollTop)
    }
    this.scrollTop = arr
    next()
  },
  activated() {
    this.$nextTick(() => {
      if (this.scrollTop.length) {
        const scroller = document.getElementsByClassName('van-tab__pane')
        this.scrollTop.forEach((item, index) => {
          if (scroller[index].scrollTop !== item) {
            scroller[index].scrollTop = item
          }
        })
      }
    })
  },
}
</script>

<style lang="less" scoped>
.vip {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../assets/images/top_bg.png) top / 100% no-repeat
    transparent;
  padding-top: calc(var(--safe-area-top));
}
.product-page {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  ::v-deep .van-tabs {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .van-swipe {
      padding-bottom: 10px;
    }
    .van-tabs__content {
      height: 100%;
      overflow: hidden;

      .van-tab__pane {
        height: 100%;
        overflow-y: auto;

        .banner {
          padding: 16px 12px;
        }
      }
    }
  }
}

.pornTip {
  width: 100%;
  color: #8a8a8a;
  font-size: 13px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  background-color: #000;
  height: 34px;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
