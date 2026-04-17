<template>
    <van-popup v-if="visible" v-model="visible" class="comment-box" :get-container="getContainer" position="bottom"
        :lock-scroll="true" @close="close">
        <van-cell-group :border="false" class="bottom-btn">
            <van-field ref="contInput" v-model="formData.content" name="comment" :placeholder="placeholderText">
                <template slot="extra">
                    <van-button class="comment-btn" size="small" :loading="isLoading" @click="onSubmit">发送</van-button>
                </template>
            </van-field>
        </van-cell-group>
    </van-popup>
</template>
  
<script>
import { commentAdd } from '@/apis/media'
import { formatStrNum } from '@/utils/tools'
import Loading from '@/components/Loading'

export default {
    name: 'CommentPopup',
    props: {
        videoInfo: {
            type: Object,
            default: () => {
                return {}
            },
        }
    },
    components: { Loading },
    data() {
        return {
            visible: false,
            formData: {
                content: '',
                parentId: '',
                rootCommentId: '',
            },
            isLoading: false,
            placeholderText: '自古评论出人才，说点好听的~',
            rowData: null
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
    },
    created() { },
    mounted() { },
    methods: {
        getContainer() {
            return document.getElementById('app')
        },
        onShowComment({ rowData, placeholder }) {
            this.rowData = rowData
            this.placeholderText = placeholder
            this.visible = true
        },
        close() {
            this.visible = false
        },
        async onSubmit() {
            if (!this.formData.content) {
                return this.$toast('请先填写评论内容')
            }
            if (!this.userInfo) {
                await this.$store.dispatch('macLogin')
            }
            const { content } = this.formData
            const { parentId = '', rootCommentId = '', } = this.rowData
            const params = {
                content,
                mediaId: this.videoInfo.mediaId,
                commentType: this.videoInfo.mediaType,
                parentId,
                rootCommentId,
            }
            this.isLoading = true
            const res = await commentAdd(params).catch(() => {
                this.isLoading = false
            })
            this.isLoading = false
            if (res && res.code === 0) {
                this.handleSuccess()
            }
        },
        handleSuccess() {
            this.formData.content = ''
            this.$toast('评论成功，请等待审核通过')
            this.close()
        },
        formatNum(num) {
            return formatStrNum(num)
        },
        handleChildComment(data) {
            this.showChildComment = data
        },
    },
}
</script>
  
<style lang="less" scoped>
.comment-box {
    height: 60px;
    background: #fff;
    color: #000;
}

::v-deep .van-cell {
    padding: 9px 12px;

    .van-cell__value {
        border-radius: 24px;
        height: 42px;
        line-height: 42px;
        font-size: 15px;
        padding: 0 15.5px;
        background: #f6f6f6;

        .van-field__body {
            input {
                color: rgb(155 159 163);
                caret-color: rgb(155 159 163) !important;
            }
        }
    }

    .comment-btn {
        // width: 72px;
        height: 42px;
        line-height: 42px;
        font-size: 15px;
        background: transparent;
        border: none;
        color: #000;
    }
}

.bottom-btn {
    height: 60px;
}
</style>
