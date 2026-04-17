<template>
    <div class="page-container flex-container">
        <Header color="#fff" textColor="#222222" title="自定义模板" @onClickLeft="onBack" />
        <div class="page-content">
            <Loading v-if="isInit" />
            <template v-else>
                <div class="section">
                    <div class="section-title">上传模板</div>
                    <van-uploader v-model="fileList1" accept="image/*" image-fit="contain" :max-count="1" :before-read="beforeRead"
                        :after-read="afterRead1" @delete="deleteTemplate">
                        <div class="default-image" slot="default">
                            <div>
                                <van-icon name="photo-o" />
                                <div>图片大小不超过{{ dataDic.ai_size || 2 }}Mb</div>
                            </div>
                        </div>
                    </van-uploader>
                </div>
                <div class="note">
                    <div>注意事项：</div>
                    <div>1. 选择一张人脸清晰，不得有任何遮挡的照片上传（注意：只含一个人物和脸部，图片不能过暗）</div>
                    <div>2. 选择一个心仪的视频或图片模板，点击生成，生成时间需要3-5分钟，耐心等待。（图片模板可自行上传）</div>
                    <div>3. 在右上角记录查看生成进度，生成成功后可以点击进行下载，也可以在线观看。</div>
                    <div>4. 按照上方操作，有问题随时联系在线客服进行处理。</div>
                    <div>5. 不支持多人图片，禁止未成年人图片</div>
                </div>
                <div class="section">
                    <div class="section-title">上传脸部信息</div>
                    <van-uploader v-model="fileList2" accept="image/*" image-fit="contain" :max-count="1" :before-read="beforeRead"
                        :after-read="afterRead2" @delete="deleteAIImg">
                        <div class="default-image" slot="default">
                            <div>
                                <div>示例图</div>
                                <img src="@/assets/images/sample-graph.png" alt="">
                                <div>
                                    <van-icon name="add-o" />
                                    <span>点击上传</span>
                                </div>
                            </div>
                        </div>
                    </van-uploader>
                </div>
            </template>
        </div>
        <div class="btn-box">
            <div class="billing">
                <div>消耗金币：{{ dataDic.upload_price }}</div>
                <div>免费次数：{{ freeTimes }}</div>
            </div>
            <van-button round block type="primary" @click="onSubmit">生成</van-button>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getAiPicFreeTimes, uploadAiContentImg, uploadAiFaceImg, submitAiFacePicture } from '@/apis/ai'
import { centerUserInfo } from '@/apis/user'
import { Dialog } from 'vant'

