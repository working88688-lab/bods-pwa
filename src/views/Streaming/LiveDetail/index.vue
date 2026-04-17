<template>
  <div class="page-container" :style="{ 'min-height': height }">
    <Header :arrowBg="true" :isBlur="false" @onClickLeft="onBack" />
    <Loading v-if="isInit" />
    <div class="page-content" v-else>
      <div class="bg-img">
        <img v-lazy="actorInfo && actorInfo.liveImage" />
      </div>
      <div class="actor-info">
        <div class="actor-info-left">
          <div class="avatar-box">
            <img :src="actorInfo.anchor.avatarUrl" />
          </div>
          <div class="actor-data">
            <div class="actor-name">
              {{ actorInfo.anchor.name || actorInfo.anchor.username }}
            </div>
            <div class="actor-age">
              <span>{{ actorInfo.anchor.age || 0 }}</span>
              <template v-for="(gender, idx) in broadcastGenderList">
                <span
                  v-if="gender.value === actorInfo.anchor.gender"
                  :key="'gender' + idx"
                  >{{ gender.text }}</span
                >
              </template>
            </div>
          </div>
        </div>
        <div class="actor-info-right">
          <div
            class="btn-collect"
            v-if="!actorInfo.hasCollect"
            @click="onCollect"
          >
            收藏
          </div>
          <div class="btn-collected" v-else @click="onCancelCollect">
            已收藏
          </div>
        </div>
      </div>
      <div class="topic-box">
        <div class="topic-title">{{ actorInfo.anchor.topic }}</div>
        <div class="btn-join" @click="handlePlay">
          <span>进入直播间</span>
          <img src="@/assets/images/right-c.png" alt="" />
        </div>
      </div>
      <div
        class="tabs-wrap"
        v-sticky="{ zIndex: 10, stickyTop: 44, disabled: false }"
      >
        <van-tabs
          v-model="activedTab"
          title-inactive-color="#ebebeb"
          title-active-color="#ebebeb"
          color="#ebebeb"
          background="none"
          :ellipsis="false"
          @change="onChange"
        >
          <van-tab
            v-for="(tab, idx) in tabList"
            :key="idx"
            :title="tab.label"
            :name="tab.value"
          ></van-tab>
        </van-tabs>
      </div>
      <div class="tab-content">
        <BaseInfo
          v-if="activedTab === 'baseInfo'"
          :actorInfo="actorInfo.anchor"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getMediaById } from '@/apis/media'
import { collectMedia, cancelCollectMedia } from '@/apis/media'
import BaseInfo from './BaseInfo'

