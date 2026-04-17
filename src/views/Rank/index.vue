<template>
  <div class="rank fixed-page">
    <Header textColor="#fff" title="排行榜" @onClickLeft="onBack" />
    <Loading v-if="init" />
    <van-pull-refresh v-else v-model="refresh" @refresh="onRefresh">
      <van-list
        v-if="list.length"
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <Item
          v-for="(item, index) in list"
          :key="item.mediaId"
          :data="item"
          :index="index + 1"
          @click="handleclick"
        />
      </van-list>
      <div class="empty-box" v-else>
        <van-empty
          :image="require('@/assets/images/emptyImage.png')"
          image-size="100"
          description="暂无内容"
        />
      </div>
    </van-pull-refresh>
  </div>
</template>

<script>
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { listMediaBySearchType } from "@/apis/media";
import Item from "./components/item.vue";

export default {
  components: { Header, Loading, Item },
  data() {
    return {
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      init: true,
      list: [],
      loading: false,
      refresh: false,
      finished: false,
      scrollTop: 0,
    };
  },
  methods: {
    onBack() {
      this.$router.go(-1);
    },
    handleclick(e) {
      this.$router.push({
        path: "/play",
        query: {
          videoId: e.mediaId,
          categoryId: e.categoryId,
          payType: e.payType,
        },
      });
    },
    async useData() {
      try {
        const res = await listMediaBySearchType({
          mediaType: 1,
          orderType: "SORT_VIEW",
          publishStatus: 1,
          ...this.page,
        });
        if (res.code === 0) {
          if (this.refresh) {
            this.list = res.data.dataList;
          } else {
            this.list = this.list.concat(res.data.dataList);
          }
          this.finished =
            this.page.pageNo * this.page.pageSize >= res.data.total || this.page.pageNo === 2
        }
      } catch (error) {
        throw error;
      } finally {
        this.init && (this.init = false);
        this.refresh && (this.refresh = false);
        this.loading && (this.loading = false);
      }
    },
    onLoad() {
      this.page.pageNo++;
      this.useData();
    },
    onRefresh() {
      this.page.pageNo = 1;
      this.finished = false;
      this.useData();
    },
  },
  created() {
    this.useData();
  },
};
</script>

<style scoped lang="less">
.rank {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: url(../../assets/images/rank_bg.png) top / 100% no-repeat #fff;
  ::v-deep .van-pull-refresh {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
