<template>
  <div class="page-container flex-container">
    <div class="page-top">
      <Header
        textColor="#fff"
        :color="showTabbg ? '#00000099' : ''"
        :isBlur="false"
        right="true"
        rightType="icon"
        :rightIcon="shareIcon"
        @onClickLeft="onBack"
        @onClickRight="onShare"
      />
    </div>
    <div class="page-main flex-container">
      <Loading v-if="isInit" />
      <template v-else>
        <div class="empty-box" v-if="!comicData">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="100"
            description="暂无内容"
          />
        </div>
        <template v-else>
          <div class="page-content">
            <div class="comic-img">
              <img
                v-lazy="
                  comicData.comicVo.comicCover
                    ? imageBase + comicData.comicVo.comicCover
                    : imageBase + comicData.comicVo.chapterCover
                "
              />
              <div class="comic-img-cover"></div>
            </div>
            <div class="comic-info">
              <div
                class="comic-cover"
                v-lazy:background-image="
                  comicData.comicVo.comicCover
                    ? imageBase + comicData.comicVo.comicCover
                    : imageBase + comicData.comicVo.chapterCover
                "
              ></div>
              <div class="comic-data">
                <div class="comic-title">{{ comicData.comicVo.comicName }}</div>
                <div class="comic-chapterOver">
                  <span>{{
                    comicData.comicVo.chapterOver ? '已完结' : '连载中'
                  }}</span>
                  <span>{{
                    comicData.comicVo.chapterOver
                      ? ' | 共' + comicData.comicVo.chapterTotal + '话'
                      : ' | 更新至' + comicData.comicVo.chapterCurrentSeq
                  }}</span>
                </div>
                <div class="comic-author">
                  <span>作者：</span>
                  {{ comicData.comicVo.comicAuthor || 'Boys' }}
                </div>
              </div>
            </div>
            <div class="comic-content">
              <div class="comic-like">
                <div @click="onLike">
                  <div>
                    <img
                      v-if="comicData.hasFavor"
                      src="@/assets/images/iconMyLike.png"
                    />
                    <img v-else src="@/assets/images/icon_like3.png" />
                    <span>{{
                      formatNum(
                        comicData.fakeFavorCount + comicData.favorCount
                      ) || 0
                    }}</span>
                  </div>
                  <div>点赞</div>
                </div>
                <div>
                  <div>
                    <img
                      class="icon"
                      src="@/assets/images/icon_comment_v5.png"
                      @click="onComment"
                    />
                    <span>{{ formatNum(comicData.commentCount) || 0 }}</span>
                  </div>
                  <div>评论</div>
                </div>
                <div @click="onReward">
                  <div>
                    <img class="icon" src="@/assets/images/icon_coin3.png" />
                  </div>
                  <div>打赏</div>
                </div>
                <div @click="onCollect">
                  <div>
                    <img
                      v-if="comicData.hasCollect"
                      src="@/assets/images/star3.png"
                    />
                    <img v-else src="@/assets/images/star2.png" />
                    <span>{{
                      formatNum(
                        comicData.collectCount + comicData.fakeCollectCount
                      ) || 0
                    }}</span>
                  </div>
                  <div>收藏</div>
                </div>
              </div>
              <div class="comic-desc">
                <div class="comic-desc-title">简介</div>
                <div>{{ comicData.comicVo.comicDesc }}</div>
                <div class="comic-tag">
                  <div
                    class="tag-item"
                    v-for="(tag, idx) in comicData.tagList"
                    :key="idx"
                    @click="onSearch(tag.tagName)"
                  >
                    #{{ tag.tagName }}
                  </div>
                </div>
              </div>
              <div class="dire-area" v-if="chapterList.length">
                <div
                  class="latest"
                  v-if="comicData.comicVo.chapterCurrentId * 1"
                >
                  <div class="latest-left" @click="onCatalog">目录</div>
                  <div class="latest-center" @click="onLatest">
                    <i class="icon-new"></i>
                    <div class="latest-title">
                      {{
                        (comicData.comicVo.chapterCurrentSeq > 9
                          ? comicData.comicVo.chapterCurrentSeq
                          : '0' + comicData.comicVo.chapterCurrentSeq) +
                        ' ' +
                        comicData.comicVo.chapterCurrentTitle
                      }}
                    </div>
                  </div>
                  <div class="latest-right" @click="onLatest">
                    <van-icon name="arrow" />
                  </div>
                </div>
                <div class="dire-list">
                  <template v-for="(chapter, idx) in chapterList.slice(0, 4)">
                    <div
                      v-if="comicData.mediaType === 8"
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
                          {{
                            (chapter.chapterSeq > 9
                              ? chapter.chapterSeq
                              : '0' + chapter.chapterSeq) +
                            ' ' +
                            chapter.chapterName
                          }}
                        </span>
                        <div>
                          <span>观看</span>
                        </div>
                      </div>
                    </div>
                    <div
                      v-else-if="comicData.mediaType === 9"
                      :key="'cartoon' + idx"
                      class="cartoon-dire-item"
                      @click="onChapter(chapter)"
                    >
                      <div class="dire-item-top">
                        <div class="free" v-if="chapter.payType === 1">
                          限免
                        </div>
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
                        v-lazy:background-image="
                          imageBase +
                          (chapter.chapterCover
                            ? chapter.chapterCover
                            : comicData.comicVo.comicCover)
                        "
                      ></div>
                      <div class="dire-item-bottom">
                        <div
                          class="dire-item-title"
                          :class="{ read: chapter.isRead }"
                        >
                          {{
                            (chapter.chapterSeq > 9
                              ? chapter.chapterSeq
                              : '0' + chapter.chapterSeq) +
                            ' ' +
                            chapter.chapterName
                          }}
                        </div>
                      </div>
                    </div>
                    <div
                      v-else-if="comicData.mediaType === 10"
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
                      <div
                        class="chapter-name"
                        :class="{ read: chapter.isRead }"
                      >
                        {{
                          (chapter.chapterSeq > 9
                            ? chapter.chapterSeq
                            : '0' + chapter.chapterSeq) +
                          ' ' +
                          chapter.chapterName
                        }}
                      </div>
                    </div>
                  </template>
                  <div class="view-list" @click="onCatalog">查看完整目录</div>
                </div>
              </div>
            </div>
            <div class="banner-wraper" v-if="showDetailBanner">
              <Banner
                location="movie_Details"
                @onFinish="handleDetailBannerFinish"
              />
            </div>
            <RecommendComponent
              v-if="comicData"
              :mediaType="comicData.mediaType"
              :categoryId="comicData.categoryId"
            />
          </div>
          <div class="comic-bottom">
            <div class="btn btn-collect" @click="onCollect">
              {{ comicData && comicData.hasCollect ? '已收藏' : '收藏' }}
            </div>
            <div class="btn btn-read" @click="onPlay">开始阅读</div>
          </div>
        </template>
      </template>
    </div>
    <Comment
      v-if="showComment"
      ref="commentRef"
      :videoInfo="comicData"
      @addComment="handleAddComment"
      @close="handleCloseComment"
    />
    <ShareDialog
      ref="ShareDialogRef"
      :cover="comicData && comicData.comicVo.comicCover"
      :title="comicData && comicData.comicVo.comicName"
    />
    <RewardDialog ref="RewardDialogRef" :comicData="comicData" />
    <PlayAds
      ref="playads"
      v-if="alertBannerList.length"
      :list="alertBannerList"
    />
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { comicById, pageChapterByComicId } from '@/apis/comic'
import { formatStrNum } from '@/utils/tools'
import Comment from '@/components/Comment'
import Banner from '@/components/Banner'
import RecommendComponent from './components/RecommendComponent'
import { collectMedia, favorAdd, cancelCollectMedia } from '@/apis/media'
import ShareDialog from './components/ShareDialog'
import RewardDialog from './components/RewardDialog'
import PlayAds from '@/components/PlayAds'

