<template>
  <div class="comment-box">
    <Loading v-if="isInit" height="300px" />
    <template v-else>
      <div class="comment-header">
        <div class="comment-title">评论（{{ pageData.total }}）</div>
      </div>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="empty-box" v-if="!dataList.length">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="100"
            description="暂无内容"
          />
        </div>
        <van-list
          v-else
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          class="comment-list"
          @load="onLoad"
        >
          <div class="comment-row">
            <div
              class="comment-item"
              v-for="(data, idx) in dataList"
              :key="idx"
            >
              <div class="avatar">
                <img
                  :src="
                    data.userInfoPo.isDefault
                      ? data.userInfoPo.headUrl
                      : imageBase + data.userInfoPo.headUrl
                  "
                />
              </div>
              <div class="comment-center">
                <div class="user-info">
                  <div class="nike">{{ data.userInfoPo.nickName }}</div>
                  <div v-if="idx == 0" class="tips-box">温馨提示</div>
                </div>
                <div class="comment-cont">{{ data.content }}</div>
                <div class="reply">
                  <!-- <span class="send-time">{{
                    formatTime(data.createTime)
                  }}</span> -->
                  <span
                    v-if="
                      data.userInfoPo.userId !== userInfo.userId &&
                      !data.userInfoPo.isDefault
                    "
                    @click="onReply(data)"
                    >回复</span
                  >
                  <span
                    class="reply-total"
                    v-if="data.child.length && showChildComment !== data"
                    @click="handleChildComment(data)"
                  >
                    展开{{ data.child.length }}条回复
                    <van-icon name="arrow-down" />
                  </span>
                  <div
                    class="child-comment"
                    v-if="data.child.length && showChildComment === data"
                  >
                    <div
                      class="comment-item"
                      v-for="(child, idx) in data.child"
                      :key="idx"
                    >
                      <div class="avatar">
                        <img
                          :src="
                            child.userInfoPo.isDefault
                              ? child.userInfoPo.headUrl
                              : imageBase + child.userInfoPo.headUrl
                          "
                        />
                      </div>
                      <div class="comment-center">
                        <div class="user-info">
                          <div class="nike">
                            {{ child.userInfoPo.nickName }}
                          </div>
                        </div>
                        <div class="send-time">
                          {{ formatTime(child.createTime) }}
                        </div>
                        <div class="comment-cont">{{ child.content }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </template>
  </div>
</template>

<script>
import { listCommentByMediaId, commentAdd } from '@/apis/media'
import { formatStrNum } from '@/utils/tools'
import Loading from '@/components/Loading'
import dayjs from 'dayjs'

export default {
  name: 'Comment',
  props: {
    videoInfo: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  components: {
    Loading,
  },
  data() {
    return {
      isInit: true,
      pageData: {
        pageNo: 1,
        pageSize: 10,
        total: 0,
      },
      finished: false,
      refreshing: false,
      loading: false,
      dataList: [],
      formData: {
        content: '',
        parentId: '',
        rootCommentId: '',
      },
      isLoading: false,
      showDialog: false,
      rowData: null,
      placeholderText: '请输入内容',
      showChildComment: null,
      mediaId: '',
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  created() {
    this.mediaId = this.videoInfo.mediaId
    this.isInit = true
    this.dataList = []
    this.pageData.pageNo = 1
    this.pageData.total = 0
    this.finished = false
    this.getDataList(null, true)
  },
  mounted() {},
  methods: {
    addComment(data) {
      this.dataList.unshift(data)
    },
    async getDataList(done, isRefresh) {
      const params = {
        mediaId: this.videoInfo.mediaId,
        commentType: this.videoInfo.mediaType,
        pageNo: this.pageData.pageNo,
        pageSize: this.pageData.pageSize,
      }
      this.loading = true
      const res = await listCommentByMediaId(params).catch(() => {
        done && done()
      })
      done && done()
      this.isInit = false
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        if (isRefresh) {
          let result = res.data.dataList
          //创建一条默认评论
          result.unshift({
            userInfoPo: {
              userId: '34168798416849687',
              headUrl: require('../../../assets/images/cs_avatar.jpg'),
              nickName: '官方提示',
              isDefault: true,
            },
            content:
              '官方提示：群发广告的联系方式，千万不要相信！！都是骗子！！都是骗子！！都是骗子！！平台不承担任何责任！！请自行承担后果！！',
            createTime: dayjs().format('YYYY-MM-DD'),
            child: [],
          })
          this.dataList = result
        } else {
          this.dataList = this.dataList.concat(res.data.dataList)
        }
        this.pageData.total = res.data.total
        this.finished =
          this.pageData.pageNo * this.pageData.pageSize > res.data.total
      }
    },
    onRefresh(done) {
      this.pageData.pageNo = 1
      this.getDataList(done, true)
    },
    onLoad(done) {
      this.pageData.pageNo++
      this.getDataList(done)
    },
    onReply(data) {
      this.rowData = data
      this.placeholderText = '@' + data.userInfoPo.nickName
      this.$emit('onReply', data)
    },
    handleChildComment(data) {
      this.showChildComment = data
    },
    formatTime(time) {
      return dayjs(time).format('YYYY-MM-DD')
    },
  },
}
</script>

<style lang="less" scoped>
.comment-box {
  .comment-header {
    margin-bottom: 12px;
    .comment-title {
      font-size: 15px;
      text-align: left;
    }
  }
  .comment-list {
    .comment-item {
      display: flex;
      margin-bottom: 16px;
      .avatar {
        margin-right: 10px;
        background: #b600c5;
        padding: 1px;
        border-radius: 50%;
        overflow: hidden;
        width: 40px;
        height: 40px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          overflow: hidden;
        }
      }
      .comment-center {
        margin-right: 16px;
        width: calc(100% - 80px);
        .user-info {
          font-size: 14px;
          margin-bottom: 4px;
          color: #a3a3a3;
          display: inline-flex;
          align-items: center;
          .tips-box {
            padding: 2px 5px;
            background: #109fff;
            border-radius: 3px;
            margin-left: 10px;
            color: #fff;
          }
          .nike {
            display: inline-block;
            max-width: 190px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #000;
          }
        }
        .comment-cont {
          font-size: 14px;
          line-height: 21px;
          margin: 5px 0;
          color: #8e9199;
        }
        .send-time {
          font-size: 12px;
          color: #a3a3a3;
          margin-right: 12px;
        }
        .reply {
          color: #a3a3a3;
          span {
            font-size: 12px;
          }
          .reply-total {
            margin-left: 36px;
          }
        }
      }
      .comment-right {
        font-size: 12px;
        text-align: center;
        img {
          width: 16px;
        }
      }
      .child-comment {
        margin-top: 12px;
      }
    }
    .comment-item:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
