<template>
  <div>
    <van-tabs
      v-if="tabList.length > 1"
      v-model="activedTab"
      title-inactive-color="#707070"
      title-active-color="#109fff"
      color="#109fff"
      background="none"
      :ellipsis="false"
      @change="onChangeTab"
    >
      <van-tab
        v-for="(tab, idx) in tabList"
        :key="idx"
        :title="tab.label"
        :name="tab.categoryId"
      ></van-tab>
    </van-tabs>
    <Loading v-if="isInit" />
    <template v-else>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="empty-box" v-if="!dataList.length">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="120"
            description="暂无数据哦~"
          />
        </div>
        <van-list
          v-else
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          class="data-list"
          @load="onLoad"
        >
          <div class="data-row">
            <div
              class="data-item"
              v-for="(data, idx) in dataList"
              :key="idx"
              @click="onPlay(data)"
            >
              <div
                class="data-subscript"
                v-if="
                  data.product &&
                  data.product.subscript &&
                  data.product.subscript.subscriptId
                "
              >
                <img v-lazy="imageBase + data.product.subscript.subscriptUrl" />
              </div>
              <img
                class="actor-img"
                v-lazy="
                  data.product.productIcon.indexOf('http') > -1
                    ? data.product.productIcon
                    : imageBase + data.product.productIcon
                "
              />
              <div class="actor-desc">
                <div class="data-name">{{ data.product.productName }}</div>
                <div class="data-down">下载</div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import { Dialog } from 'vant'
import Loading from '@/components/Loading'
import { formatStrNum } from '@/utils/tools'
import { listMediaBySearchType } from '@/apis/media'

export default {
  name: 'Game',
  components: {
    Loading,
  },
  props: {
    categoryId: {
      type: String,
      default: '',
    },
    child: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    appFooter() {
      return this.$store.state.appFooter
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  data() {
    return {
      activedTab: null,
      tabList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      isInit: true,
      finished: false,
      dataList: [],
      refreshing: false,
      loading: false,
    }
  },
  created() {
    if (this.child.length) {
      this.tabList = this.child.map(one => {
        const obj = {
          label: one.label,
          categoryId: one.categoryId,
        }
        return obj
      })
      this.activedTab = this.tabList[0].categoryId
      this.getDataList(null, true)
    } else {
      Dialog.confirm({
        title: '提示',
        message: '获取菜单信息失败，请刷新页面',
        className: 'confirm-dialog',
      })
        .then(async () => {
          window.location.reload()
        })
        .catch(() => {})
    }
  },
  activated() {},
  mounted() {},
  methods: {
    onChangeTab() {
      this.page.pageNo = 1
      this.isInit = true
      this.dataList = []
      this.getDataList(null, true)
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        mediaType: 6,
        orderType: 'SORT_PUBLISH',
        categoryId: this.activedTab,
      }
      this.loading = true
      const res = await listMediaBySearchType(params).catch(() => {
        this.isInit = false
        done && done()
        this.loading = false
        if (this.refreshing) {
          this.refreshing = false
        }
      })
      this.isInit = false
      done && done()
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        const resultData = res.data.dataList
        if (isRefresh) {
          this.dataList = resultData
        } else {
          this.dataList = this.dataList.concat(resultData)
        }
        this.finished = this.page.pageNo * this.page.pageSize > res.data.total
      }
    },
    onRefresh(done) {
      this.page.pageNo = 1
      this.getDataList(done, true)
    },
    onLoad(done) {
      this.page.pageNo++
      this.getDataList(done)
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    async onPlay(data) {
      this.$router.push({
        path: '/productDetail',
        query: {
          productId: data.mediaId,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.data-list {
  padding: 0 12px;
}
.data-item {
  width: 100%;
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  .data-subscript {
    position: absolute;
    top: 0;
    left: 0;
    width: 24px;
    img {
      width: 100%;
    }
  }
  .actor-img {
    width: 100%;
    border-radius: 8px;
  }
  .actor-desc {
    width: 100%;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .data-name {
      text-align: left;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .data-down {
      padding: 4px 16px;
      border-radius: 4px;
      background: #109fff;
      color: #fff;
      white-space: nowrap;
      margin-left: 6px;
    }
  }
  .actor-cp {
    position: absolute;
    left: 5px;
    top: 5px;
    background: url(../../assets/images/icon_cp.png) 6px center / auto 65%
      no-repeat #fe6fc5;
    border-radius: 10px;
    overflow: hidden;
    padding: 6px 12px 6px 28px;
    font-size: 10px;
  }
}
</style>
