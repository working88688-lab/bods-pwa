<template>
  <div class="base-info" v-if="userInfo">
    <!-- <div
      class="info-cover"
      :style="{
        'background-image': 'url(' + imageBase + userInfo.headUrl + ')',
      }"
    ></div> -->
    <div class="base-info-content">
      <div class="base-top">
        <div class="base-top-right">
          <!-- <span class="icon-notify" @click="toRoute('/notice')"></span> -->
          <span class="icon-setting" @click="toRoute('/setting')"></span>
        </div>
      </div>
      <div class="user-info">
        <div class="avatar" @click="toHomePage">
          <img
            :src="
              userInfo.headUrl
                ? imageBase + userInfo.headUrl
                : require('@/assets/images/img_default_avatar1.png')
            "
            alt="avatar"
          />
          <img
            v-if="userInfo.vipFlag"
            class="vip-flag"
            src="@/assets/images/vip_actived.png"
            alt=""
          />
        </div>
        <div class="base-cont">
          <div class="user-name">
            <div class="username">
              <span>{{ userInfo.nickName }}</span>
              <span class="level" v-if="userInfo.expLevel">Lv{{ userInfo.expLevel }}</span>
            </div>
          </div>
          <!-- <div class="user-data">
            <div>
              {{
                userInfo.gender === 0
                  ? '保密'
                  : userInfo.gender === 1
                  ? '男'
                  : '女'
              }}
            </div>
            <div>ID: {{ userInfo.shareCode }}</div>
          </div> -->
          <div class="base-cont-bottom">
            <div @click="toRoute('/follow')">
              <span>关注：</span>
              <span>{{ formatNum(userInfo.followed || 0) }}</span>
            </div>
            <div @click="toRoute('/fans')">
              <span>粉丝：</span>
              <span>{{ formatNum(userInfo.followers || 0) }}</span>
            </div>
          </div>
        </div>
        <div class="base-right">
          <span class="btn-sign" @click="toHomePage">查看主页</span>
          <!-- <span class="btn-edit" @click="toRoute('/editInfo')">编辑</span> -->
        </div>
      </div>
      <div class="user-sign">{{ userInfo.signature || '这家伙很懒，暂时还没有个性签名' }}</div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatStrNum } from '@/utils/tools'

export default {
  name: 'BaseInfo',
  data() {
    return {}
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  created() {},
  mounted() {},
  methods: {
    toRoute(path) {
      this.$router.push(path)
    },
    toHomePage() {
      this.$router.push({
        path: '/homepage',
        query: {
          userId: this.userInfo.userId,
        },
      })
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD')
    },
  },
}
</script>

<style lang="less" scoped>
.base-info {
  padding: 16px;
  padding-top: calc(var(--safe-area-top));
  position: relative;
  .info-cover {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    background-size: 200%;
    background-position: center;
    background-repeat: no-repeat;
    // filter: blur(10px);
  }
  .info-cover::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.5) 100%
    );
  }
  .base-info-content {
    position: relative;
    z-index: 2;
    .base-top {
      display: flex;
      justify-content: flex-end;
      .base-top-left {
        background: #00000080;
        border-radius: 0 15px 15px 0;
        padding: 8px 16px;
        color: #e9b09e;
      }
      .base-top-right {
        .icon-message {
          display: inline-block;
          width: 24px;
          height: 24px;
          margin-left: 16px;
          background: url(../../assets/images/icon_comment_v2.png) center / 100%
            no-repeat;
          cursor: pointer;
        }
        .icon-setting {
          display: inline-block;
          width: 24px;
          height: 24px;
          margin-left: 16px;
          background: url(../../assets/images/icon_setting.png) center / 100%
            no-repeat;
          cursor: pointer;
        }
        .icon-notify {
          display: inline-block;
          width: 24px;
          height: 24px;
          margin-left: 16px;
          background: url(../../assets/images/iconNotify.png) center / 100%
            no-repeat;
          cursor: pointer;
        }
      }
    }
    .user-info {
      display: flex;
      align-items: center;
      padding: 16px 0 0;
      position: relative;
      .avatar {
        position: relative;
        img {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          overflow: hidden;
        }
        .vip-flag {
          width: 16px;
          height: 16px;
          position: absolute;
          bottom: 4px;
          right: 10px;
        }
      }
      .base-cont {
        width: calc((100% - 142px));
        margin-left: 10px;
        .user-name {
          margin-bottom: 4px;
          .username {
            font-size: 18px;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            .level {
              display: inline-block;
              padding: 2px 6px;
              background: #ff613d;
              border-radius: 4px;
              font-size: 10px;
              color: #ffffff;
              font-weight: normal;
              margin-left: 4px;
            }
          }
        }
        .user-data {
          display: inline-flex;
          margin: 8px 0;
          > div {
            margin-right: 24px;
            font-size: 12px;
          }
        }
        .base-cont-bottom {
          display: flex;
          color: #294986;
          font-size: 12px;
          font-weight: bold;
          > div {
            margin-right: 12px;
          }
        }
      }
      .base-right {
        width: 72px;
        height: 76px;
        text-align: right;
        font-size: 12px;
        .btn-sign {
          display: inline-block;
          width: 72px;
          height: 32px;
          line-height: 32px;
          border-radius: 16px;
          background: #109fff;
          color: #fff;
          text-align: center;
        }
        .btn-edit {
          display: inline-block;
          color: #2a78f6;
          padding: 6px 0;
          margin-top: 14px;
        }
      }
    }
    .user-sign {
      margin-top: 12px;
      font-size: 12px;
      color: #2a78f6;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
