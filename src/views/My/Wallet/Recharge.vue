<template>
  <div class="page-container flex-container vip">
    <Header
      textColor="#222222"
      title="金币充值"
      right="金币明细"
      rightColor="#747474"
      @onClickLeft="onBack"
      @onClickRight="onRoute('/wallet')"
    />
    <div class="page-content">
      <div class="content-top">
        <img src="@/assets/svg/recharge_bg.svg" alt="" />
        <div class="content-top-bottom">
          <div>金币余额</div>
          <div>{{ userInfo.coinBalance || 0 }}</div>
        </div>
      </div>
      <div class="content-bottom">
        <Loading v-if="isInit" />
        <template v-else>
          <div class="section">
            <div class="gold-pay-list">
              <div
                class="gold-pay-item"
                v-for="(goldPay, idx) in goldPayList"
                :key="idx"
                :class="{ selected: activedGold === goldPay }"
                @click="onChangeGoldType(goldPay)"
              >
                <div>
                  <span>{{ goldPay.goldNum }}</span>
                  <img src="@/assets/images/recharge-gold.png" alt="" />
                </div>
                <div>{{ goldPay.goldPrice + "元" }}</div>
                <div
                  class="give"
                  v-if="goldPay.goldNum - goldPay.goldPrice > 0"
                >
                  赠送{{ goldPay.goldNum - goldPay.goldPrice }}币
                </div>
              </div>
            </div>
          </div>
          <div
            class="section"
            v-if="
              activedGold &&
              activedGold.rechargePackages &&
              activedGold.rechargePackages.length
            "
          >
            <div class="content-label">充值礼包</div>
            <div class="gift-list">
              <div
                class="gift-item"
                v-for="(recharge, idx) in activedGold.rechargePackages"
              >
                <template v-if="recharge.packageType === 1"
                  >赠送<span>{{ recharge.howMany }}</span
                  >条私信包</template
                >
                <template v-if="recharge.packageType === 2">产品解锁</template>
                <template v-if="recharge.packageType === 3"
                  >赠送<span>{{ recharge.howMany }}</span
                  >次AI视频换脸</template
                >
                <template v-if="recharge.packageType === 4"
                  >赠送<span>{{ recharge.howMany }}</span
                  >次AI图片换脸</template
                >
              </div>
            </div>
            <div class="tip">
              说明：当充值成功后对应的礼包则在对应业务进行支付时进行优先使用。
            </div>
          </div>
          <div
            class="section"
            v-if="activedGold && activedGold.payTypeVoList.length"
          >
            <div class="content-label">支付方式</div>
            <div class="payType-list">
              <div
                class="payType"
                v-for="(payType, idx) in activedGold.payTypeVoList"
                :key="idx"
                @click="onChangePayType(payType)"
              >
                <div>
                  <img :src="imageBase + payType.imgUrl" />
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
          <div class="btn-box">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              @click="onBuyTipDialog()"
              >立即支付</van-button
            >
            <span class="FQ" @click="onRoute('/FQ')">常见问题</span>
          </div>
        </template>
      </div>
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
import { getGoldSetWithPayType } from "@/apis/pay";
import { pay, centerUserInfo } from "@/apis/user";
import { Dialog } from "vant";
import Loading from "@/components/Loading";

