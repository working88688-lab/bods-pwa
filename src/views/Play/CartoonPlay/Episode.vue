<template>
  <div class="episode-list" v-if="chapterList.length">
    <div
      class="episode-item"
      :class="{ actived: activedTab === chapter.value }"
      v-for="(chapter, idx) in chapterList"
      :key="idx"
      @click="onChapter(chapter)"
    >
      {{ chapter.label }}
    </div>
  </div>
</template>

<script>
import { pageChapterByComicId } from '@/apis/comic'

export default {
  name: 'Episode',
  props: {
    comicData: {
      type: Object,
      default: () => {
        return null
      },
    },
    chapterData: {
      type: Object,
      default: () => {
        return null
      },
    },
  },
  data() {
    return {
      activedTab: null,
      chapterList: [],
    }
  },
  created() {
    this.activedTab = this.chapterData.chapterVo.chapterId
    this.getDataList()
  },
  methods: {
    async getDataList() {
      const res = await pageChapterByComicId({
        pageNo: 1,
        pageSize: 999,
        comicId: this.comicData.comicVo.comicId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      })
      if (res && res.code === 0) {
        this.chapterList = res.data.dataList.map(one => {
          return {
            label:
              one.chapterSeq > 9
                ? one.chapterSeq.toString()
                : '0' + one.chapterSeq,
            value: one.chapterId,
            payType: one.payType,
          }
        })
      }
    },
    onChapter(chapter) {
      this.$router.replace({
        path: '/cartoonPlay',
        query: {
          comicId: this.comicData.comicVo.comicId,
          chapterId: chapter.value,
          payType: chapter.payType,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.episode-list {
  display: flex;
  overflow: auto;
  align-items: center;
  margin: 12px 0;
  .episode-item {
    border: 1px solid #109fff;
    color: #109fff;
    padding: 5px 10px;
    margin-right: 12px;
    border-radius: 5px;
  }
  .actived {
    background: #109fff;
    color: #fff;
  }
  .episode-item:last-child {
    margin-right: 0;
  }
}
</style>
