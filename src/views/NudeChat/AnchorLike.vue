<template>
  <div class="page-container">
    <Header
      textColor="#222222"
      color="#fff"
      title="我喜欢的"
      :isBlur="false"
      @onClickLeft="onBack"
    />
    <div class="page-content">
      <Loading v-if="isInit" />
      <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
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
          <div class="data-row" v-for="(data, idx) in dataList" :key="idx">
            <div class="data-item" @click="onPlay(data)">
              <img
                class="actor-img"
                v-lazy="imageBase + data.actor.actorCoverImg"
              />
              <div class="actor-desc">{{ data.actor.actorServiceDetail }}</div>
              <div class="actor-cp">{{ data.actor.totalOrderNum }}人约过</div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { listMediaBySearchType } from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import _ from 'lodash'

export default {
  name: 'AnchorLike',
  components: {
    Header,
    Loading,
  },
  data() {
    return {
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      isInit: true,
      finished: false,
      refreshing: false,
      loading: false,
      dataList: [],
    }
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  created() {
    this.getDataList()
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        mediaType: 4,
        searchType: 'USER_FAVOR_RECORD',
      }
      this.loading = true
      const res = await listMediaBySearchType(params).catch(() => {
        this.isInit = false
        done && done()
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
    formatDurationStr(num) {
      return formatDuration(num)
    },
    onPlay(anchorInfo) {
      this.$router.push({
        path: '/anchorDetail',
        query: {
          actorId: anchorInfo.mediaId,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {
}
.page-content {
  padding: 60px 0 0;
  min-height: 100vh;
  box-sizing: border-box;
  color: #fff;
}
.van-pull-refresh {
  min-height: calc(100vh - 200px);
}
.data-list {
  padding: 0 16px;
}
.data-row {
  display: flex;
  flex-flow: wrap;
}
.data-item {
  width: 48.5%;
  margin-right: 3%;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  .actor-img {
    width: 100%;
    height: 200px;
  }
  .actor-desc {
    width: 100%;
    height: 42px;
    line-height: 18px;
    background: #fff;
    padding: 5px;
    color: #222222;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
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
    color: white;
  }
}
.data-item:nth-child(2n) {
  margin-right: 0;
}
</style>
