<template>
  <div class="comment-box flex-container">
    <Loading v-if="isInit" />
    <template v-else>
      <div class="comment-content">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="empty-box" v-if="!dataList.length">
            <van-empty
              :image="require('@/assets/images/emptyImage.png')"
              image-size="100"
              description="暂无评论"
            />
          </div>
          <van-list
            v-else
            v-model:loading="loading"
            @load="onLoad"
            :finished="finished"
            finished-text="没有更多了"
            class="comment-list"
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
                    <span>{{ data.userInfoPo.nickName }}</span>
                    <!-- <span class="level"
                      >Lv{{ data.userInfoPo.expLevel || 0 }}</span
                    > -->
                  </div>
                  <div class="send-time" v-if="data.createTime">
                    {{ data.createTime }}
                  </div>
                  <div class="comment-cont">{{ data.content }}</div>
                  <div class="reply">
                    <span
                      v-if="
                        !data.userInfoPo.isDefault &&
                        data.userInfoPo.userId !== userInfo.userId
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
                              data.userInfoPo.isDefault
                                ? child.userInfoPo.headUrl
                                : imageBase + child.userInfoPo.headUrl
                            "
                          />
                        </div>
                        <div class="comment-center">
                          <div class="user-info">
                            <span>{{ child.userInfoPo.nickName }}</span>
                            <span class="level"
                              >Lv{{ child.userInfoPo.expLevel || 0 }}</span
                            >
                          </div>
                          <div class="send-time" v-if="child.createTime">
                            {{ child.createTime }}
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
      </div>
      <van-cell-group :border="false">
        <van-field
          ref="contInput"
          v-model="formData.content"
          name="comment"
          :placeholder="placeholderText"
          @blur="onBlur"
        >
          <template slot="extra">
            <van-button
              type="primary"
              class="comment-btn"
              size="small"
              :loading="isLoading"
              @click="onSubmit"
            ></van-button>
          </template>
        </van-field>
      </van-cell-group>
    </template>
  </div>
</template>

<script>
import { listCommentByMediaId, commentAdd } from '@/apis/media'
import { formatStrNum } from '@/utils/tools'
import Loading from '@/components/Loading'

export default {
  name: 'CommentBox',
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
      rowData: null,
      placeholderText: '请输入内容',
      showChildComment: null,
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
  created() {},
  mounted() {},
  methods: {
    init() {
      this.isInit = true
      this.pageData.pageNo = 1
      this.dataList = []
      this.getDataList(null, true)
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
              headUrl: require('../../assets/logo.png'),
              nickName: '官方客服',
              isDefault: true,
            },
            content:
              '群发广告的一些联系方式，小心被骗，平台不负任何责任，请自行承担后果。',
            child: [],
          })
          this.dataList = result
        } else {
          this.dataList = this.dataList.concat(res.data.dataList)
        }
        this.pageData.total = res.data.total
        this.finished =
          this.pageData.pageNo * this.pageData.pageSize > res.data.total
        this.$emit('totle', this.pageData.total)
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
    async onSubmit() {
      if (!this.formData.content) {
        return this.$toast('请先填写评论内容')
      }
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const { content, parentId, rootCommentId } = this.formData
      const params = {
        content,
        mediaId: this.videoInfo.mediaId,
        commentType: this.videoInfo.mediaType,
        parentId,
        rootCommentId,
      }
      this.isLoading = true
      const res = await commentAdd(params).catch(() => {
        this.isLoading = false
      })
      this.isLoading = false
      if (res && res.code === 0) {
        this.handleSuccess()
      }
    },
    handleSuccess() {
      this.formData.content = ''
      this.$toast('评论成功')
      this.pageData.pageNo = 1
      this.getDataList(null, true)
      this.$emit('addComment')
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    onReply(data) {
      this.rowData = data
      this.placeholderText = '@' + data.userInfoPo.nickName
    },
    onBlur() {
      if (this.rowData) {
        this.formData.parentId = this.rowData.commentId
        this.formData.rootCommentId = this.rowData.rootCommentId
      }
      this.rowData = null
      this.placeholderText = '请输入内容'
    },
    handleChildComment(data) {
      this.showChildComment = data
    },
  },
}
</script>

<style lang="less" scoped>
.comment-box {
  flex: 1;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
  .comment-content {
    flex: 1;
    overflow: auto;
  }
  .empty-box {
    height: calc(100% - 55px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .van-pull-refresh {
    min-height: 100%;
  }
  .comment-list {
    padding: 0 16px 0;
    height: calc(100% - 55px);
    overflow-y: auto;
    .comment-item {
      display: flex;
      margin-bottom: 16px;
      .avatar {
        margin-right: 10px;
        img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
        }
      }
      .comment-center {
        margin-right: 16px;
        width: calc(100% - 80px);
        .user-info {
          font-size: 14px;
          color: #22222299;
          margin-bottom: 4px;
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
        .comment-cont {
          font-size: 14px;
          line-height: 21px;
          margin: 5px 0;
        }
        .send-time {
          font-size: 10px;
          color: #22222299;
        }
        .reply {
          span {
            font-size: 12px;
            color: #22222299;
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
::v-deep .van-cell {
  .van-cell__value {
    border-radius: 16px;
    padding: 6px 12px;
    font-size: 12px;
    background: #f6f6f6;
  }
  .comment-btn {
    width: 36px;
    height: 36px;
    margin-left: 6px;
    background: url(../../assets/images/send.png) no-repeat center / 100% !important;
    border: none !important;
  }
}
</style>
