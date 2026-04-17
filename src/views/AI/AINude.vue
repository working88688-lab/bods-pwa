<template>
    <div class="page-content flex-container">
        <Loading v-if="isInit" />
        <template v-else>
            <div class="operate-area">
                <div class="photo" v-if="photo" @click="onRoute('/vip')">
                    有{{ photo }}个照片在队列中，充值会员提前处理
                    <span>充值</span>
                </div>
                <van-uploader v-model="fileList" accept="image/*" :max-count="1" :after-read="afterRead" @delete="deleteAIImg">
                    <div class="default-image"  slot="default">
                        <div>
                            <van-icon name="photo-o" />
                            <div>上传图片</div>
                        </div>
                    </div>
                </van-uploader>
                <div class="note">
                    <div>注意事项：</div>
                    <div>1. 照片只含有一名人物</div>
                    <div>2. 图片不能过暗</div>
                    <div>3. 照片应尽量清晰</div>
                    <div>4. 不支持多人图片禁止未成年人图片</div>
                    <div>5. 上传图片需间隔{{ dataDic.aiupload_time || 60 }}s</div>
                </div>
                <div class="banner-wraper" v-if="showBanner">
                    <div class="banner-title">效果示例图</div>
                    <Banner location="example_view" @onFinish="handleBannerFinish"/>
                </div>
            </div>
            <div class="btn-box">
                <div class="billing">
                    <div>消耗金币：{{ dataDic.upload_price }}</div>
                    <div>免费次数：{{ freeTimes }}</div>
                </div>
                <van-button round block type="primary" @click="onSubmit">生成</van-button>
            </div>
        </template>
    </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getUserAiFreeTimes, uploadImg, submitAiPicture } from '@/apis/ai'
import { Dialog } from 'vant'
import Banner from '@/components/Banner'

export default {
    name: 'AI',
    components: {
        Header,
        Loading,
        Banner
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        dataDic() {
            return this.$store.state.dataDic
        }
    },
    data() {
        return {
            isInit: true,
            photo: 0,
            freeTimes: 0,
            coin: 0,
            aiImg: null,
            fileList: [],
            showBanner: true
        }
    },
    created() {
        this.getFreeTimes()
    },
    mounted() {},
    activated() {},
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        handleBannerFinish(data) {
            this.showBanner = !!data.length
        },
        async getFreeTimes() {
            const res = await getUserAiFreeTimes({}).catch(() => {
                this.isInit = false
            })
            this.isInit = false
            if (res && res.code === 0) {
                const { coin, freeTimes, photo } = res.data
                this.freeTimes = freeTimes
                this.coin = coin
                this.photo = photo
            }
        },
        onRoute(path) {
            this.$router.push(path)
        },
        async afterRead(file) {
            const fileType = file.file.type
            if (fileType.indexOf('image') === -1) {
                return this.$toast('请选择图片上传')
            }
            file.status = 'uploading';
            file.message = '上传中...';
            const formData = new FormData()
            formData.append('file', file.file)
            const res = await uploadImg(formData).catch(() => {
                file.status = 'failed';
                file.message = '上传失败';
            })
            if(res && res.code === 0) {
                file.status = 'done';
                file.message = '上传成功';
                this.aiImg = res.data
            } else {
                file.status = 'failed';
                file.message = '上传失败';
            }
        },
        deleteAIImg() {
            this.aiImg = null
        },
        onSubmit() {
            if (!this.aiImg) {
                return this.$toast('请先上传图片')
            }
            if (this.freeTimes === 0) {
                if (this.userInfo.coinBalance < this.coin) {
                    return Dialog.confirm({
                        title: '提示',
                        message: `金币余额不足，是否立即充值`,
                    }).then(async () => {
                        this.onRoute('/wallet?type=coin')
                    }).catch(() => {})
                } else {
                    return Dialog.confirm({
                        title: '提示',
                        message: `是否花费${this.coin}金币提交照片处理？`,
                    }).then(async () => {
                        this.handleSubmit()
                    }).catch(() => {})
                }
            } else {
                return Dialog.confirm({
                    title: '提示',
                    message: `当前有${this.freeTimes}次免费机会，是否提交照片体验？`,
                }).then(async () => {
                    this.handleSubmit()
                }).catch(() => {})
            }
        },
        async handleSubmit() {
            const res = await submitAiPicture({
                uploadImg: this.aiImg
            })
            if (res && res.code === 0) {
                if (this.freeTimes) {
                    this.freeTimes--
                } else {
                    const userData = Object.assign({}, this.userInfo)
                    userData.coinBalance = userData.coinBalance - this.coin
                    this.$store.commit('SET_USERINFO', userData)
                }
                this.aiImg = null
                this.fileList = []
                Dialog.alert({
                    title: '提示',
                    message: `提交成功，请到生成记录中查看和下载`,
                }).then(async () => {
                    
                }).catch(() => {})
            }
        }
    }
};
</script>

<style lang="less" scoped>
.page-content {
    text-align: center;
    .operate-area {
        padding: 16px;
        flex: 1;
        overflow: auto;
        .photo {
            font-size: 12px;
            color: var(--theme-color);
            margin-bottom: 12px;
            background: #fff;   
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            span {
                padding: 4px 16px;
                background: var(--theme-color);
                border-radius: 12px;
                white-space: nowrap;
                color: #fff;
            }
        }
        .note {
            margin-top: 16px;
            width: 100%;
            text-align: left;
            font-size: 14px;
            color: #a3a3a3;
            >div {
                margin: 0 0 5px;
            }
            >div:first-child {
                color: var(--theme-color);
                font-weight: bold;
            }
            img {
                width: 100%;
                margin-top: 12px;
            }
        }
        .banner-wraper {
            padding: 16px 0 0;
            .banner-title {
                text-align: left;
                color: var(--theme-color);
                font-weight: bold;
                margin: 0 0 5px;
            }
        }
        .banner-swiper{
            padding: 0;
        }
    }
    .btn-box {
        height: 55px;
        display: flex;
        align-items: center;
        background: #fff;
        padding: 12px;
        .billing {
            flex: 1;
            display: inline-flex;
            align-items: center;
            >div {
                margin-right: 12px;
            }
        }
        button {
            width: 120px;
        }
    }
}
::v-deep .van-uploader {
    width: 100%;
    height: 200px;
    background: #fff;
    border: 1px dashed var(--theme-color);
    border-radius: 6px;
    .van-uploader__wrapper,
    .van-uploader__input-wrapper,
    .default-image {
        width: 100%;
        height: 100%;
    }
    .default-image {
        color: var(--theme-color);
        display: flex;
        align-items: center;
        justify-content: center;
        i {
            font-size: 36px;
        }
    }
    .van-uploader__preview {
        width: 100%;
        height: 100%;
        margin: 0;
        .van-uploader__preview-image {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
