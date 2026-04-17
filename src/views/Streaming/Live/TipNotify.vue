
<template>
    <div class="tip-notify">
        <div class="notify-item" v-for="(notify, idx) in notifyList" :key="idx">
            <div class="avatar">
                <img :src="imageBase + notify.userInfo.headUrl">
            </div>
            <div class="notify-cont">
                <div class="nick-name">{{ notify.userInfo.nickName  }}</div>
                <div class="gift-name">送出金币</div>
            </div>
            <div class="notify-num">
                <img src="@/assets/images/iconGold.png">
                <span>X{{ notify.amount }}</span>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'TipNotify',
    data() {
        return {
            notifyList: [],
            timer: null
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
        this.timer = setInterval(() => {
            if (this.notifyList.length > 0) {
                this.notifyList = _.tail(this.notifyList)
            }
        }, 6000)
    },
    destroyed() {
        this.timer && clearInterval(this.timer)
    },
    methods: {
        addNotify(data) {
            this.notifyList.push(data)
        }
    }
}
</script>
<style lang="less" scoped>
.tip-notify {
    position: absolute;
    top: 100px;
    .notify-item {
        display: flex;
        align-items: center;
        background: linear-gradient(to bottom,rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
        border-radius: 18px;
        overflow: hidden;
        margin-bottom: 6px;
        .avatar {
            margin-right: 10px;
            img {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                overflow: hidden;
            }
        }
        .notify-cont {
            flex: 1;
            text-align: left;
            margin-right: 36px;
            .gift-name {
                color: #a3a3a3;
                font-size: 12px;
            }
        }
        .notify-num {
            display: inline-flex;
            align-items: center;
            margin-right: 12px;
            img {
                width: 36px;
                margin-right: 6px;
            }
        }
    }
}
</style>