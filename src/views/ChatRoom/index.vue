<template>
  <div class="page-container" :style="{ 'min-height': minHeight }">
    <Header color="#fff" textColor="#333333" title="聊天室" :showLeft="false" />
    <div class="page-content">
      <div class="cell-list">
        <div
          v-for="(cell, idx) in chatRoomList"
          :key="idx"
          @click="onClick(cell)"
          class="cell-item"
        >
          <div class="avatar">
            <img :src="imageBase + cell.room.roomAvatar" />
          </div>
          <div class="cell-content">
            <div class="cell-name">{{ cell.room.roomName }}</div>
            <div class="cell-last" v-if="cell.room.lastMessage">
              {{ cell.room.lastMessage }}
            </div>
          </div>
          <div class="cell-right">
            <span class="dot" v-if="cell.room.lastMessage"></span>
          </div>
        </div>
      </div>
    </div>
    <Footer activePath="/chatroom" />
  </div>
</template>
<script>
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default {
  name: 'ChatRoom',
  components: {
    Header,
    Footer,
  },
  computed: {
    appFooter() {
      return this.$store.state.appFooter
    },
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    chatRoomList() {
      return this.$store.state.chatRoomList
    },
  },
  data() {
    return {
      minHeight: window.innerHeight + 'px',
    }
  },
  created() {
    if (!this.userInfo || !this.userInfo.phoneNumber) {
      return this.$router.go(-1)
    }
  },
  activated() {},
  mounted() {},
  methods: {
    onClick(row) {
      this.$router.push({
        path: '/groupChat',
        query: {
          roomType: row.room.roomType,
          merchantAcct: row.merchantAcct,
          roomId: row.roomId,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {
  background: #fffafb;
}
.page-content {
  padding: 56px 16px 55px;
  .cell-list {
    .cell-item {
      display: flex;
      align-items: center;
      padding: 16px;
      margin-bottom: 16px;
      overflow: hidden;
      font-size: 16px;
      color: #333333;
      background: #fff;
      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 4px;
        background: #fff;
        overflow: hidden;
        img {
          width: 100%;
        }
      }
      .cell-content {
        width: calc(100% - 56px);
        height: 100%;
        padding: 0 16px;
        .cell-last {
          font-size: 12px;
          color: #a3a3a3;
          margin-top: 6px;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .cell-right {
        width: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background: #109fff;
        }
      }
    }
  }
}
</style>
