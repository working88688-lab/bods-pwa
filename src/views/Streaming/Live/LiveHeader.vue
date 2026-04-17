<template>
  <div class="page-header">
    <div class="left" v-if="actorInfo">
      <div class="actor-info">
        <div class="actor-avatar" @click="onDetail">
          <img
            class="avatar"
            :src="
              actorInfo.anchor.avatarUrl &&
              actorInfo.anchor.avatarUrl.indexOf('http') > -1
                ? actorInfo.anchor.avatarUrl
                : imageBase + actorInfo.anchor.avatarUrl
            "
          />
        </div>
        <div
          class="actor-name"
          v-if="actorInfo.anchor.name || actorInfo.anchor.username"
          @click="onDetail"
        >
          {{ actorInfo.anchor.name || actorInfo.anchor.username }}
        </div>
        <div
          class="btn-collect"
          v-if="!actorInfo.hasCollect"
          @click="onCollect"
        >
          收藏
        </div>
        <div class="btn-collected" v-else @click="onCancelCollect">已收藏</div>
      </div>
      <div class="online">
        <span class="people-number"></span>
        <span>{{ formatNum(actorInfo.anchor.viewersCount || 1) }}</span>
      </div>
    </div>
    <span class="right-btn" @click="onClose"></span>
  </div>
</template>

<script>
import { formatStrNum } from '@/utils/tools'
import { collectMedia, cancelCollectMedia } from '@/apis/media'

export default {
  name: 'LiveHeader',
  props: {
    actorInfo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {}
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  methods: {
    onClose() {
      this.$emit('onClose')
      this.$store.ws.send(
        JSON.stringify({
          commandType: 'LEAVE_ROOM_REQ',
          sentTime: null,
          data: {},
        })
      )
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    async onCollect() {
      const res = await collectMedia({
        merchantAcct: this.actorInfo.merchantAcct,
        mediaType: this.actorInfo.mediaType,
        mediaId: this.actorInfo.mediaId,
      })
      if (res && res.code === 0) {
        this.$toast('收藏成功')
        const targetData = Object.assign({}, this.actorInfo)
        targetData.hasCollect = true
        this.$emit('updateInfo', targetData)
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
        const targetData = Object.assign({}, this.actorInfo)
        targetData.hasCollect = false
        this.$emit('updateInfo', targetData)
      }
    },
    onDetail() {
      this.$router.push({
        path: '/liveDetail',
        query: {
          actorId: this.actorInfo.mediaId,
        },
      })
    },
  },
}
</script>
<style lang="less" scoped>
.page-header {
  width: 100%;
  padding: 12px 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  top: 0;
  z-index: 2;
  i {
    width: 24px;
    height: 24px;
    font-size: 24px;
    position: absolute;
    top: 10px;
    left: 15px;
    color: #fff;
    cursor: pointer;
  }
  .left {
    width: calc(100% - 32px);
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    .actor-info {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      background: #000;
      border-radius: 16px;
      .actor-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .actor-name {
        margin: 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 80px !important;
      }
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
    .online {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      margin-left: 16px;
      background: #000;
      padding: 6px 12px;
      border-radius: 16px;
      .people-number {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url(../../../assets/images/icon_number_of_people.png) center /
          100% no-repeat;
        margin-right: 8px;
      }
    }
  }
  .right-btn {
    cursor: pointer;
    display: inline-block;
    width: 32px;
    height: 32px;
    background: url(../../../assets/images/icon_close3.png) center / 100%
      no-repeat;
  }
}
.is-horizontal {
  .page-header {
    padding: 6px;
    i {
      width: 12px;
      height: 12px;
      font-size: 12px;
      top: 5px;
      left: 7.5px;
    }
    .left {
      width: calc(100% - 16px);
      .actor-info {
        border-radius: 8px;
        .actor-avatar {
          width: 16px;
          height: 16px;
        }
        .actor-name {
          margin: 0 4px;
          max-width: 40px !important;
        }
        .btn-collect {
          width: 30px;
          border-radius: 8px;
          font-size: 6px;
          padding: 4px 6px;
        }
        .btn-collected {
          width: 30px;
          border-radius: 8px;
          font-size: 6px;
          padding: 4px 6px;
        }
      }
      .online {
        margin-left: 8px;
        padding: 3px 6px;
        border-radius: 8px;
        .people-number {
          width: 10px;
          height: 10px;
          margin-right: 4px;
        }
      }
    }
    .right-btn {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
