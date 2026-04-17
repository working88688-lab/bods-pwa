
<template>
    <div
        class="code-send"
        :class="sendType == 1 ? 'default-style' : ''"
        @click="handleClick"
    >
        {{ sendType == 0 ? "获取验证码" : `${second}s后重发` }}
    </div>
</template>

<script>
export default {
    components: {},
    props: {
        // 验证类型
        type: {
            type: String,
            default: "phone", // 'phone': 发送短信 'email':发送邮箱
        },
        validateString: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            sendType: 0, // 0:未发送code 1:发送code中
            second: 59, // 发送时间初始值
            timer: null,
        };
    },
    computed: {},
    methods: {
        handleClick() {
            if (this.sendType == 0) {
                // 判断是否输入手机号或者邮箱
                if(this.type=='phone'&&(!this.validateString)){
                    this.$toast('手机号码为空')
                    return false
                }
                if(this.type=='email'&&(!this.validateString)){
                    this.$toast('邮箱地址为空')
                    return false
                }
                var flag = false; // 校验是否通过
                if (this.type == "phone") {
                    flag = /^(13[0-9]|14[01456879]|15[0-3,5-9]|16[2567]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$/.test(this.validateString);
                } else if (this.type == "email") {
                    flag = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(this.validateString);
                }
                if (flag) {
                    this.sendType = 1;
                    this.timer = setInterval(() => {
                        if (this.second <= 1) {
                        clearInterval(this.timer);
                        this.second = 59;
                        this.sendType = 0;
                        return false;
                        }
                        this.second--;
                    }, 1000);
                }else {
                    // 根据type进行提示
                    if(this.type=='phone'){
                        this.$toast('手机号码有误')
                    }else if(this.type=='email'){
                        this.$toast('邮箱地址有误')
                    }
                }
            }
        },
    },
    created() {},
    mounted() {},
};
</script>
<style lang="less" scoped>
.code-send {
    width: 90px;
    height: 46px;
    border-radius: 23px;
    background: linear-gradient(90deg, #FC2D53 0%, #FC5D3D 100%);
    color: #ffffff;
    font-size: 15px;
    font-weight: 400;
    text-align: center;
    line-height: 46px;
}
.default-style {
    background: #F7F7F7;
    color: #999999;
}
</style>