export default {
    name: 'AI',
    components: {
        Header,
        Loading,
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
            freeTimes: 0,
            aiImg: null,
            fileList1: [],
            fileList2: [],
            templateImg: null,
            aiType: 1
        }
    },
    created() {},
    mounted() {},
    activated() {
        this.getUserInfo()
        this.getFreeTimes()
    },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        onRoute(path) {
            this.$router.push(path)
        },
        onPreview() {
            ImagePreview({
                images: [this.imageBase + this.templateImg],
                startPosition: 0
            })
        },
        async getFreeTimes() {
            const res = await getAiPicFreeTimes({ aiType: this.aiType }).catch(() => {
                this.isInit = false
            })
            this.isInit = false
            if (res && res.code === 0) {
                const { freeTime } = res.data
                this.freeTimes = freeTime || 0
            }
        },
        async getUserInfo() {
            const res = await centerUserInfo()
            if (res && res.code === 0) {
                this.$store.commit('SET_USERINFO', res.data)
            }
        },
        beforeRead(file) {
            if (!this.freeTimes && this.userInfo.coinBalance < this.dataDic.upload_price) {
                Dialog.confirm({
                    title: '提示',
                    message: `金币余额不足，是否立即充值`,
                    className: 'confirm-dialog',
                }).then(async () => {
                    this.onRoute('/wallet?type=coin')
                }).catch(() => { })
                return false
            }
            if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
                this.$toast('请上传 jpg / png 格式图片')
                return false
            }
            const maxSize = this.dataDic.ai_size ? this.dataDic.ai_size : 2
            if (file.size > maxSize * 1024 * 1024) {
                this.$toast(`图片最大为${maxSize}Mb`)
                return false
            }
            return true
        },
        async afterRead1(file) {
            const fileType = file.file.type
            if (fileType.indexOf('image') === -1) {
                return this.$toast('请选择图片上传')
            }
            file.status = 'uploading';
            file.message = '上传中...';
            const formData = new FormData()
            formData.append('file', file.file)
            formData.append('aiType', this.aiType)
            const res = await uploadAiContentImg(formData).catch(() => {
                file.status = 'failed';
                file.message = '上传失败';
            })
            if (res && res.code === 0) {
                file.status = 'done';
                file.message = '上传成功';
                this.templateImg = res.data
            } else {
                file.status = 'failed';
                file.message = '上传失败';
            }
        },
        deleteTemplate() {
            this.templateImg = null
        },
        async afterRead2(file) {
            const fileType = file.file.type
            if (fileType.indexOf('image') === -1) {
                return this.$toast('请选择图片上传')
            }
            file.status = 'uploading';
            file.message = '上传中...';
            const formData = new FormData()
            formData.append('file', file.file)
            formData.append('aiType', this.aiType)
            formData.append('confCode', '')
            const res = await uploadAiFaceImg(formData).catch(() => {
                file.status = 'failed';
                file.message = '上传失败';
            })
            if (res && res.code === 0) {
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
            if (!this.userInfo) {
                return this.onLogin()
            }
            if (!this.templateImg) {
                return this.$toast('请先上传模板')
            }
            if (!this.aiImg) {
                return this.$toast('请先上传脸部信息')
            }
            if (this.freeTimes === 0) {
                if (this.userInfo.coinBalance < this.dataDic.upload_price) {
                    return Dialog.confirm({
                        title: '提示',
                        message: `金币余额不足，是否立即充值`,
                        className: 'confirm-dialog',
                    }).then(async () => {
                        this.onRoute('/wallet?type=coin')
                    }).catch(() => { })
                } else {
                    return Dialog.confirm({
                        title: '提示',
                        message: `是否花费${this.dataDic.upload_price}金币提交照片处理？`,
                        className: 'confirm-dialog',
                    }).then(async () => {
                        this.handleSubmit()
                    }).catch(() => { })
                }
            } else {
                return Dialog.confirm({
                    title: '提示',
                    message: `当前有${this.freeTimes}次免费机会，是否提交照片体验？`,
                    className: 'confirm-dialog',
                }).then(async () => {
                    this.handleSubmit()
                }).catch(() => { })
            }
        },
        async handleSubmit() {
            const params = {
                userFaceImg: this.aiImg,
                userContentImg: this.templateImg,
                aiType: this.aiType,
                faceConfCode: ''
            }
            const res = await submitAiFacePicture(params)
            if (res && res.code === 0) {
                if (this.freeTimes) {
                    this.freeTimes--
                } else {
                    const userData = Object.assign({}, this.userInfo)
                    userData.coinBalance = userData.coinBalance - this.dataDic.upload_price
                    this.$store.commit('SET_USERINFO', userData)
                }
                this.aiImg = null
                this.fileList2 = []
                Dialog.alert({
                    title: '提示',
                    message: `提交成功，请到生成记录中查看和下载`
                }).then(async () => {}).catch(() => { })
            }
        },
    }
};
</script>

<style lang="less" scoped>
.page-container {
    background: #fafafa;
}
.page-content {
    flex: 1;
    overflow: auto;
    text-align: center;
    .section {
        padding: 0 16px 16px;
        text-align: center;
        .section-title {
            text-align: left;
            font-size: 16px;
            padding: 12px 0;
            font-weight: bold;
        }
    }
    .note {
        width: 100%;
        padding: 0 16px 12px;
        text-align: left;
        font-size: 14px;
        color: #a3a3a3;

        >div {
            margin: 6px 0;
        }
        >div:first-child {
            color: #ff3271;
        }
        .img-list {
            display: flex;
            align-items: center;
            justify-content: space-around;
            .img-item {
                width: 76px;
                img {
                    width: 100%;
                    margin-bottom: 6px;
                }
            }
        }
    }

    .operate {
        padding: 0 6px;
    }
}
::v-deep .van-uploader {
    width: 330px;
    height: 200px;
    background: #fff;
    border: 1px dashed #ff3271;
    .van-uploader__wrapper,
    .van-uploader__input-wrapper,
    .default-image {
        width: 100%;
        height: 100%;
    }
    .default-image {
        color: #ff3271;
        display: flex;
        align-items: center;
        justify-content: center;
        >div {
            >div:first-child {
                font-size: 12px;
                color: rgb(153 153 153);
            }
            img {
                width: 100px;
                height: 100px;
                margin: 5px 0;
            }
            >div:last-child {
                font-size: 12px;
                color: #ff3271;
                display: flex;
                align-items: center;
                justify-content: center;
                i {
                    font-size: 16px;
                    margin-right: 3px;
                }
            }
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
.btn-box {
    width: 100%;
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
</style>
