<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    round
    :style="{ height: '500px', 'max-height': '80%', background: '#f6f6f6' }"
    @closed="onClose"
  >
    <div class="popup-top">
      <div class="popup-title">
        {{ comicData ? comicData.comicVo.comicName : '' }}
      </div>
      <span class="btn-close" @click="onClose">
        <van-icon name="close" />
      </span>
    </div>
    <div class="popup-content">
      <Loading v-if="isInit" height="200px" />
      <template v-else>
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="empty-box" v-if="!chapterList.length">
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
            class="movie-list"
            @load="onLoad"
          >
            <div class="dire-list">
              <template v-for="(chapter, idx) in chapterList">
                <div
                  v-if="chapter.comicType === 12"
                  class="comics-dire-item"
                  :key="'comics' + idx"
                  @click="onChapter(chapter)"
                >
                  <div
                    class="dire-item-left"
                    :style="{
                      'background-image':
                        'url(' +
                        imageBase +
                        (chapter.chapterCover
                          ? chapter.chapterCover
                          : comicData.comicVo.comicCover) +
                        ')',
                    }"
                  >
                    <span class="payType free" v-if="chapter.payType === 1"
                      >限免</span
                    >
                    <span class="payType gold" v-if="chapter.payType === 2">
                      <span>{{ chapter.goldPayUnit }}</span>
                      <img src="@/assets/images/gold.png" />
                    </span>
                    <span class="payType level" v-if="chapter.payType === 3"
                      >Lv</span
                    >
                    <span class="payType vip" v-if="chapter.payType === 4"
                      >VIP</span
                    >
                  </div>
                  <div class="dire-item-right">
                    <span
                      class="chapter-name"
                      :class="{ read: chapter.isRead }"
                    >
                      <span
                        >第{{
                          chapter.chapterSeq > 9
                            ? chapter.chapterSeq
                            : '0' + chapter.chapterSeq
                        }}话</span
                      >
                      {{ chapter.chapterName }}
                    </span>
                    <div>
                      <span>观看</span>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="chapter.comicType === 13"
                  class="cartoon-dire-item"
                  :key="'cartoon' + idx"
                  @click="onChapter(chapter)"
                >
                  <div class="dire-item-top">
                    <div class="free" v-if="chapter.payType === 1">限免</div>
                    <div class="gold" v-if="chapter.payType === 2">
                      <span>{{ chapter.goldPayUnit }}</span>
                      <img src="@/assets/images/gold.png" />
                    </div>
                    <div class="level" v-if="chapter.payType === 3">
                      Lv {{ chapter.userLevel || 0 }}
                    </div>
                    <div class="vip" v-if="chapter.payType === 4">VIP</div>
                  </div>
                  <div
                    class="dire-item-cover"
                    v-lazy:background-image="imageBase + chapter.chapterCover"
                  ></div>
                  <div class="dire-item-bottom">
                    <div
                      class="dire-item-title"
                      :class="{ read: chapter.isRead }"
                    >
                      <span
                        >第{{
                          chapter.chapterSeq > 9
                            ? chapter.chapterSeq
                            : '0' + chapter.chapterSeq
                        }}集</span
                      >
                      {{ chapter.chapterName }}
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="chapter.comicType === 14"
                  class="fiction-dire-item"
                  :key="'fiction' + idx"
                  @click="onChapter(chapter)"
                >
                  <div class="dire-item-top">
                    <span class="payType free" v-if="chapter.payType === 1"
                      >限免</span
                    >
                    <span class="payType gold" v-if="chapter.payType === 2">
                      <span>{{ chapter.goldPayUnit }}</span>
                      <img src="@/assets/images/gold.png" />
                    </span>
                    <span class="payType level" v-if="chapter.payType === 3"
                      >Lv</span
                    >
                    <span class="payType vip" v-if="chapter.payType === 4"
                      >VIP</span
                    >
                  </div>
                  <span class="chapter-name" :class="{ read: chapter.isRead }">
                    <span
                      >第{{
                        chapter.chapterSeq > 9
                          ? chapter.chapterSeq
                          : '0' + chapter.chapterSeq
                      }}话</span
                    >
                    {{ chapter.chapterName }}
                  </span>
                </div>
              </template>
            </div>
          </van-list>
        </van-pull-refresh>
      </template>
    </div>
  </van-popup>
