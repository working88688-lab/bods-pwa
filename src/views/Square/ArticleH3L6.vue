<template>
    <swiper ref="ArticleSwiper" class="article-swiper" :options="swiperOptions">
        <swiper-slide v-for="(aList, idx) in dataList" :key="idx" class="article-list">
            <div class="article-item" v-for="(article, m) in aList" :key="m" @click="onDetail(article, idx, m)">
                <div class="article-img">
                    <img v-lazy="(imageBase + article.article.articleCoverImg)">
                </div>
                <div class="article-content">
                    <div class="article-title">{{ article.article.articleTitle }}</div>
                    <div class="tag-list" v-if="(article.tagList && article.tagList.length)">
                        <div class="tag-item">#{{ article.tagList[0].tagName }}</div>
                    </div>
                    <div class="user-info" v-if="article.userInfoPo">
                        <div class="avatar" :class="article.userInfoPo.vipFlag ? 'avatar-vip' : ''">
                            <img v-lazy="imageBase + article.userInfoPo.headUrl" />
                        </div>
                        <div class="user-name">{{ article.userInfoPo.nickName }}</div>
                    </div>
                </div>
            </div>
        </swiper-slide>
    </swiper>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import _ from 'lodash'
import { Dialog } from 'vant'
import { purchase } from '@/apis/media'

export default {
    name: 'ArticleH3L6',
    components: {
        Swiper,
        SwiperSlide
    },
    props: {
        articleList: {
            type: Array,
            default: () => {
                return []
            }
        }
    },
    data() {
        return {
            swiperOptions: {
                slidesPerView: 1.2,
                spaceBetween: 30,
            },
            dataList: [],
            activeIndex: 0
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        }
    },
    created() {
        this.dataList = _.chunk(this.articleList, 3)
    },
    mounted() {},
    methods: {
        async onDetail(data, idx, m) {
            if (!this.userInfo) {
                await this.$store.dispatch('macLogin')
            }
            if (data.preview) {
                if (data.payType === 2) {
                    if (this.userInfo.coinBalance < data.goldPayUnit) {
                        return Dialog.confirm({
                            title: '提示',
                            message: `充值金币查看完整内容`,
                            className: 'confirm-dialog'
                        }).then(async () => {
                            this.$router.push('/recharge')
                        }).catch(() => {})
                    } else {
                        return Dialog.confirm({
                            title: '提示',
                            message: `是否花费${data.goldPayUnit}金币购买完整内容？`,
                            className: 'confirm-dialog'
                        }).then(async () => {
                            const params = {
                                mediaId: data.mediaId,
                                mediaType: data.mediaType
                            }
                            const res = await purchase(params)
                            if (res && res.code === 0) {
                                const userData = Object.assign({}, this.userInfo)
                                userData.coinBalance = userData.coinBalance - data.goldPayUnit
                                this.$store.commit('SET_USERINFO', userData)
                                const targetData = Object.assign({}, data)
                                targetData.preview = false
                                const targetList = this.dataList[idx]
                                targetList[m] = targetData
                                this.$set(this.dataList, idx, targetList)
                                this.$router.push({
                                    path: '/detail',
                                    query: {
                                        mediaId: data.mediaId
                                    }
                                })
                            }
                        }).catch(() => {})
                    }
                } else if (data.payType === 3) {
                    return Dialog.confirm({
                        title: '提示',
                        message: `需要Lv${data.userLevel}才能查看，是否立即提升等级？`,
                        className: 'confirm-dialog'
                    }).then(async () => {
                        this.$router.push('/vip')
                    }).catch(() => {})
                } else if (data.payType === 4) {
                    return Dialog.confirm({
                        title: '提示',
                        message: `开通VIP解锁完整内容`,
                        className: 'confirm-dialog'
                    }).then(async () => {
                        this.$router.push('/vip')
                    }).catch(() => {})
                }
            }
            this.$router.push({
                path: '/detail',
                query: {
                    mediaId: data.mediaId
                }
            })
        }
    }
};
</script>

<style lang="less" scoped>
.article-list {
    .article-item {
        display: flex;
        margin-bottom: 12px;
        .article-img {
            img {
                width: 70px;
                height: 70px;
                border-radius: 8px;
                overflow: hidden;
                margin-right: 6px;
                object-fit: cover;
            }
        }
        .article-content {
            width: calc(100% - 76px);
            .article-title {
                width: 100%;
                font-size: 14px;
                color: #222222;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .tag-list {
                display: flex;
                flex-wrap: wrap;
                margin: 10px 0;
                .tag-item {
                    padding: 3px 10px;
                    font-size: 12px;
                    color: #d92514;
                    border-radius: 12px;
                    margin: 0 12px 0 0;
                    background: #ffeff4;
                }
            }
            .user-info {
                display: inline-flex;
                .avatar {
                    position: relative;
                    img {
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        overflow: hidden;
                    }
                }
                .avatar-vip::after {
                    content: '';
                    width: 6px;
                    height: 6px;
                    background: url(../../assets/images/vip_flag.png) no-repeat top center / 100%;
                    position: absolute;
                    right: 0;
                    bottom: 0;
                }
                .user-name {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 14px;
                }
            }
        }
    }
}
</style>