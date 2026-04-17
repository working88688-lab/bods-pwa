<template>
  <div class="page-container flex-container vip">
    <Header
      :title="userInfo.vipFlag ? '续费vip' : '开通VIP'"
      right="购买记录"
      @onClickLeft="onBack"
      @onClickRight="onRecord"
      textColor="#000"
      rightColor="#222"
    />
    <div class="page-content">
      <VipSwipe
        :isDetail="true"
        @onChangeIndex="onActivedVip"
        @onInited="handleInited"
      />
      <div class="section privilege" v-if="activedVip">
        <div class="section-title">VIP会员尊享特权</div>
        <div
          class="section-content"
          v-html="activedVip.discountDescription"
        ></div>
      </div>
      <div
        class="section privilege"
        v-if="
          activedVip &&
          activedVip.rechargePackages &&
          activedVip.rechargePackages.length
        "
      >
        <div class="section-title">充值礼包</div>
        <div class="section-content">
          <div class="gift-list">
            <div
              class="gift-item"
              v-for="(recharge, idx) in activedVip.rechargePackages"
              :key="idx"
            >
              <template v-if="recharge.packageType === 3">
                <img src="@/assets/images/face_video.png" />
                <div>视频换脸</div>
                <div>免费次数： {{ recharge.howMany }}</div>
              </template>
              <template v-if="recharge.packageType === 4">
                <img src="@/assets/images/face_img.png" />
                <div>图片换脸</div>
                <div>免费次数： {{ recharge.howMany }}</div>
              </template>
            </div>
          </div>
          <div class="tip">
            说明：当充值成功后对应的礼包则在对应业务进行支付时进行优先使用。
          </div>
        </div>
      </div>
      <Loading v-if="isInit" />
      <template v-else>
        <div
          class="section"
          v-if="activedVip && activedVip.payTypeVoList && activedVip.payTypeVoList.length"
        >
          <div class="section-title">支付方式</div>
          <div class="payType-list">
            <div
              class="payType"
              v-for="(payType, idx) in activedVip.payTypeVoList"
              :key="idx"
              @click="onChangePayType(payType)"
            >
              <div>
                <img :src="payType.imgUrl" />
                <span>{{ payType.payName }}</span>
              </div>
              <img
                v-if="
                  activedPayType && activedPayType.payType === payType.payType
                "
                src="@/assets/images/iconSingleChoiceChecked.png"
              />
              <img v-else src="@/assets/images/iconSingleChoice.png" />
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="btn-box">
      <van-button
        round
        block
        type="primary"
        native-type="submit"
        :loading="loading"
        @click="onBuyTipDialog()"
        >购买会员</van-button
      >
    </div>
    <van-popup
      v-model:show="showPopup"
      position="bottom"
      round
      :closeable="true"
    >
      <div class="popup-title">确认</div>
      <van-form label-width="50px">
        <van-cell-group :border="false">
          <div class="field-label">真实姓名</div>
          <van-field
            v-model="realName"
            name="account"
            placeholder="请填写真实姓名"
          />
        </van-cell-group>
      </van-form>
      <div class="btn-box">
        <van-button round class="mr-24" @click="onCancel">取消</van-button>
        <van-button round type="primary" @click="onFinish">完成</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import Header from "@/components/Header";
import VipSwipe from "./vipSwipe";
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import "swiper/css/swiper.css";
import _ from "lodash";
import { pay, exchangeVip, centerUserInfo } from "@/apis/user";
import { Dialog } from "vant";
import Loading from "@/components/Loading";

