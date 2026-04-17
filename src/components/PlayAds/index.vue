<template>
    <van-dialog v-model="show" :showConfirmButton="false">
        <div class="dialog-content">
            <div class="content">
                <div class="ad-list">
                    <Advertise :banner="currentItem" />
                </div>
            </div>
            <div class="btn-box">
                <span class="btn-close" @click="onClick">
                    {{ currentTime > 0 ? `${currentTime}s后可关闭` : '关闭' }}</span>
            </div>
        </div>
    </van-dialog>
</template>

<script>
import Advertise from '@/components/Advertise'
export default {
    name: 'PlayAds',
    components: { Advertise },
    props: {
        list: {
            type: Array,
            default: []
        },
        onFinished: {
            type: Function,
            default: () => { }
        }
    },
    data() {
        return {
            show: false,
            current: null,
            currentTime: null,
            currentItem: null,
        }
    },
    created() {
        if (this.list.length) {
            this.onShow()
        }
    },
    methods: {
        onShow() {
            this.current = 0
            this.currentTime = this.list[0].advertiseTime
            this.currentItem = this.list[0]
            this.show = true
            this.decrease()
        },
        onClick() {
            if (this.currentTime <= 0) {
                if (this.current < this.list.length - 1) {
                    this.current += 1
                    this.currentTime = this.list[this.current].advertiseTime
                    this.currentItem = this.list[this.current]
                } else {
                    this.show = false
                    this.onFinished()
                }

            }
        },
        decrease() {
            const timer = setInterval(() => {
                if (this.currentTime > 0) {
                    this.currentTime--
                } else {
                    clearInterval(timer)
                }
            }, 1000)
        },
    },
    watch: {
        current: function (val, old) {
            if(val !== old && old !== null){
                this.decrease()
            }
        },
    },
}
</script>

<style lang="less" scoped>
.van-dialog {
    background-color: transparent;
    border-radius: 0;
    max-width: 70vw;

    .dialog-content {
        .content {
            overflow: hidden;

            .ad-list {
                max-height: 100vh;

                .ad-item {
                    height: 100%;

                    img {
                        width: 100%;
                        height: 100%;
                        cursor: pointer;
                    }
                }
            }
        }

        .btn-box {
            text-align: center;
            padding: 16px 0 0;
            position: absolute;
            right: 5px;
            bottom: 10px;

            .btn-close {
                display: inline-block;
                height: 33px;
                line-height: 33px;
                background: rgba(0, 0, 0, .5);
                padding: 0px 20px;
                color: #fff;
                border-radius: 5px;
                font-size: 14px;
                box-sizing: border-box;
                transition: all 0.5s;
            }
        }
    }
}
</style>