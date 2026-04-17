<template>
  <div class="page-container flex-container">
    <div class="page-header">
      <div class="left" @click="onBack">
        <van-icon name="arrow-left" />
      </div>
      <div class="header-title">
        {{ chapterData ? chapterData.chapterVo.chapterName : '' }}
      </div>
    </div>
    <Loading v-if="isInit" />
    <template v-else>
      <div class="page-content">
        <div class="empty-box" v-if="!chapterData">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="100"
            description="暂无内容"
          />
        </div>
        <div class="chapter-content" v-else>
          <template v-if="chapterData.preview">
            <div class="preview-box">
              <van-button round type="primary" @click="onShowFeeReminder"
                >立即购买</van-button
              >
            </div>
          </template>
          <template v-else>
            <img
              v-for="(img, idx) in chapterData.chapterImages"
              :key="idx"
              v-lazy="imageBase + img"
              alt=""
            />
          </template>
        </div>
      </div>
      <div class="page-bottom" v-if="chapterData">
        <div class="btn-box-left">
          <div class="btn btn-catalog" @click="onCatalog">目录</div>
        </div>
        <div class="btn-box-right">
          <div
            v-if="chapterData.chapterVo.preChapterId"
            class="btn btn-prev"
            @click="onPrev"
          >
            上一话
          </div>
          <div
            v-if="chapterData.chapterVo.nextChapterId"
            class="btn btn-next"
            @click="onNext"
          >
            下一话
          </div>
        </div>
      </div>
    </template>
    <FeeReminder
      ref="feeReminder"
      :videoInfo="chapterData"
      @onRefresh="handleRefresh"
    />
    <CatalogComponent ref="catalogComponentRef" />
  </div>
</template>

<script>
import Header from '@/components/Header'
import { chapterById, pageChapterByComicId } from '@/apis/comic'
import { viewAdd } from '@/apis/media'
import Loading from '@/components/Loading'
import axios from 'axios'
import FeeReminder from '../MoviePlayer/FeeReminder'
import CatalogComponent from '../../Work/components/CatalogComponent'

export default {
  name: 'ComicsPlay',
  components: {
    Header,
    Loading,
    FeeReminder,
    CatalogComponent,
  },
  watch: {
    $route: {
      handler(val) {
        if (val.path === '/comicsPlay') {
          const { comicId, chapterId } = val.query
          this.comicId = comicId
          this.chapterId = chapterId
          if (comicId && chapterId) {
            this.getChapterById(comicId, chapterId)
          } else if (comicId && !chapterId) {
            this.getComicById()
          }
        }
      },
    },
  },
  data() {
    return {
      isInit: true,
      comicId: null,
      chapterId: null,
      chapterData: null,
    }
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
  },
  created() {
    this.getComicById()
  },
  mounted() {},
  activated() {},
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    async getComicById() {
      if (!this.$route.query.comicId) {
        this.isInit = false
        return this.$toast('获取章节信息失败')
      } else {
        this.comicId = this.$route.query.comicId
      }
      this.isInit = true
      this.chapterData = null
      if (this.$route.query.chapterId) {
        this.getChapterById(this.comicId, this.$route.query.chapterId)
      } else {
        const res = await pageChapterByComicId({
          pageNo: 1,
          pageSize: 1,
          comicId: this.comicId,
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        }).catch(() => {
          this.isInit = false
        })
        this.isInit = false
        if (res && res.code === 0) {
          const firstChapter = res.data.dataList[0]
          if (firstChapter) {
            this.getChapterById(this.comicId, firstChapter.chapterId)
          } else {
            return this.$toast('获取章节信息失败')
          }
        } else {
          return this.$toast('获取章节信息失败')
        }
      }
    },
    async getChapterById(comicId, chapterId) {
      this.isInit = true
      const res = await chapterById({
        comicId,
        chapterId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      }).catch(() => {
        this.isInit = false
        return this.$toast('获取章节信息失败')
      })
      if (res && res.code === 0) {
        this.chapterData = res.data
        if (this.chapterData.preview) {
          this.isInit = false
          this.onShowFeeReminder()
        } else {
          this.chapterData['chapterImages'] = []
          const contentRes = await axios
            .get(this.imageBase + this.chapterData.chapterVo.chapterContent)
            .catch(() => {
              this.isInit = false
            })
          this.isInit = false
          if (contentRes && contentRes.status === 200) {
            this.chapterData.chapterImages = contentRes.data.split(',')
            if (!this.chapterData.preview) {
              viewAdd({
                mediaId: comicId,
                mediaType: 8,
              })
              this.godb.table('history').add({
                mediaId: comicId,
                chapterId: chapterId,
              })
            }
          }
        }
      } else {
        this.isInit = false
        return this.$toast('获取章节信息失败')
      }
    },
    onShowFeeReminder() {
      this.$refs.feeReminder.onShow()
    },
    handleRefresh() {
      this.getComicById()
    },
    onCatalog() {
      this.$refs.catalogComponentRef.onShow()
    },
    onPrev() {
      this.$router.replace({
        path: '/comicsPlay',
        query: {
          comicId: this.comicId,
          chapterId: this.chapterData.chapterVo.preChapterId,
        },
      })
    },
    onNext() {
      this.$router.replace({
        path: '/comicsPlay',
        query: {
          comicId: this.comicId,
          chapterId: this.chapterData.chapterVo.nextChapterId,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {
  background: #f6f6f6;
  color: #333333;
  .page-header,
  .page-bottom {
    background: #f6f6f6;
    color: #333333;
  }
}
.page-container.black {
  background: #1d1d28;
  color: #fff;
  .page-header,
  .page-bottom {
    background: #1d1d28;
    color: #fff;
  }
}
.page-header {
  display: flex;
  align-items: center;
  .left {
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    i {
      font-size: 24px;
    }
  }
  .right {
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    .icon-share {
      display: inline-block;
      width: 24px;
      height: 24px;
      background: url(../../../assets/images/share.png) center / 100% no-repeat;
    }
  }
  .header-title {
    width: calc((100% - 88px));
    height: 44px;
    line-height: 44px;
    text-align: center;
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.page-content {
  flex: 1;
  overflow: auto;
  padding: 0 0 44px;
  .chapter-content {
    padding: 12px;
    img {
      width: 100%;
      display: block;
    }
    .preview-box {
      text-align: center;
      margin: 24px 0;
    }
  }
}
.page-bottom {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12px 16px;
  background: #fff;
  .btn {
    width: 80px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    border-radius: 6px;
    font-size: 12px;
    box-sizing: border-box;
  }
  .btn-box-left {
    width: 60px;
    .btn-catalog {
      width: 60px;
      color: #109fff;
      border: 1px solid #109fff;
    }
  }
  .btn-box-right {
    width: calc(100% - 60px);
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    .btn-prev {
      color: #109fff;
      border: 1px solid #109fff;
    }
    .btn-next {
      color: #fff;
      background: #109fff;
      margin-left: 24px;
    }
  }
}
</style>
