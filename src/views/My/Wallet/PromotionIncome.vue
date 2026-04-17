<template>
  <div class="page-container">
    <Header textColor="#fff" title="推广收益明细" @onClickLeft="onBack" />
    <div class="page-content">
      <Loading v-if="isInit" />
      <template v-else>
        <div class="empty-box" v-if="!dataList.length">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="120"
            description="暂无数据哦~"
          />
        </div>
        <vue-loadmore
          v-else
          :on-refresh="onRefresh"
          :on-loadmore="onLoad"
          :finished="finished"
        >
          <div class="data-list">
            <div class="data-item" v-for="(data, idx) in dataList" :key="idx">
              <div>
                <div>
                  <span>用户：</span>
                  <span>{{ data.inviteUserCode }}</span>
                </div>
                <div>{{ data.payOrderTime }}</div>
              </div>
              <div>
                <div>
                  <span
                    >金币充值{{ data.payOrderAmount }}元，收益比例{{
                      data.incomeRate
                    }}%</span
                  >
                </div>
                <div class="red">{{ data.incomMoney }}元</div>
              </div>
            </div>
          </div>
        </vue-loadmore>
      </template>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import { incomePage } from '@/apis/user'
import Loading from '@/components/Loading'

export default {
  name: 'Recharge',
  components: {
    Header,
    Loading,
  },
  data() {
    return {
      isInit: true,
      loading: false,
      finished: false,
      totalData: {},
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      dataList: [],
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  created() {},
  activated() {
    this.getDataList()
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
      }
      const res = await incomePage(params).catch(() => {
        this.isInit = false
        done && done()
      })
      this.isInit = false
      done && done()
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
  },
}
</script>

<style lang="less" scoped>
.page-content {
  padding: 46px 0 0;
  min-height: 100vh;
  color: #f8f8f8;
  .data-list {
    padding: 12px;
  }
  .data-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 14px 10px;
    margin-bottom: 4px;
    font-size: 14px;
    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    > div:first-child {
      margin-bottom: 12px;
      > div:last-child {
        font-size: 12px;
        color: #999999;
      }
    }
    > div:last-child {
      > div:first-child {
        font-size: 12px;
        color: #999999;
      }
    }
    .red {
      color: #d92514;
    }
  }
}
</style>
