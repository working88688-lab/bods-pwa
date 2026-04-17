
<template>
    <div class="page-header" :style="{ 'background': color, 'width': width }" :class="{ 'is-Blur': isBlur }">
        <van-icon v-if="showLeft" name="down" :style="{ 'color': textColor }" :class="arrowBg ? 'arrow-bg' : ''" @click="onClickLeft"/>
        <div class="header-title" :style="{ 'color': textColor }">{{ title }}</div>
        <span class="right" v-if="(right && rightType === 'text')" @click="onClickRight" :style="{ 'color': rightColor }">{{ right }}</span>
        <span class="right right-btn" v-if="(right && rightType === 'btn')" @click="onClickRight" :style="{ 'background-color': rightColor }">{{ right }}</span>
        <span class="right right-icon" v-if="(right && rightType === 'icon')" @click="onClickRight">
            <img :src="rightIcon">
        </span>
    </div>
</template>

<script>
export default {
    name: 'Header',
    props: {
        arrowBg: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: "",
        },
        color: {
            type: String,
            default: "",
        },
        textColor: {
            type: String,
            default: "#fff",
        },
        right: {
            type: String,
            default: "",
        },
        rightColor: {
            type: String,
            default: "#fff",
        },
        rightType: {
            type: String,
            default: "text",
        },
        rightIcon: {
            type: String,
            default: "",
        },
        isBlur: {
            type: Boolean,
            default: false
        },
        showLeft: {
            type: Boolean,
            default: true
        },
        width: {
            type: String,
            default: '100%'
        }
    },
    data() {
        return {}
    },
    computed: {},
    methods: {
        onClickLeft() {
            this.$emit('onClickLeft')
        },
        onClickRight() {
            this.$emit('onClickRight')
        }
    }
}
</script>
<style lang="less" scoped>
.page-header {
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: relative;
    .van-icon-down {
        width: 24px;
        height: 24px;
        font-size: 24px;
        position: absolute;
        top: 10px;
        left: 15px;
        color: #fff;
        cursor: pointer;
        transform: rotate(90deg);
    }
    .arrow-bg {
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        border-radius: 50%;
        background: #222;
        color: #fff!important;
        box-sizing: border-box;
    }
    .header-title {
        max-width: calc(100% - 110px);
        margin: 0 auto;
        height: 44px;
        line-height: 44px;
        text-align: center;
        font-size: 16px;
        color: #fff;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .right {
        position: absolute;
        top: 0;
        right: 15px;
        font-size: 15px;
        cursor: pointer;
    }
    .right-btn {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 15px;
        color: #fff;
        padding: 0 14px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        border-radius: 4px;
        cursor: pointer;
    }
    .right-icon {
        right: 0;
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        img {
            width: 24px;
        }
    }
}
.is-Blur {
    backdrop-filter: blur(5px);
}
</style>