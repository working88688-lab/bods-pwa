<template>
    <div class="tag-list">
        <div class="leabel-box">
            <div>发现精彩</div>
            <div class="more" @click="onMore">查看更多 》</div>
        </div>
        <Loading v-if="init" />
        <van-pull-refresh v-else v-model="refresh" @refresh="onRefresh">
            <van-list
            v-if="list.length"
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            >
                <div class="tag-list">
                    <div class="tag-item" v-for="(item, i) in list" :key="i" @click="onSearch(item.tagName)">
                        <div class="t-name">{{ item.tagName }}</div>
                        <img v-lazy="imageBase + item.tagCoverImg" alt="" />
                    </div>
                </div>
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
import Loading from '@/components/Loading'

import { hotTag } from '@/apis/media'
export default {
    components: {
        Loading
    },
    props: {
      value: {
        type: String,
        default: '',
      },
    },
    computed: {
        dataDic() {
        return this.$store.state.dataDic
        },
        imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
    },
    data(){
      return {
        init: true,
        refresh: false,
        list: [],
        loading: false,
        finished: true,
      }  
    },
  methods: {
    onRefresh() {
      this.useData()
    },
    onSearch(name) {
        this.$router.push({
            path: '/tagSearchResult',
            query: {
                label: name,
            },
        })
    },
    onMore() {
        this.$router.push({
            path: '/tagDetails'
        })
    },
    async useData() { 
      try {
        const res = await hotTag({ mediaType: 1 })
            if (res && res.code === 0) {
                this.list = res.data.slice(0, 45)
            }
      } finally {
        this.init = false
        this.refresh = false
      }
    },
  },
  created() {
    this.useData()
  },
}
</script>
<style scoped lang="less">
.tag-list{
    .leabel-box{
        width: 100%;
        padding-left: 23px;
        background: url(../../../assets//images/camera-icon.png) no-repeat left / 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 15px 0;
        font-size: 18px;
        .more{
            font-size: 12px;
            color: #2a78f6;
        }
    }
    .tag-list{
        display: flex;
        flex-wrap: wrap;
        .tag-item{
            width: calc((100% - 16px) / 3);
            height: 78px;
            margin-right: 8px;
            margin-bottom: 8px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            border-radius: 4px;
            background: #222222;
            img{
                
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 4px;
            }
            .t-name{
                position: absolute;
                z-index: 1;
            }
            &:nth-of-type(3n){
                margin-right: 0px;
            }
        }
    }
}

</style>
