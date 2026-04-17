<template>
  <div class="page-container flex-container vip">
    <Header
      textColor="#000"
      title="签到"
      :isBlur="false"
      @onClickLeft="onBack"
    />
    <div class="page-content">
      <Loading v-if="isInit" />
      <template v-else>
        <div class="signin-box">
          <div class="box">
            <template v-for="(item, index) in finishedDetail">
              <div
                :key="item.configCode"
                v-if="useShow(item)"
              >
                <div class="flex">
                  <span>{{ signInfo.totalSignDay }}天</span>
                  <span>{{ item.signDay }}天</span>
                </div>
                <div class="progress">
                  <div class="step-box">
                    <div
                      class="step"
                      :style="{ width: (signInfo.totalSignDay / item.signDay) * 100 + '%' }"
                    ></div>
                  </div>
                  <img
                    src="@/assets/images/check-icon.png"
                    alt=""
                    :style="{ left: (signInfo.totalSignDay / item.signDay) * 100 + '%' }"
                  />
                </div>
                <div class="flex">
                  <span>{{ index === 0 ? '开始' : finishedDetail[index - 1].signDay + 1 + '天' }}</span>
                  <span>还需签到{{ item.signDay - signInfo.totalSignDay }}天</span>
                  <span>{{ item.signType === 'vip' ? `${item.giveVip}天会员` : `${item.giveCoin}金币` }}</span>
                </div>
              </div>
            </template>
          </div>
          <img
            src="@/assets/images/signin_bg.png"
            class="signin-bg"
          />
          <!-- <div
            class="signin-cont"
            v-if="prevStep && currStep"
          >
            <div class="signin-progress">
              <div class="signin-step">
                <div
                  class="prev-step"
                  v-if="prevStep"
                >
                  <div class="signin-day">{{ prevStep.signDay + '天' }}</div>
                  <div class="signin-status prev-status">
                    <span
                      v-if="prevStep.isFinished"
                      class="not-check start"
                    ></span>
                    <span
                      v-else
                      class="checked"
                    ></span>
                  </div>
                  <div class="signin-gift">
                    <span>开始</span>
                  </div>
                </div>
                <div
                  class="curr-step"
                  v-if="currStep"
                >
                  <div class="signin-day">{{ currStep.signDay }}天</div>
                  <div class="signin-status curr-status">
                    <span
                      v-if="currStep.isFinished"
                      class="not-check end"
                    ></span>
                    <span
                      v-else
                      class="checked"
                    ></span>
                  </div>
                  <div class="signin-gift">
                    <span
                      >+{{
                        currStep.signType === 'vip' ? currStep.giveVip + '天VIP' : currStep.giveCoin + '金币'
                      }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-bar-value"
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
              <div
                class="signin-tip"
                v-if="prevStep && currStep"
              >
                还需签到{{ isStart ? prevStep.progressDay : currStep.progressDay }}天
              </div>
            </div>
          </div> -->
          <div class="btn-box">
            <van-button
              round
              block
              type="primary"
              :loading="isLoading"
              :disabled="todayStaus"
              class="signin-btn"
              @click="onSign"
            >
              {{ todayStaus ? '已签到' : '签到' }}
            </van-button>
          </div>
        </div>
        <div
          class="signin-rules"
          v-if="finishedDetail.length"
        >
          <div class="signin-rules-title">签到奖励</div>
          <div
            class="signin-rules-item"
            v-for="(config, idx) in finishedDetail"
            :key="idx"
          >
            累计签到{{ config.signDay }}天， 可获得{{
              config.signType === 'vip' ? config.giveVip + '天VIP' : config.giveCoin + '金币'
            }}
          </div>
        </div>
        <div class="signin-totle">
          <div class="signin-totle-title">我获得的奖励</div>
          <div class="signin-totle-list">
            <div class="signin-totle-item">
              <div>
                <img src="@/assets/images/icon_check_in.png" />
                <span>签到天数</span>
              </div>
              <div>
                <span>{{ signInfo.totalSignDay || 0 }}</span>
                <span>天</span>
              </div>
            </div>
            <div class="signin-totle-item">
              <div>
                <img src="@/assets/images/gold2.png" />
                <span>累计获得金币</span>
              </div>
              <div>
                <span>{{ signInfo.totalGiveCoin || 0 }}</span>
                <span>个</span>
              </div>
            </div>
            <div class="signin-totle-item">
              <div>
                <img src="@/assets/images/vip2.png" />
                <span>累计获得VIP</span>
              </div>
              <div>
                <span>{{ signInfo.totalGiveVip || 0 }}</span>
                <span>天</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div
        class="banner-wraper"
        v-if="showBanner"
      >
        <Banner
          location="register"
          @onFinish="handleBannerFinish"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import Header from '@/components/Header'
  import { chechIsFinishedDetail, getSignInformation, usersign, checkTodayisSign } from '@/apis/activity'
  import _ from 'lodash'
  import Loading from '@/components/Loading'
  import { Dialog } from 'vant'
  import dayjs from 'dayjs'
  import Banner from '@/components/Banner'

  export default {
    name: 'Signin',
    components: { Header, Loading, Banner },
    data() {
      return {
        isInit: true,
        finishedDetail: [],
        currStep: null,
        prevStep: null,
        progress: 0,
        isStart: false,
        signInfo: {},
        isLoading: false,
        todayStaus: true,
        showBanner: true,
      }
    },
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
      },
      isApp() {
        return this.$store.state.isApp
      },
    },
    created() {},
    activated() {
      this.getFinishedDetail()
      this.getSignInfo()
      this.checkSignStatus()
    },
    mounted() {},
    methods: {
      useShow(e) {
        const arr = this.finishedDetail
          .map(item => ({
            ...item,
            num: Math.abs(item.signDay - this.signInfo.totalSignDay),
          }))
          .sort((a, b) => a.num - b.num)
        return e.configCode === arr[0].configCode
      },
      onBack() {
        this.$router.go(-1)
      },
      formatDate(date) {
        return dayjs(date).format('YYYY-MM-DD')
      },
      async getFinishedDetail() {
        const res = await chechIsFinishedDetail({}).catch(() => {
          this.isInit = false
        })
        this.isInit = false
        if (res && res.code === 0) {
          this.finishedDetail = res.data
          const currStep = this.finishedDetail.find(one => one.isFinished === 1)
          const cuurIndex = _.findIndex(this.finishedDetail, one => one.configCode === currStep.configCode)
          if (cuurIndex === -1) {
            this.isStart = true
            this.prevStep = null
            this.currStep = null
            this.progress = 0
          } else if (cuurIndex === 0) {
            this.isStart = true
            this.prevStep = currStep
            this.currStep = this.finishedDetail[cuurIndex + 1]
            this.progress = (10 * (this.prevStep.signDay - this.prevStep.progressDay)) / this.prevStep.signDay
          } else {
            this.isStart = false
            this.prevStep = this.finishedDetail[cuurIndex - 1]
            this.currStep = currStep
            this.progress =
              10 +
              (90 * (this.currStep.signDay - this.currStep.progressDay - this.prevStep.signDay)) /
                (this.currStep.signDay - this.prevStep.signDay)
          }
        }
      },
      async getSignInfo() {
        const res = await getSignInformation({})
        if (res && res.code === 0) {
          this.signInfo = res.data
        }
      },
      async checkSignStatus() {
        const res = await checkTodayisSign({})
        if (res && res.code === 0) {
          this.todayStaus = res.data
        }
      },
      async onSign() {
        this.isLoading = true
        const res = await usersign({}).catch(() => {
          this.isLoading = false
        })
        this.isLoading = false
        if (res && res.code === 0) {
          let dialogText = ''
          if (res.data.give === 'Yes') {
            dialogText =
              '恭喜获得' + (res.data.signType === 'vip' ? res.data.giveVip + '天VIP' : res.data.giveCoin + '金币')
          } else {
            dialogText = '签到成功'
          }
          Dialog.alert({
            title: '提示',
            message: dialogText,
            className: 'confirm-dialog',
          })
            .then(async () => {})
            .catch(() => {})
          this.getFinishedDetail()
          this.getSignInfo()
          this.checkSignStatus()
        }
      },
      handleBannerFinish(data) {
        this.showBanner = !!data.length
      },
    },
  }