</template>

<script>
import Loading from '@/components/Loading'
import { comicById, pageChapterByComicId } from '@/apis/comic'

export default {
  name: 'CatalogComponent',
  components: {
    Loading,
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    godb() {
      return this.$store.state.godb
    },
  },
  data() {
    return {
      show: false,
      isInit: true,
      comicId: null,
      comicData: null,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      finished: false,
      chapterList: [],
      refreshing: false,
      loading: false,
      scrollTop: 0,
      historyList: [],
    }
  },
  created() {},
  methods: {
    async onShow() {
      const { comicId } = this.$route.query
      if (comicId) {
        this.show = true
        if (this.comicId !== comicId) {
          this.comicId = comicId
          this.init()
        } else {
          // 重新标记目录已读状态
          const liku = await this.godb.table('history').findAll(item => {
            return item.mediaId === this.comicId
          })
          this.historyList = liku.map(one => one.chapterId)
          this.chapterList = this.chapterList.map(one => {
            if (this.historyList.indexOf(one.chapterId) > -1) {
              one['isRead'] = true
            } else {
              one['isRead'] = false
            }
            return one
          })
        }
      }
    },
    onClose() {
      this.show = false
    },
    async init() {
      this.isInit = true
      const res = await comicById({
        comicId: this.comicId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      }).catch(() => {
        this.isInit = false
      })
      if (res && res.code === 0) {
        this.comicData = res.data
      }
      this.page.pageNo = 1
      const liku = await this.godb.table('history').findAll(item => {
        return item.mediaId === this.comicId
      })
      this.historyList = liku.map(one => one.chapterId)
      this.getDataList(null, true)
    },
    async getDataList(done, isRefresh) {
      this.loading = true
      const res = await pageChapterByComicId({
        ...this.page,
        comicId: this.comicId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      }).catch(() => {
        done && done()
        this.isInit = false
        this.loading = false
      })
      done && done()
      this.isInit = false
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        const resultData = res.data.dataList.map(one => {
          if (this.historyList.indexOf(one.chapterId) > -1) {
            one['isRead'] = true
          } else {
            one['isRead'] = false
          }
          return one
        })
        if (isRefresh) {
          this.chapterList = resultData
        } else {
          this.chapterList = this.chapterList.concat(resultData)
        }
        this.finished = this.page.pageNo * this.page.pageSize > res.data.total
      }
    },
    onRefresh() {
      this.page.pageNo = 1
      this.getDataList(null, true)
    },
    onLoad(done) {
      this.page.pageNo++
      this.getDataList(done)
    },
    onChapter(chapter) {
      if (this.comicData.mediaType === 8) {
        this.$router.push({
          path: '/comicsPlay',
          query: {
            comicId: this.comicId,
            chapterId: chapter.chapterId,
          },
        })
      } else if (this.comicData.mediaType === 9) {
        this.$router.push({
          path: '/cartoonPlay',
          query: {
            comicId: this.comicId,
            chapterId: chapter.chapterId,
            payType: chapter.payType,
          },
        })
      } else if (this.comicData.mediaType === 10) {
        this.$router.push({
          path: '/fictionPlay',
          query: {
            comicId: this.comicId,
            chapterId: chapter.chapterId,
          },
        })
      }
      this.onClose()
    },
  },
}
</script>

