<template>
  <div class="page-content flex-container">
    <div class="section flex-container">
      <div class="section-content">
        <Loading v-if="isInit" />
        <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
          <div class="empty-box" v-if="!recordList.length">
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
            <div
              class="data-item"
              v-for="(record, idx) in recordList"
              :key="idx"
            >
              <div>
                <span>
                  <!-- <template v-for="(categoryType, idx) in categoryTypeList">
                                        <template v-if="(categoryType.value === record.category)">{{ categoryType.label }}</template>
                                    </template> -->
                  {{ record.categoryName }}
                </span>
                <span>{{ record.createTime }}</span>
              </div>
              <div>
                <span>
                  <template v-for="(transaction, idx) in transactionTypeList">
                    <template
                      v-if="transaction.value === record.transactionType"
                      >{{ transaction.label }}</template
                    >
                  </template>
                </span>
                <span class="green-text" v-if="record.transactionAmount >= 0">{{
                  '+' + record.transactionAmount + '币'
                }}</span>
                <span class="red-text" v-else>{{
                  record.transactionAmount + '币'
                }}</span>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </div>
    </div>
  </div>
</template>

<script>
import { transDetail } from '@/apis/user'
import Loading from '@/components/Loading'

export default {
  name: 'Balance',
  components: {
    Loading,
  },
  data() {
    return {
      isInit: true,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      finished: false,
      refreshing: false,
      loading: false,
      recordList: [],
      categoryTypeList: [
        { label: '充值', value: 1 },
        { label: '打赏', value: 2 },
        { label: '会员赠送', value: 3 },
        { label: '购买视频', value: 4 },
        { label: '系统调整', value: 5 },
        { label: '提现', value: 6 },
        { label: '任务奖励', value: 7 },
        { label: '邀约收益', value: 8 },
        { label: '新用户赠送', value: 9 },
        { label: '购买盲盒', value: 10 },
        { label: '盲盒奖励-金币', value: 11 },
        { label: '盲盒奖励-收益', value: 12 },
        { label: '提现驳回退款', value: 13 },
        { label: '提现扣款', value: 14 },
      ],
      transactionTypeList: [
        { label: '进账', value: 1 },
        { label: '出账', value: 2 },
      ],
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  created() {
    this.getDataList()
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    onRecharge() {
      this.$router.push('/recharge')
    },
    async getDataList(done, isRefresh) {
      const params = {
        balanceType: 0,
        ...this.page,
      }
      this.loading = true
      const res = await transDetail(params).catch(() => {
        this.isInit = false
      })
      done && done()
      this.isInit = false
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        if (isRefresh) {
          this.recordList = res.data.dataList
        } else {
          this.recordList = this.recordList.concat(res.data.dataList)
        }
        if (res.data.current * this.page.pageSize >= res.data.total) {
          this.finished = true
        }
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
  padding: 0 12px 0;
  .balance-box {
    height: 124px;
    background: #109fff;
    padding: 28px 16px 16px;
    position: relative;
    margin-top: 24px;
    .balance {
      color: #fff;
      font-size: 36px;
      margin-bottom: 4px;
    }
    .balance-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .balance-label {
        font-size: 15px;
        color: #f8f8f8cc;
      }
      .btn-recharge {
        display: inline-block;
        width: 84px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        border-radius: 4px;
        background: #fffc;
        font-size: 15px;
        color: #109fff;
      }
    }
  }
  .balance-box::after {
    content: '';
    display: inline-block;
    width: 68px;
    height: 68px;
    background: url(../../../assets/images/gold_big.png) no-repeat center / 100%;
    position: absolute;
    top: -24px;
    right: 24px;
  }
  .section {
    padding: 24px 0 0;
    .section-title {
      font-size: 16px;
      margin-bottom: 15px;
      color: #000;
    }
    .section-content {
      flex: 1;
      overflow: auto;
      .data-list {
        .data-item {
          padding: 16px;
          background: #fff;
          border-radius: 4px;
          margin-bottom: 8px;
          color: #999999;
          font-size: 12px;
          > div {
            display: flex;
            justify-content: space-between;
          }
          > div:first-child {
            margin-bottom: 8px;
            > span:first-child {
              color: #000;
              font-size: 15px;
            }
          }
          > div:last-child {
            > span:last-child {
              font-size: 14px;
            }
            .green-text {
              color: #109fff;
              font-weight: bold;
            }
            .red-text {
              color: #000;
              font-weight: bold;
            }
          }
        }
      }
    }
  }
}
</style>
