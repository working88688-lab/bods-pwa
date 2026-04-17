<template>
    <van-popup v-model="showComment" class="comment-popup" position="bottom" :get-container="getContainer" :lock-scroll="true" @close="onCloseComment($event)">
        <div class="comment-header">
            <div class="comment-title">评论（{{ total }}）</div>
            <span class="close-btn" @click="onCloseComment($event)">
                <van-icon name="close" />
            </span>
        </div>
        <CommentBox ref="commentBoxRef" :videoInfo="videoInfo" @totle="handleTotle" @addComment="handleAddComment" />
    </van-popup>
</template>

<script>
import { listCommentByMediaId, commentAdd } from '@/apis/media'
import { formatStrNum } from '@/utils/tools'
import CommentBox from './CommentBox'

export default {
    name: 'Comment',
    props: {
        videoInfo: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    components: { CommentBox },
    data() {
        return {
            isInit: true,
            showComment: false,
            total: 0,
            mediaId: null
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
    created() {},
    mounted() {},
    methods: {
        getContainer() {
            return document.getElementById('app')
        },
        onShowComment() {
            this.showComment = true
            const { mediaId } = this.videoInfo
            if (mediaId !== this.mediaId) {
                this.mediaId = mediaId
                this.$nextTick(() => {
                    this.$refs.commentBoxRef.init()
                })
            }
        },
        onCloseComment(event) {
            if (event && event.stopPropagation) {
                event.stopPropagation()
            } else {
                window.event.cancelBubble = true
            }
            this.showComment = false
            this.$emit('close')
        },
        handleTotle(num) {
            this.total = num
        },
        handleAddComment() {
            this.$emit('addComment')
        }
    }
};
</script>

<style lang="less" scoped>
.comment-popup {
    height: 70%;
    border-radius: 12px 12px 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .comment-header {
        position: relative;
        padding: 16px;
        z-index: 8;
        .comment-title {
            font-size: 18px;
            text-align: center;
        }
        .close-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            cursor: pointer;
            i {
                font-size: 32px;
            }
        }
    }
}
</style>