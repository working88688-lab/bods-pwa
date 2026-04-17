<template>
  <div
    :id="'message-item_' + messageInfo.id"
    :class="'message-item ' + position"
    v-if="messageInfo.fromUserInfo"
  >
    <template v-if="position === 'left'">
      <div class="avatar" @click="onShowOperate">
        <img v-lazy="imageBase + messageInfo.fromUserInfo.headUrl" />
      </div>
      <div class="chat-box">
        <div class="chat-content">
          <div class="user-name">{{ messageInfo.fromUserInfo.nickName }}</div>
          <div class="message-box">
            <!-- 文本 -->
            <div class="text-box" v-if="messageInfo.msgType === 1">
              <div class="content-txt">
                <div
                  class="referer-box"
                  v-if="
                    messageInfo.refererUserId || messageInfo.refererMessageId
                  "
                >
                  <div class="referer">
                    @{{ messageInfo.fromUserInfo.nickName }}
                  </div>
                  <div
                    class="referer-content"
                    v-if="
                      messageInfo.refererMessageId && messageInfo.refererMessage
                    "
                  >
                    {{ messageInfo.refererMessage.content }}
                  </div>
                </div>
                <div>{{ messageInfo.content }}</div>
              </div>
            </div>
            <!-- 图片 -->
            <div class="img-box" v-else-if="messageInfo.msgType === 2">
              <div class="content-img">
                <img
                  v-lazy="imageBase + messageInfo.content"
                  @click="onClickPicture(imageBase + messageInfo.content)"
                  @load="onImgLoad(messageInfo)"
                />
              </div>
            </div>
            <!-- 分享 -->
            <div class="share-box" v-else-if="messageInfo.msgType === 6">
              <div class="content-share">
                <MovieItem
                  v-if="messageInfo.mediaInfo.mediaType === 1"
                  :videoInfo="messageInfo.mediaInfo"
                />
                <VideoItem
                  v-if="messageInfo.mediaInfo.mediaType === 2"
                  :videoInfo="messageInfo.mediaInfo"
                />
                <LouFengItem
                  v-if="messageInfo.mediaInfo.mediaType === 4"
                  :actorInfo="messageInfo.mediaInfo"
                />
                <LiveItem
                  v-if="messageInfo.mediaInfo.mediaType === 7"
                  :liveInfo="messageInfo.mediaInfo"
                />
              </div>
            </div>
          </div>
        </div>
        <i class="send-time">{{ formatDate(messageInfo.sentTime) }}</i>
      </div>
    </template>
    <template v-if="position === 'right'">
      <div class="chat-box">
        <i class="send-time">{{ formatDate(messageInfo.sentTime) }}</i>
        <div class="chat-content">
          <!-- <div class="user-name">{{ messageInfo.fromUserInfo.nickName }}</div> -->
          <div class="message-box">
            <!-- 文本 -->
            <div class="text-box" v-if="messageInfo.msgType === 1">
              <div class="content-txt">
                <div
                  class="referer-box"
                  v-if="
                    messageInfo.refererUserId || messageInfo.refererMessageId
                  "
                >
                  <div class="referer">
                    @{{ messageInfo.fromUserInfo.nickName }}
                  </div>
                  <div
                    class="referer-content"
                    v-if="
                      messageInfo.refererMessageId && messageInfo.refererMessage
                    "
                  >
                    {{ messageInfo.refererMessage.content }}
                  </div>
                </div>
                <div>{{ messageInfo.content }}</div>
              </div>
            </div>
            <!-- 图片 -->
            <div class="img-box" v-else-if="messageInfo.msgType === 2">
              <div class="content-img">
                <img
                  v-lazy="imageBase + messageInfo.content"
                  @click="onClickPicture(imageBase + messageInfo.content)"
                  @load="onImgLoad(messageInfo)"
                />
              </div>
            </div>
            <!-- 分享 -->
            <div class="share-box" v-else-if="messageInfo.msgType === 6">
              <div class="content-share">
                <MovieItem
                  v-if="messageInfo.mediaInfo.mediaType === 1"
                  :videoInfo="messageInfo.mediaInfo"
                />
                <VideoItem
                  v-if="messageInfo.mediaInfo.mediaType === 2"
                  :videoInfo="messageInfo.mediaInfo"
                />
                <LouFengItem
                  v-if="messageInfo.mediaInfo.mediaType === 4"
                  :actorInfo="messageInfo.mediaInfo"
                />
                <LiveItem
                  v-if="messageInfo.mediaInfo.mediaType === 7"
                  :liveInfo="messageInfo.mediaInfo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="avatar">
        <img v-lazy="imageBase + messageInfo.fromUserInfo.headUrl" />
      </div>
    </template>
  </div>
