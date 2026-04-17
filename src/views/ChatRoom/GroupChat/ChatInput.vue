<template>
  <div class="chat-box">
    <div class="replay-box" v-if="chatInputType">
      <div class="replay-box-left">
        <span class="referer">@{{ replyData.fromUserInfo.nickName }}</span>
        <span class="replay-box-text" v-if="chatInputType === 2">
          <template v-if="replyData.msgType === 1">{{
            replyData.content
          }}</template>
          <template v-else-if="replyData.msgType === 2">图片</template>
          <template v-else-if="replyData.msgType === 6">
            <template v-if="replyData.mediaType === 1">长视频</template>
            <template v-else-if="replyData.mediaType === 2">短视频</template>
            <template v-else-if="replyData.mediaType === 4">楼凤</template>
            <template v-else-if="replyData.mediaType === 7">直播</template>
          </template>
        </span>
      </div>
      <div class="replay-box-right" @click="closeReply">
        <van-icon name="cross" />
      </div>
    </div>
    <van-cell-group class="chat-input" :border="false">
      <van-field
        v-model="message"
        placeholder="输入框聊天内容"
        @keyup.enter="onSubmit"
      >
        <template slot="label">
          <van-uploader
            accept="image/*"
            mutiple="mutiple"
            capture="camera"
            :max-size="2 * 1024 * 1024"
            :max-count="1"
            :before-read="beforeRead"
            :after-read="afterRead"
            @oversize="onOversize"
          />
        </template>
        <template slot="extra">
          <div class="sub-btn" @click="onSubmit">发送</div>
        </template>
      </van-field>
    </van-cell-group>
  </div>
</template>

<script>
import { uploadFile } from '@/apis/user'
import PubSub from 'pubsub-js'

export default {
  name: 'RoomChatInput',
  props: {
    dialogueId: {
      type: String,
      default: '',
    },
    roomInfo: {
      type: Object,
      default: function () {
        return {}
      },
    },
  },
  data() {
    return {
      message: '',
      imgUploadDialogueId: '', // 避免上传图片时切换房间混乱
      chatInputType: 0, // 0 ===> 普通   1 ===> 艾特    2 ===> 回复消息
      replyData: null,
    }
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
  destroyed() {
    this.imgUploadDialogueId = ''
  },
  methods: {
    onOversize() {
      this.$toast('文件大小不能超过 2MB')
    },
    beforeRead(file) {
      if (
        file.type !== 'image/jpeg' &&
        file.type !== 'image/png' &&
        file.type !== 'image/gif'
      ) {
        Toast('请上传图片')
        return false
      }
      return true
    },
    async afterRead(param) {
      const formData = new FormData()
      formData.append('file', param.file)
      const res = await uploadFile(formData)
      if (res && res.code === 0) {
        this.sendMessage(2, res.data.url, 2, this.roomInfo.roomId)
      }
    },
    onSubmit() {
      if (!this.message) {
        return this.$toast('请先输入聊天内容')
      }
      this.sendMessage(2, this.message, 1, this.roomInfo.roomId)
    },
    toAndroid(roomId) {
      this.imgUploadDialogueId = roomId
    },
    /**
     * msgType 1:文本,   2:图片,  3:视频,   4:语音,   5:红包,   6:分享
     */
    sendMessage(chatType, content, msgType, roomId) {
      let messageData = {
        commandType: 'ROOM_CHAT',
        sentTime: null,
        data: {
          merchantAcct: this.roomInfo.merchantAcct,
          dialogueId: this.dialogueId,
          chatType,
          roomType: this.roomInfo.roomType,
          msgType,
          fromUserId: this.userInfo.userId,
          roomId,
          refererUserId:
            this.chatInputType === 1
              ? this.replyData.fromUserInfo.userId
              : null,
          refererMessageId:
            this.chatInputType === 2 ? this.replyData.messageId : null,
          mediaType: null,
          mediaId: '',
          content,
        },
      }
      this.$store.ws.send(JSON.stringify(messageData))
      this.message = ''
      this.closeReply()
    },
    /**
     *
     * @param {*} type 1 ===> 艾特    2 ===> 回复消息
     * @param {*} replyData
     */
    showReply(type, replyData) {
      this.chatInputType = type
      this.replyData = replyData
    },
    closeReply() {
      this.chatInputType = 0
      this.replyData = null
    },
  },
}
</script>

<style lang="less" scoped>
.chat-box {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  .replay-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    font-size: 12px;
    background: #109fff;
    .replay-box-left {
      width: calc(100% - 20px);
      .referer {
        margin-right: 6px;
      }
      .replay-box-text {
        margin-top: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
    .replay-box-right {
      width: 20px;
      height: 20px;
      i {
        font-size: 20px;
      }
    }
  }
  .chat-input {
    height: 52px;
  }
}
::v-deep .van-cell {
  background: #ffff;
  padding: 8px 16px;
  height: 100%;
  .van-field__label {
    width: 32px;
  }
  .van-field__value {
    .van-field__body {
      height: 32px;
      background: #f6f6f6;
      padding: 0 8px;
      .van-field__control {
        color: #333333;
      }
    }
  }
  .sub-btn {
    height: 32px;
    line-height: 32px;
    padding: 0 16px;
    font-size: 14px;
    color: #ebebeb;
    background: #109fff;
    border-radius: 4px;
    margin-left: 8px;
  }
}
::v-deep .van-uploader {
  .van-uploader__wrapper {
    .van-uploader__upload {
      width: 32px;
      height: 32px;
      margin: 0;
      border-radius: 50%;
      background-color: #f6f6f6;
    }
  }
}
</style>