<style lang="less" scoped>
.van-popup {
  .popup-top {
    width: 100%;
    height: 36px;
    position: relative;
    background: #f6f6f6;
    .popup-title {
      height: 36px;
      line-height: 36px;
      text-align: center;
      font-size: 16px;
      max-width: 80%;
      margin: 0 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .btn-close {
      position: absolute;
      top: 6px;
      right: 6px;
      font-size: 24px;
    }
  }
  .popup-content {
    height: calc(100% - 36px);
    overflow-y: auto;
    padding: 0 16px;
    .dire-list {
      display: flex;
      flex-wrap: wrap;
      .comics-dire-item {
        width: 100%;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        background: #fff;
        border-radius: 6px;
        padding: 4px;
        .dire-item-left {
          width: 57px;
          height: 84px;
          position: relative;
          background-position: top;
          background-size: cover;
          background-repeat: no-repeat;
          .payType {
            display: inline-block;
            width: 32px;
            height: 18px;
            line-height: 18px;
            text-align: center;
            font-size: 12px;
            color: #fff;
            border-radius: 4px;
            margin-right: 4px;
            position: absolute;
            top: 0;
            left: 0;
          }
          .free {
            background: #30d158;
          }
          .gold {
            color: #222222;
            background: rgb(255 227 0);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            img {
              width: 12px;
              height: 12px;
              margin-left: 4px;
            }
          }
          .level {
            background: #ff613d;
          }
          .vip {
            background: #109fff;
          }
        }
        .dire-item-right {
          width: calc(100% - 57px);
          height: 84px;
          padding: 0 0 0 8px;
          box-sizing: border-box;
          display: inline-flex;
          flex-wrap: wrap;
          justify-content: space-between;
          .chapter-name {
            width: 100%;
            height: 60px;
            display: inline-block;
            line-height: 24px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .chapter-name.read {
            color: #a9a9a9;
          }
          > div {
            width: 100%;
            height: 24px;
            text-align: right;
            span {
              display: inline-block;
              width: 54px;
              height: 24px;
              line-height: 24px;
              text-align: center;
              background: #109fff;
              border-radius: 6px;
              color: #fff;
            }
          }
        }
      }
      .cartoon-dire-item {
        width: calc((100% - 12px) / 2);
        margin-bottom: 12px;
        margin-right: 12px;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border-radius: 6px;
        .dire-item-top {
          width: 100%;
          position: absolute;
          left: 0;
          top: 0;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          .free {
            padding: 4px 8px;
            font-size: 12px;
            color: #fff;
            background: #30d158;
            overflow: hidden;
            border-radius: 4px;
          }
          .gold {
            padding: 4px 8px;
            font-size: 12px;
            color: #222222;
            background: rgb(255 227 0);
            overflow: hidden;
            border-radius: 4px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            img {
              width: 12px;
              height: 12px;
              margin-left: 4px;
            }
          }
          .level {
            padding: 4px 8px;
            font-size: 12px;
            color: #fff;
            background: #ff613d;
            overflow: hidden;
            border-radius: 4px;
          }
          .vip {
            padding: 4px 8px;
            font-size: 12px;
            color: #fff;
            background: #109fff;
            overflow: hidden;
            border-radius: 4px;
          }
        }
        .dire-item-cover {
          height: 96px;
          overflow: hidden;
          position: relative;
          background-position: top;
          background-size: 100%;
          background-repeat: no-repeat;
          background-color: #222222;
        }
        .dire-item-bottom {
          .dire-item-title {
            width: 100%;
            font-size: 12px;
            margin: 6px 0 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .dire-item-title.read {
            color: #a9a9a9;
          }
        }
      }
      .cartoon-dire-item:nth-child(2n) {
        margin-right: 0;
      }
      .fiction-dire-item {
        width: 100%;
        position: relative;
        padding: 22px 16px;
        background: #fff;
        border-radius: 6px;
        margin-bottom: 6px;
        .dire-item-top {
          position: absolute;
          left: 0;
          top: 0;
          .payType {
            display: inline-block;
            width: 32px;
            height: 18px;
            line-height: 18px;
            text-align: center;
            font-size: 12px;
            color: #fff;
            border-radius: 4px;
          }
          .free {
            background: #30d158;
          }
          .gold {
            color: #222222;
            background: rgb(255 227 0);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            img {
              width: 12px;
              height: 12px;
              margin-left: 4px;
            }
          }
          .level {
            background: #ff613d;
          }
          .vip {
            background: #109fff;
          }
        }
        .chapter-name {
          width: 100%;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .chapter-name.read {
          color: #a9a9a9;
        }
      }
    }
  }
}
</style>