export default {
  name: 'LiveDetail',
  components: {
    Header,
    Loading,
    BaseInfo,
  },
  data() {
    return {
      isInit: true,
      actorInfo: null,
      actorId: null,
      weeklyMap: {
        thu: '周一',
        tue: '周二',
        wed: '周三',
        sat: '周四',
        fri: '周五',
        mon: '周六',
        sun: '周日',
      },
      broadcastGenderList: [
        { text: '男性', value: 'male' },
        { text: '女性', value: 'female' },
        { text: '变性人', value: 'tranny' },
        { text: '群体表演', value: 'group' },
        { text: '情侣', value: 'couple' },
      ],
      tabList: [
        { label: '主播信息', value: 'baseInfo' },
        { label: '动态', value: 'dynamic' },
      ],
      activedTab: 'baseInfo',
      height: window.innerHeight + 'px',
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  created() {},
  mounted() {},
  activated() {
    if (!this.$route.query.actorId) {
      this.$router.push('/streaming')
    } else {
      if (this.$route.query.actorId !== this.actorId) {
        this.isInit = true
        this.actorInfo = null
        this.actorId = this.$route.query.actorId
        this.getAnchorDetail()
      }
    }
  },
  destroyed() {},
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    async getAnchorDetail() {
      const params = {
        mediaId: this.actorId,
        mediaType: 7,
      }
      const res = await getMediaById(params).catch(() => {
        this.isInit = false
      })
      this.isInit = false
      if (res && res.code === 0) {
        this.actorInfo = res.data
        if (this.actorInfo.anchor && this.actorInfo.anchor.schedule) {
          const liveTime = JSON.parse(this.actorInfo.anchor.schedule)
          this.actorInfo.anchor.schedule = []
          for (let key in liveTime) {
            let obj = {
              day: this.weeklyMap[key],
              time: liveTime[key][0],
            }
            this.actorInfo.anchor.schedule.push(obj)
          }
          this.actorInfo['liveImage'] =
            this.actorInfo.anchor.previewUrl ||
            this.actorInfo.anchor.previewUrlThumbBig ||
            this.actorInfo.anchor.previewUrlThumbSmall ||
            this.actorInfo.anchor.avatarUrl
        }
        if (this.actorInfo.anchor.specifics) {
          this.actorInfo.anchor.specifics = JSON.parse(
            this.actorInfo.anchor.specifics
          )
        }
        if (this.actorInfo.anchor.languages) {
          this.actorInfo.anchor.languages = JSON.parse(
            this.actorInfo.anchor.languages
          )
        }
      }
    },
    async onCollect() {
      const res = await collectMedia({
        merchantAcct: this.actorInfo.merchantAcct,
        mediaType: this.actorInfo.mediaType,
        mediaId: this.actorInfo.mediaId,
      })
      if (res && res.code === 0) {
        this.$toast('收藏成功')
        this.$set(this.actorInfo, 'hasCollect', true)
      }
    },
    async onCancelCollect() {
      const res = await cancelCollectMedia({
        merchantAcct: this.actorInfo.merchantAcct,
        mediaType: this.actorInfo.mediaType,
        mediaId: this.actorInfo.mediaId,
      })
      if (res && res.code === 0) {
        this.$toast('取消收藏')
        this.$set(this.actorInfo, 'hasCollect', false)
      }
    },
    handlePlay() {
      this.$router.push({
        path: '/live',
        query: {
          actorId: this.actorInfo.mediaId,
        },
      })
    },
    onChange() {},
  },
}
</script>

<style lang="less" scoped>
.page-container {
  background: #1d1d28;
}
.page-content {
  position: relative;
  z-index: 1;
  .bg-img {
    width: 100%;
    height: 230px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .bg-img::after {
    content: '';
    width: 100%;
    height: 230px;
    background: linear-gradient(#00000099, #000);
    position: absolute;
    right: 0;
    top: 0;
  }
  .actor-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    padding-top: 90px;
    .actor-info-left {
      display: inline-flex;
      align-items: center;
      .avatar-box {
        img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 50%;
          overflow: hidden;
        }
      }
      .actor-data {
        margin-left: 8px;
        .actor-name {
          font-size: 20px;
          color: #ebebeb;
        }
        .actor-age {
          color: #a3a3a3;
          font-size: 12px;
          margin-top: 6px;
          > span {
            margin-right: 6px;
          }
        }
      }
    }
    .actor-info-right {
      .btn-collect {
        display: inline-block;
        width: 60px;
        text-align: center;
        background: #109fff;
        border-radius: 16px;
        color: #f0f0f0;
        font-size: 12px;
        padding: 8px 12px;
        cursor: pointer;
        white-space: nowrap;
      }
      .btn-collected {
        display: inline-block;
        width: 60px;
        text-align: center;
        background: #1fb774;
        border-radius: 16px;
        color: #f0f0f0;
        font-size: 12px;
        padding: 8px 12px;
        cursor: pointer;
        white-space: nowrap;
      }
    }
  }
  .topic-box {
    height: 72px;
    background: url(../../../assets/images/live-bg.png) center / 100% no-repeat;
    margin: 16px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .topic-title {
      width: calc(100% - 136px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 16px;
      color: #ffe194;
    }
    .btn-join {
      font-size: 16px;
      background: #109fff;
      color: #f0f0f0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 136px;
      height: 34px;
      border-radius: 17px;
      img {
        width: 16px;
        margin-left: 4px;
      }
    }
  }
  .tab-content {
  }
}
::v-deep .van-tabs {
  .van-tabs__wrap {
    width: 100%;
    .van-tabs__nav {
      max-width: 100%;
      display: inline-flex;
      .van-tab {
        padding-bottom: 0;
        font-size: 15px;
        color: #ebebeb;
      }
      .van-tab--active {
        font-size: 18px;
        position: relative;
      }
      .van-tab--active::after {
        content: '';
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: linear-gradient(
          to right,
          rgba(121, 79, 255, 1),
          rgba(121, 79, 255, 0)
        );
        position: absolute;
        bottom: 6px;
        right: 6px;
      }
      .van-tabs__line {
        display: none;
      }
    }
  }
}
</style>