export default {
  name: "VIP",
  components: {
    Loading,
    Header,
    VipSwipe,
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      isInit: true,
      privList: [
        {
          label: "VIP资源",
          icon: require("../../../assets/images/iconVipResource.png"),
        },
        {
          label: "评论权限",
          icon: require("../../../assets/images/iconCommentPermissions.png"),
        },
        // { label: '动态审核', icon: require('../../../assets/images/iconPriority.png') },
        {
          label: "自定义头像",
          icon: require("../../../assets/images/iconCustomAvatar.png"),
        },
        {
          label: "个性化签名",
          icon: require("../../../assets/images/iconSignature.png"),
        },
        // { label: '查看动态', icon: require('../../../assets/images/iconBaoliao32.png') },
        {
          label: "等级增加",
          icon: require("../../../assets/images/iconLevelup.png"),
        },
        {
          label: "私信聊天",
          icon: require("../../../assets/images/iconMessage.png"),
        },
        // { label: 'VIP客服', icon: require('../../../assets/images/iconCS.png') },
        // { label: '参与活动', icon: require('../../../assets/images/iconActivity.png') },
        {
          label: "赠送金币",
          icon: require("../../../assets/images/iconGold.png"),
        },
        {
          label: "金币视频全免",
          icon: require("../../../assets/images/iconFree.png"),
        },
      ],
      swiperOptions: {
        initialSlide: 0,
        pagination: {
          el: ".swiper-pagination",
        },
      },
      activedPayType: null,
      activedVip: null,
      loading: false,
      showPopup: false,
      realName: "",
    };
  },
  computed: {
    device() {
      return this.$store.state.device;
    },
    userInfo() {
      return this.$store.state.userInfo;
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : "";
    },
  },
  created() {
    this.privList = _.chunk(this.privList, 4);
  },
  mounted() {},
  activated() {},
  methods: {
    onBack() {
      this.$router.go(-1);
    },
    onRecord() {
      this.$router.push("/buyRecord");
    },
    onChangePayType(payType) {
      this.activedPayType = payType;
    },
    handleInited(data) {
      this.isInit = false;
      if(data){
        this.activedVip = data;
      this.activedPayType = this.activedVip.payTypeVoList[0]
      }
    },
    onActivedVip(data) {
      this.activedVip = data;
    },
    async getUserInfo() {
      const res = await centerUserInfo();
      if (res && res.code === 0) {
        this.$store.commit("SET_USERINFO", res.data);
      }
    },
    onBuyTipDialog(realName) {
      if (this.activedPayType.payType === "coin") {
        if (this.activedVip.discountPrice > this.userInfo.coinBalance) {
          return this.$toast("金币不足，请选择其他方式");
        } else {
          Dialog.confirm({
            title: "提示",
            message: "是否确定花费金币兑换VIP？",
            className: "confirm-dialog",
            beforeClose: async (action, none) => {
              if (action === "confirm") {
                const params = {
                  vipCode: this.activedVip.vipCode,
                };
                const res = await exchangeVip(params);
                if (res.code === 0) {
                  this.$toast("VIP兑换成功，体验更多精彩内容");
                  return none();
                } else {
                  this.$toast("兑换失败");
                }
              } else {
                return none();
              }
            },
          })
            .then(async () => {})
            .catch(() => {});
        }
      } else {
        Dialog.confirm({
          title: "温馨提示",
          message: `<p>本APP有稳定的赞助商和广告收入，产品安全无毒，请放心使用！</p><p>遇到支付宝/微信提醒恶意软件请忽略！无法支付请尝试切换支付方式重新发起。</p>`,
          className: "recharge-confirm",
          messageAlign: "left",
          confirmButtonText: "确认充值",
        })
          .then(async () => {
            this.onBuy(realName);
          })
          .catch(() => {});
      }
    },
    async onBuy(realName) {
      if (!this.userInfo) {
        await this.$store.dispatch("macLogin");
      }
      if (!this.activedVip) {
        return this.$toast("请先选择购买VIP类型");
      }
      if (!this.activedPayType) {
        return this.$toast("请先选择充值方式");
      }
      if (this.activedPayType.payType === "card" && !realName) {
        this.showPopup = true;
        return null;
      }
      const params = {
        pid: this.activedVip.vipCode,
        ptype: "vip",
        pmethod: this.activedPayType.payType,
      };
      if (this.activedPayType.payType === "card") {
        params["realName"] = realName;
      }
      this.loading = true;
      const res = await pay(params).catch(() => {
        this.loading = false;
      });
      this.loading = false;
      if (res && res.code === 0) {
        if (res.data && res.data.payUrl) {
          Dialog.confirm({
            title: "提示",
            message: "订单创建成功，是否立即前往支付？",
          })
            .then(() => {
              window.open(res.data.payUrl, "_blank");
              // this.$store.commit('SET_PREVROUTE', this.$route.fullPath)
              // const jumpData = JSON.stringify({
              //     jumpTo: res.data.payUrl
              // })
              // const jumpStr = encodeURI(jumpData)
              // this.$router.push({
              //     path: '/iframe',
              //     query: {
              //         jumpStr: jumpStr
              //     }
              // })
              this.$router.push("/rechargeConfirm");
            })
            .catch(() => {});
        }
      }
    },
    onCancel() {
      this.showPopup = false;
      this.realName = "";
    },
    onFinish() {
      if (!this.realName) {
        return this.$toast("请先填写真实姓名");
      }
      this.onBuyTipDialog(this.realName);
      this.onCancel();
    },
  },
};
</script>

