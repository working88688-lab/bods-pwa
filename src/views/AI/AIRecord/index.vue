<template>
    <div class="page-container flex-container ai-record">
        <Header title="生成记录" textColor="#222222" @onClickLeft="onBack" />
        <van-tabs
            v-if="tabList.length > 1"
            v-model="activeTab"
            background="none"
            :ellipsis=false
            class="tab-type"
            @change="onChangeTab">
            <van-tab v-for="(tab, idx) in tabList" :key="idx" :title="tab.label" :name="tab.value"></van-tab>
        </van-tabs>
        <AINudeRecord v-if="activeTab === 1" />
        <AIFaceVideoRecord v-if="activeTab === 2" />
        <AIFaceImgRecord v-if="activeTab === 3" />
    </div>
</template>

<script>
import Header from '@/components/Header'
import AINudeRecord from './AINudeRecord'
import AIFaceImgRecord from './AIFaceImgRecord'
import AIFaceVideoRecord from './AIFaceVideoRecord'

export default {
    name: 'aiRecord',
    components: {
        Header,
        AINudeRecord,
        AIFaceImgRecord,
        AIFaceVideoRecord
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        isApp() {
            return this.$store.state.isApp
        }
    },
    data() {
        return {
            activeTab: 1,
            tabList: [
                { label: 'AI脱衣', value: 1 },
                { label: 'AI视频换脸', value: 2 },
                { label: 'AI图片换脸', value: 3 }
            ],
        }
    },
    created() {
        this.onChangeTab()
    },
    mounted() {},
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        onChangeTab() { }
    }
};
</script>

<style lang="less" scoped>
.ai-record {
    position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../../assets/images/top_bg.png) top / 100% no-repeat
    transparent;
  padding-top: calc(var(--safe-area-top));
}

::v-deep .van-tabs {
    .van-tabs__wrap {
        .van-tabs__nav {
            display: inline-flex;
            .van-tab {
                padding-bottom: 0;
                background: #ffffff1a;
                margin-left: 12px;
                font-size: 14px;
            }
            .van-tab--active {
                font-weight: bold;
            }
            .van-tab:first-child {
                margin-left: 0;
            }
            .van-tabs__line {
                display: none;
            }
        }
    }
}
.page-container {
    overflow: hidden;
}
.page-content {
    padding: 16px 0 16px;
    text-align: center;
    .data-row {
        padding: 16px;
        .data-item {
            font-size: 14px;
            text-align: left;
            margin-bottom: 16px;
            .data-time {
                color: #d5d5d5;
                margin-bottom: 10px;
            }
            .data-cont {
                display: flex;
                align-items: center;
                color: #d5d5d5;
                .data-img-row {
                    width: 80px;
                    height: 80px;
                    margin-right: 16px;
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }
                .data-img {
                    width: 170px;
                    height: 80px;
                    margin-right: 10px;
                    img {
                        display: inline-block;
                        width: 80px;
                        height: 80px;
                        object-fit: cover;
                        margin-right: 10px;
                    }
                    img:nth-child(2) {
                        margin-right: 0;
                    }
                }
                .btn-download,
                .btn-delete {
                    color: #ff3271;
                    border: 1px solid #ff3271;
                    font-size: 12px;
                    padding: 4px 16px;
                    border-radius: 5px;
                }
                .btn-download {
                    margin-right: 5px;
                }
                .info-5-box{
                    display: flex;
                    flex-direction: column;
                    .info-5{
                        margin-bottom: 4px;
                    }
                }
            }
        }
    }
}
.van-pull-refresh {
    min-height: 50vh;
}
</style>
