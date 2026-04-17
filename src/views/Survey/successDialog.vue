<template>
    <van-dialog class="success-dialog" v-model="show" :showConfirmButton="false">
        <div>
            <div class="title">{{ text }}</div>
            <div class="g-img">
                <img src="@/assets/images/success-gift.png" alt="">
            </div>
            <van-button class="close-btn" @click="onHide" type="primary">开心收下</van-button>
            <div class="tips">问卷奖励由系统自动派送，请注意查收！</div>
        </div>
    </van-dialog>
</template>
<script>
export default {
    props: {
        text: String
    },
    data() {
        return {
            show: false
        }
    },
    methods: {
        onShow() {
            this.show = true
        },
        onHide() {
            this.show = false
        }
    },
    mounted() {
        if (!this.text) {
            this.onHide()
        }
    }
}
</script>
<style lang="less" scoped>
::v-deep.success-dialog {
    width: 309px;
    height: 346px;
    background: rgba(0, 0, 0, 0) url(../../assets/images/success-dialog-1.png) no-repeat;
    background-size: contain;
    text-align: center;
    padding-top: 100px;

    .title {
        font-size: 20px;
    }

    .g-img {
        width: 108px;
        height: 108px;
        text-align: center;
        margin: 10px auto 0;

        img {
            width: 100%;
            height: 100%;

        }
    }

    .close-btn {
        width: 206px;
        height: 40px;
        line-height: 40px;
        border-radius: 20px;
        background: #ff6112 !important;
        margin: 12px 0;
    }

    .tips {
        margin-top: 12px;
        font-size: 12px;
        color: #f92428;
    }
}
</style>