export default {
  name: "Recharge",
  components: {
    Header,
    Loading,
  },
  data() {
    return {
      isInit: true,
      goldPayList: [],
      activedGold: null,
      payTypeList: [],
      activedPayType: null,
      loading: false,
      showPopup: false,
      realName: "",
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : "";
    },
  },
  created() {},
  activated() {
    this.getUserInfo();
    this.init();
  },
  methods: {
    async init() {
      const res = await getGoldSetWithPayType({}).catch(() => {
        this.isInit = false;
      });
      this.isInit = false;
      if (res && res.code === 0) {
        this.goldPayList = res.data;
        this.activedGold = this.goldPayList[0];
        if (this.activedGold) {
          this.activedPayType = this.activedGold.payTypeVoList[0];
        } else {
          Dialog.confirm({
            title: "提示",
            message: "获取充值数据失败，是否重新加载",
            className: "confirm-dialog",
          })
            .then(async () => {
              window.location.reload();
            })
            .catch(() => {});
        }
      } else {
        Dialog.confirm({
          title: "提示",
          message: "获取充值数据失败，是否重新加载",
          className: "confirm-dialog",
        })
          .then(async () => {
            window.location.reload();
          })
          .catch(() => {});
      }
    },
    onBack() {
      this.$router.go(-1);
    },
    onRoute(path) {
      this.$router.push(path);
    },
    async getUserInfo() {
      const res = await centerUserInfo();
      if (res && res.code === 0) {
        this.$store.commit("SET_USERINFO", res.data);
      }
    },
    onChangeGoldType(data) {
      this.activedGold = data;
      this.activedPayType = data.payTypeVoList[0];
    },
    onChangePayType(payType) {
      this.activedPayType = payType;
    },
    onBuyTipDialog(realName) {
      Dialog.confirm({
        title: "温馨提示",
        message:
          "本APP有稳定的赞助商和广告收入，产品安全无毒，请放心使用！\n\n遇到支付宝/微信提醒恶意软件请忽略！无法支付请尝试切换支付方式重新发起。",
        className: "confirm-dialog",
        messageAlign: "left",
        confirmButtonText: "确认充值",
      })
        .then(async () => {
          this.onBuy(realName);
        })
        .catch(() => {});
    },
    async onBuy(realName) {
      if (!this.userInfo) {
        await this.$store.dispatch("macLogin");
      }
      if (!this.activedGold) {
        return this.$toast("请先选择充值数量");
      }
      if (!this.activedPayType) {
        return this.$toast("请先选择充值方式");
      }
      if (this.activedPayType.payType === "card" && !realName) {
        this.showPopup = true;
        return null;
      }
      const params = {
        pid: this.activedGold.goldCode,
        ptype: "coin",
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
    transparent;
  padding-top: calc(var(--safe-area-top));
}
.page-content {
  flex: 1;
  overflow: auto;
  .content-top {
    position: relative;
    margin: 24px 12px 0;
    img {
      width: 100%;
    }
    .content-title {
      font-size: 32px;
    }
    .content-top-bottom {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      font-size: 16px;
      padding: 16px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      > div:first-child {
        font-size: 20px;
        line-height: 24px;
        color: #294986;
      }
      > div:last-child {
        font-size: 30px;
        line-height: 1.5;
        color: #294986;
        font-weight: bold;
      }
    }
  }
  .content-bottom {
    border-radius: 20px 20px 0 0;
    padding: 16px 12px;
    .content-label {
      font-size: 16px;
      font-weight: bold;
      span {
        color: #109fff;
      }
    }
    .gift-list {
      margin: 16px 0 8px;
      padding: 16px;
      background: #fff;
      border-radius: 4px;
      span {
        color: #3597f9;
        margin: 0 4px;
      }
    }
    .tip {
      color: rgb(143 143 148);
      font-size: 12px;
      margin-bottom: 16px;
    }
    .gold-pay-list {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 16px;
      & > div {
        width: calc((100% - 20px) / 3);
        border: 1px solid #eeeeee;
        background: #fff;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #294986;
        padding: 17px 0;
        transition: all .2s;
        &:not(:nth-of-type(3n)) {
          margin-right: 10px;
        }
        & > div:first-of-type {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 26px;
          line-height: 28px;
          margin-bottom: 5px;
          img {
            width: 32px;
            height: 32px;
          }
        }
        & > div:nth-of-type(2) {
          font-size: 14px;
          line-height: 20px;
        }
        & > div:nth-of-type(3) {
          font-size: 14px;
          line-height: 20px;
          margin-top: 5px;
        }

        &.selected {
          background: #f0fbff;
          border-color: #109fff;
        }
      }
    }
    .payType-list {
      display: flex;
      flex-flow: wrap;
      margin: 16px 0 16px;
      .payType {
        width: 47.5%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 8px;
        background: #fff;
        border-radius: 4px;
        margin: 0 0 16px;
        padding: 18px 12px;
        cursor: pointer;
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
  .btn-box {
    margin: 24px 0;
    text-align: center;
    .FQ {
      display: inline-block;
      margin-top: 12px;
      font-size: 14px;
      color: rgb(177 177 177);
    }
  }
}
::v-deep .van-popup {
  padding: 24px 0;
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
        background: #f6f6f6 !important;
      }
      .van-field__control {
        height: 30px;
        line-height: 30px;
        font-size: 14px;
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
</style>