</script>

<style lang="less" scoped>
  .box {
    background: #fff;
    border-radius: 6px;
    padding: 10px;
    .flex {
      display: flex;
      justify-content: space-between;
      &:first-of-type {
        font-size: 12px;
        color: #222;
        padding: 0 5px;
        margin-bottom: 5px;
      }
      &:last-of-type {
        font-size: 12px;
        color: #000;
        font-weight: bold;
        &>span:nth-of-type(2) {
          color: #999;
          font-weight: normal;
        }
      }
    }
    .progress {
      height: 16px;
      position: relative;
      padding: 5px 0;
      margin: 10px 0;
      .step-box {
        height: 6px;
        border-radius: 9px;
        background: #e4e4e4;
        .step {
          height: 6px;
          background: var(--theme-color);
          border-radius: 9px;
        }
      }
      img {
        width: 16px;
        height: 16px;
        position: absolute;
        z-index: 2;
        top: 0;
        transform: translate(-5px, 0);
      }
    }
  }
  .vip {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(../../../assets/images/top_bg.png) top / 100% no-repeat transparent;
    padding-top: calc(var(--safe-area-top));
  }
  .page-content {
    flex: 1;
    overflow: auto;
    padding-bottom: 20px;
    .signin-box {
      padding: 140px 16px 16px;
      position: relative;
      .signin-bg {
        width: 200px;
        position: absolute;
        top: 0;
        left: calc((100% - 200px) / 2);
        z-index: 1;
      }
      .btn-box {
        width: 160px;
        margin: 14px auto 0;
      }
      .signin-cont {
        background: #fff;
        padding: 16px 8px 4px;
        border-radius: 8px;
        .signin-progress {
          position: relative;
          .signin-step {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 1;
            .prev-step,
            .curr-step {
              > div {
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto;
              }
            }
            .signin-day {
              font-size: 10px;
            }
            .signin-gift {
              color: #000000;
              padding: 6px 8px 8px;
              font-size: 12px;
              font-weight: bold;
            }
            .signin-status {
              display: inline-block;
              width: 24px;
              height: 24px;
              margin-top: 8px !important;
              // margin-bottom: 8px!important;
              img {
                width: 100%;
              }
              .not-check {
                display: inline-block;
                width: 16px;
                height: 16px;
                background: #c0c0c0;
                border-radius: 50%;
              }
              .checked {
                display: inline-block;
                width: 16px;
                height: 16px;
                background: #109fff;
                border-radius: 50%;
              }
            }
            .gift-type {
              display: inline-block;
              width: 16px;
              height: 16px;
            }
          }
          .progress-bar {
            position: absolute;
            top: 28px;
            left: 0;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #d9d9d9;
            .progress-bar-value {
              height: 6px;
              border-radius: 3px;
              background: #109fff;
            }
          }
          .signin-tip {
            position: absolute;
            bottom: 12px;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 12px;
            color: #999999;
          }
        }
      }
    }
    .signin-rules {
      padding: 0 16px;
      .signin-rules-title {
        font-size: 18px;
        margin-bottom: 12px;
      }
      .signin-rules-item {
        font-size: 14px;
        line-height: 20px;
      }
    }
    .signin-totle {
      padding: 24px 16px;
      .signin-totle-title {
        font-size: 18px;
        margin-bottom: 12px;
      }
      .signin-totle-list {
        background: #fff;
        padding: 0 16px;
        .signin-totle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #99999933;
          > div:first-child {
            display: inline-flex;
            align-items: center;
            img {
              width: 24px;
              margin-right: 4px;
            }
          }
          > div:last-child {
            border-bottom: none;
            // span:first-child {
            //     color: #109fff;
            //     display: inline-block;
            //     margin-right: 6px;
            // }
          }
        }
      }
    }
  }
  ::v-deep .signin-btn {
    height: 40px;
    background-color: #109fff !important;
    color: #fff;
    border-color: transparent !important;
  }
  ::v-deep .signin-btn.van-button--disabled {
    height: 40px;
    background-color: transparent !important;
    color: #109fff;
    opacity: 1;
    border-color: #109fff !important;
  }
</style>