</template>

<script>
import { ImagePreview } from 'vant'
import dayjs from 'dayjs'
var isToday = require('dayjs/plugin/isToday')
dayjs.extend(isToday)
import MovieItem from '@/components/MovieItem'
import VideoItem from '@/components/VideoItem'
import LouFengItem from '@/components/LouFengItem'
import LiveItem from '@/components/LiveItem'

export default {
  name: 'MessageItem',
  components: {
    MovieItem,
    VideoItem,
    LouFengItem,
    LiveItem,
  },
  props: {
    position: {
      type: String,
      default: 'left',
    },
    messageInfo: {
      type: Object,
      default: () => {
        return {}
      },
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
  created() {},
  mounted() {},
  destroyed() {},
  methods: {
    formatDate(date) {
      if (dayjs(date).isToday()) {
        return dayjs(date).format('HH:mm')
      } else {
        return dayjs(date).format('MM-DD')
      }
    },
    onClickPicture(url) {
      ImagePreview([url])
    },
    onImgLoad(row) {
      if (row.toBottom) {
        this.$emit('onImgLoad')
      }
    },
    onShowOperate() {
      this.$emit('onShowOperate', this.messageInfo)
    },
  },
}
</script>

<style lang="less" scoped>
.message-item {
  display: flex;
  margin-bottom: 16px;
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .chat-box {
    max-width: 75%;
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    color: #ebebeb;
    .chat-content {
      .user-name {
        margin-bottom: 6px;
        font-size: 12px;
        color: #a3a3a3;
      }
      .message-box {
        display: inline-block;
        > div {
          display: inline-block;
        }
        .text-box {
          background: #fff;
          color: #333;
          border-radius: 4px;
          font-size: 14px;
          padding: 16px 12px;
          .content-txt {
            word-wrap: break-word;
            .referer-box {
              border-left: 2px solid #109fff;
              padding-left: 6px;
              margin-bottom: 10px;
              .referer {
                margin-right: 6px;
                color: #109fff;
              }
              .referer-content {
                margin-top: 6px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              }
            }
          }
        }
        .img-box {
          max-width: 50%;
          .content-img {
            width: 100%;
            img {
              max-width: 100%;
            }
          }
        }
        .content-share {
          width: 168px;
          .movie-item {
            width: 100%;
            margin: 0;
            .video-cover {
              height: 93px;
            }
          }
          .data-item {
            width: 100%;
            margin: 0;
          }
        }
      }
    }
    .send-time {
      color: rgb(143, 143, 148);
      font-size: 12px;
      margin-left: 6px;
      white-space: nowrap;
    }
  }
}
.message-item.right {
  justify-content: flex-end;
  .avatar {
    margin-right: 0;
    margin-left: 12px;
  }
  .chat-box {
    justify-content: flex-end;
    .chat-content {
      .user-name {
        text-align: right;
      }
      .message-box {
        .text-box {
          font-size: 14px;
          background: #109fff;
          color: #fff;
        }
        .img-box {
          float: right;
        }
        .content-share {
          width: 168px;
          .movie-item {
            width: 100%;
            margin: 0;
            .video-cover {
              height: 93px;
            }
          }
          .data-item {
            width: 100%;
            margin: 0;
          }
        }
      }
    }
  }
  .send-time {
    margin-left: 0;
    margin-right: 6px;
  }
}
</style>