export default {
  name: 'WorkDetail',
  components: {
    Header,
    Loading,
    Comment,
    Banner,
    RecommendComponent,
    ShareDialog,
    RewardDialog,
    PlayAds,
  },
  watch: {
    '$route.query': {
      handler(val) {
        if (val && val.comicId && val.comicId !== this.comicId) {
          this.init()
        }
        if (val) {
          if (this.$refs?.playads?.onShow && val.comicId) {
            this.$refs.playads.onShow()
          }
        }
      },
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    godb() {
      return this.$store.state.godb
    },
    alertBannerList() {
      if (this.$store.state.banner && this.$store.state.banner['Comicpage']) {
        return this.$store.state.banner['Comicpage']
      } else {
        return []
      }
    },
  },
  data() {
    return {
      isInit: true,
      comicId: null,
      comicData: null,
      showComment: false,
      page: {
        pageNo: 1,
        pageSize: 5,
      },
      chapterList: [],
      finished: false,
      refreshing: false,
      loading: false,
      showBanner: true,
      showDetailBanner: true,
      isLoading: false,
      historyList: [],
      shareIcon: require('@/assets/images/share3.png'),
      showTabbg: false,
    }
  },
  created() {
    window.addEventListener('scroll', this.handleScroll, true)
  },
  mounted() {},
  async activated() {
    if (!this.comicId || this.comicId !== this.$route.query.comicId) {
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
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    async init() {
      if (!this.$route.query.comicId) {
        this.isInit = false
        return this.$toast('获取作品信息失败')
      } else {
        this.comicId = this.$route.query.comicId
      }
      this.isInit = true
      this.chapterList = []
      this.comicData = null
      this.page.pageNo = 1
      this.getComicById()
      this.getDataList(null, true)
      const liku = await this.godb.table('history').findAll(item => {
        return item.mediaId === this.comicId
      })
      this.historyList = liku.map(one => one.chapterId)
    },
    handleScroll() {
      const pageContentDom = document.getElementsByClassName('page-main')
      if (
        pageContentDom &&
        pageContentDom[0] &&
        pageContentDom[0].scrollTop > 50
      ) {
        this.showTabbg = true
      } else {
        this.showTabbg = false
      }
    },
    onBack() {
      this.$router.go(-1)
    },
    onShare() {
      this.$refs.ShareDialogRef.onShow()
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    handleDetailBannerFinish(data) {
      this.showDetailBanner = !!data.length
    },
    handleBannerFinish(data) {
      this.showBanner = !!data.length
    },
    onComment() {
      this.showComment = true
      this.$nextTick(() => {
        this.$refs.commentRef.onShowComment()
      })
    },
    handleAddComment() {
      this.$set(this.comicData, 'commentCount', this.comicData.commentCount + 1)
    },
    handleCloseComment() {},
    async getComicById() {
      const res = await comicById({
        comicId: this.comicId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      }).catch(() => {
        this.isInit = false
      })
      this.isInit = false
      if (res && res.code === 0) {
        this.comicData = res.data
      }
    },
    async onLike() {
      if (this.isLoading) {
        return null
      }
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const params = {
        mediaId: this.comicData.mediaId,
        favorType: this.comicData.mediaType,
      }
      this.isLoading = true
      const res = await favorAdd(params).catch(() => {
        this.isLoading = false
      })
      this.isLoading = false
      if (res && res.code === 0) {
        if (this.comicData.hasFavor) {
          this.$set(this.comicData, 'favorCount', this.comicData.favorCount - 1)
        } else {
          this.$set(this.comicData, 'favorCount', this.comicData.favorCount + 1)
        }
        this.$set(this.comicData, 'hasFavor', !this.comicData.hasFavor)
      }
    },
    onReward() {
      this.$refs.RewardDialogRef.onShow()
    },
    async onCollect() {
      if (this.comicData.hasCollect) {
        const res = await cancelCollectMedia({
          merchantAcct: this.comicData.merchantAcct,
          mediaType: this.comicData.mediaType,
          mediaId: this.comicData.mediaId,
        })
        if (res && res.code === 0) {
          this.$toast('取消成功')
          this.$set(this.comicData, 'hasCollect', !this.comicData.hasCollect)
        }
      } else {
        const res = await collectMedia({
          merchantAcct: this.comicData.merchantAcct,
          mediaType: this.comicData.mediaType,
          mediaId: this.comicData.mediaId,
        })
        if (res && res.code === 0) {
          this.$toast('收藏成功')
          this.$set(this.comicData, 'hasCollect', !this.comicData.hasCollect)
        }
      }
    },
    onPlay() {
      if (this.comicData.mediaType === 8) {
        this.$router.push({
          path: '/comicsPlay',
          query: {
            comicId: this.comicData.comicVo.comicId,
          },
        })
      } else if (this.comicData.mediaType === 9) {
        this.$router.push({
          path: '/cartoonPlay',
          query: {
            comicId: this.comicData.comicVo.comicId,
            payType: this.comicData.payType,
          },
        })
      } else if (this.comicData.mediaType === 10) {
        this.$router.push({
          path: '/fictionPlay',
          query: {
            comicId: this.comicData.comicVo.comicId,
          },
        })
      }
    },
    onLatest() {
      if (this.comicData.mediaType === 8) {
        this.$router.push({
          path: '/comicsPlay',
          query: {
            comicId: this.comicId,
            chapterId: this.comicData.comicVo.chapterCurrentId,
          },
        })
      } else if (this.comicData.mediaType === 9) {
        this.$router.push({
          path: '/cartoonPlay',
          query: {
            comicId: this.comicId,
            chapterId: this.comicData.comicVo.chapterCurrentId,
            payType: this.comicData.payType,
          },
        })
      } else if (this.comicData.mediaType === 10) {
        this.$router.push({
          path: '/fictionPlay',
          query: {
            comicId: this.comicId,
            chapterId: this.comicData.comicVo.chapterCurrentId,
          },
        })
      }
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
    },
    async getDataList(done, isRefresh) {
      this.loading = true
      const res = await pageChapterByComicId({
        ...this.page,
        comicId: this.comicId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      }).catch(() => {
        done && done()
        this.loading = false
      })
      done && done()
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
      this.getDataList(done, false)
    },
    onSearch(label) {
      this.$router.push({
        path: '/search',
        query: {
          label: label,
          mediaType: this.comicData.mediaType,
        },
      })
    },
    onCatalog() {
      this.$router.push({
        path: '/catalog',
        query: {
          label: this.comicData.comicVo.comicName,
          comicId: this.comicData.comicVo.comicId,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {
  background-color: rgba(0, 0, 0, 0.6);
  background-size: 100% auto;
  background-repeat: no-repeat;
  position: relative;
}

.page-container::after {
  content: '';
  display: inline-block;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.page-top {
  width: 100%;
  position: absolute;
  z-index: 99;
}

.page-main {
  padding: 44px 0 0;
  position: relative;
  z-index: 2;
  flex: 1;
  overflow: hidden;

  .page-content {
    flex: 1;
    overflow: auto;

    .comic-img {
      width: 100%;
      position: absolute;
      top: 0;
      z-index: -2;

      img {
        width: 100%;
        filter: blur(10px);
      }

      .comic-img-cover {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        background-color: rgba(0, 0, 0, 0.6);
      }
    }

    .banner-wraper {
      background: #fff;
    }

    .comic-info {
      padding: 16px;
      display: flex;
      align-items: flex-start;

      .comic-cover {
        width: 75px;
        height: 100px;
        background-position: top;
        background-size: 100% auto;
        background-repeat: no-repeat;
        border-radius: 6px;
      }

      .comic-data {
        width: calc(100% - 75px);
        padding-left: 16px;

        .comic-title {
          font-size: 15px;
          font-weight: bold;
          color: #fff;
        }

        .comic-chapterOver {
          font-size: 14px;
          color: #fff;
          margin: 8px 0;
        }

        .comic-author {
          font-size: 12px;
          color: #dddddd;
          margin: 8px 0;
        }
      }
    }

    .comic-content {
      padding: 16px;
      border-radius: 16px 16px 0 0;
      background: #fff;

      .comic-like {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #666666;

        > div {
          width: 20%;
          margin-right: 6.3%;

          > div {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 5px;

            img {
              width: 24px;
              height: 24px;
              margin-right: 5px;
            }
          }
        }

        > div:nth-child(3n) {
          > div {
            img {
              margin-right: 0;
            }
          }
        }

        > div:last-child {
          margin-right: 0;
        }
      }

      .comic-desc {
        background: #f5fdff;
        margin: 16px 0;
        padding: 9px;
        border-radius: 8px;
        font-size: 14px;

        .comic-desc-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 6px;
        }
      }

      .comic-tag {
        margin-top: 6px;

        .tag-item {
          display: inline-block;
          padding: 4px 6px;
          font-size: 12px;
          color: #109fff;
          border-radius: 2px;
          margin: 0 12px 0 0;
        }
      }

      .dire-area {
        margin-top: 12px;
        background: #109fff14;

        .latest {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 20px;

          .latest-left {
            width: 45px;
            height: 29px;
            line-height: 29px;
            text-align: center;
            border: 1px solid #109fff;
            box-sizing: border-box;
            color: #109fff;
            border-radius: 6px;
          }

          .latest-center {
            width: calc(100% - 74px);
            height: 29px;
            display: inline-flex;
            align-items: center;
            background: #109fff;
            border-radius: 6px;
            margin: 0 6px;
            padding: 0 8px;
            color: #fff;

            .icon-new {
              display: inline-block;
              width: 24px;
              height: 14px;
              background: url(../../assets/images/icon-new.png) center / 100%
                no-repeat;
              margin-right: 12px;
            }

            .latest-title {
              width: calc(100% - 24px);
              font-size: 14px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .latest-right {
            width: 29px;
            height: 29px;
            background: #109fff;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            justify-content: center;

            .van-icon {
              font-size: 20px;
              color: #fff;
            }
          }
        }

        .dire-list {
          padding: 4px;
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
            width: calc((100% - 4px) / 2);
            margin-bottom: 12px;
            margin-right: 4px;
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

          .view-list {
            width: 100%;
            height: 32px;
            line-height: 32px;
            text-align: center;
            background: #fff;
            border-radius: 6px;
            font-size: 13px;
            color: #999999;
          }
        }
      }
    }
  }

  .comic-bottom {
    width: 100%;
    padding: 8px 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: #fff;

    .btn {
      width: calc((100% - 16px) / 2);
      height: 32px;
      line-height: 32px;
      text-align: center;
      border-radius: 16px;
      box-sizing: border-box;
    }

    .btn-collect {
      color: #109fff;
      border: 1px solid #109fff;
      margin-right: 16px;
    }

    .btn-read {
      color: #fff;
      background: #109fff;
    }
  }
}

.popup-comtent {
  padding: 0 16px 16px;

  .popup-top {
    background: #fff;

    .popup-title {
      font-size: 15px;
      color: #333333;
      font-weight: bold;
      padding: 16px 0 12px;
    }

    .banner-wraper {
      padding: 0 0 12px;
    }
  }

  .chapter-list {
    .chapter-item {
      margin-bottom: 6px;

      .payType {
        display: inline-block;
        width: 32px;
        height: 18px;
        line-height: 18px;
        text-align: center;
        font-size: 10px;
        color: #fff;
        border-radius: 4px;
        margin-right: 4px;
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

      .chapter-name {
        line-height: 24px;
      }

      .chapter-name.read {
        color: #a9a9a9;
      }
    }
  }
}
</style>