<style lang="less" scoped>
.vip {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../../assets/images/top_bg.png) top / 100% no-repeat
    #fff;
  padding-top: calc(var(--safe-area-top));
}
.page-content {
  flex: 1;
  overflow: auto;
  color: #020202;

  .section {
    padding: 24px 12px 0;

    .section-title {
      font-size: 16px;
      margin-bottom: 15px;
    }

    .section-content {
      white-space: pre-wrap;
      background: #f5f5f5;
      padding: 24px 32px;
      border-radius: 10px;
      text-align: left;
      line-height: 1.5;

      .gift-list {
        display: flex;
        justify-content: space-around;

        .gift-item {
          margin-bottom: 12px;
          text-align: center;

          img {
            width: 40px;
          }

          div {
            margin-top: 6px;
          }

          div:last-child {
            color: #666;
          }
        }
      }

      .tip {
        font-size: 12px;
        color: #666;
      }
    }

    .priv-swiper {
      border-radius: 8px;
      overflow: hidden;
      position: relative;

      .priv-list {
        width: 100%;
        display: flex;
        flex-flow: wrap;

        .priv-item {
          width: 25%;
          margin: 24px 0 36px;

          img {
            width: 50px;
            height: 50px;
            margin: 0 auto;
          }

          div {
            font-size: 12px;
            text-align: center;
            margin-top: 10px;
          }
        }
      }

      .swiper-pagination {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
      }
    }

    .payType-list {
      display: flex;
      flex-flow: wrap;

      .payType {
        width: 47.5%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 8px;
        background: #f5f5f5;
        margin: 0 0 16px;
        padding: 18px 12px;

        > div {
          display: flex;
          align-items: center;

          img {
            width: 24px;
            height: 24px;
          }

          span {
            font-size: 14px;
            margin-left: 10px;
          }
        }

        > img {
          width: 20px;
          height: 20px;
        }
      }

      .payType:nth-child(2n-1) {
        margin-right: 5%;
      }
    }
  }

  .privilege {
    text-align: center;

    .section-title {
      font-size: 16px;
      line-height: 18px;
      text-align: center;
      display: inline-block;
      position: relative;
    }

    .section-title::before {
      content: "";
      width: 50px;
      height: 4px;
      background: linear-gradient(to right, #93e8fb, #c7c6fd);
      position: absolute;
      bottom: 7px;
      left: -58px;
      border-radius: 4px;
    }

    .section-title::after {
      content: "";
      width: 50px;
      height: 4px;
      background: linear-gradient(to right, #c7c6fd, #93e8fb);
      position: absolute;
      bottom: 7px;
      right: -58px;
      border-radius: 4px;
    }
  }
}

.btn-box {
  margin: 12px 12px 24px;
}

::v-deep .van-popup {
  padding: 24px 0;
  background: #202020;
  color: #f8f8f8;

  .popup-title {
    font-size: 15px;
    font-weight: bold;
    text-align: center;
  }

  .van-form {
    padding: 12px;

    .van-cell-group {
      .field-label {
        margin: 12px 0 12px !important;
      }

      .van-cell {
        background: rgba(248, 248, 248, 0.15) !important;
      }

      .van-field__control {
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        color: #f8f8f8;
      }
    }
  }

  .btn-box {
    padding: 12px;

    .van-button {
      width: calc((100% - 24px) / 2);
    }

    .van-button--default {
      color: #000;
      background: #f6f6f6;
    }
  }
}

::v-deep .swiper-pagination {
  .swiper-pagination-bullet {
    background: #f8f8f8 !important;
  }

  .swiper-pagination-bullet-active {
    background: #fff !important;
  }
}
</style>