<template>
    <div class="page-container flex-container page">
        <Header textColor="#222222" title="设置" @onClickLeft="onBack" />
        <div class="page-content">
            <ul>
                <li @click="onBindInviteCode">
                    <div class="left">
                        <span>绑定邀请码</span>
                    </div>
                    <div class="right">
                        <template v-if="!userInfo.referCode">
                            <span>去绑定</span>
                            <van-icon name="arrow" />
                        </template>
                        <span v-else>已绑定</span>
                    </div>
                </li>
                <li @click="onBindPhone">
                    <div class="left">
                        <span>绑定手机号</span>
                    </div>
                    <div class="right">
                        <span v-if="userInfo.phoneNumber">已绑定 {{ userInfo.phoneNumber.substr(0, 3) + '****' +
                            userInfo.phoneNumber.substr(7) }}</span>
                        <template v-else>
                            <span>去绑定</span>
                        </template>
                        <van-icon name="arrow" />
                    </div>
                </li>
                <!-- 只在网页中显示 -->
                <template>
                    <li @click="onRouter('/login')">
                        <div class="left">
                            <span>找回老帐号</span>
                        </div>
                        <div class="right">
                            <span>去找回</span>
                            <van-icon name="arrow" />
                        </div>
                    </li>
                </template>
            </ul>
            <ul>
                <li>
                    <div class="left">
                        <span>版本</span>
                    </div>
                    <div class="right">
                        <span>1.0.0</span>
                        <van-icon name="arrow" />
                    </div>
                </li>
                <li>
                    <div class="left">
                        <span>清除缓存</span>
                    </div>
                    <div class="right">
                        <span>0.0M</span>
                        <van-icon name="arrow" />
                    </div>
                </li>
            </ul>
        </div>
        <BindCodeDialog ref="BindCodeDialogRef" />
    </div>
</template>

<script>
import Header from '@/components/Header'
import BindCodeDialog from './BindCodeDialog'

export default {
    name: 'Setting',
    components: { Header, BindCodeDialog },
    data() {
        return {}
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        isApp() {
            return this.$store.state.isApp
        }
    },
    created() { },
    mounted() { },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        onBindInviteCode() {
            if (!this.userInfo.referCode) {
                this.$refs.BindCodeDialogRef.onShow()
            }
        },
        onBindPhone() {
            if (!this.userInfo.phoneNumber) {
                this.$router.push('/bindPhone')
            }
        },
        onRouter(path) {
            this.$router.push(path)
        },
        async logOut() {
            await this.$store.dispatch('logout')
            this.$router.push('/login')
        }
    }
};
</script>

<style lang="less" scoped>
.page-content {
    flex: 1;
    overflow: auto;
    ul {
        padding: 16px;
        li {
            height: 44px;
            font-size: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 16px;
            background: #fff;

            i {
                width: 16px;
                height: 16px;
            }

            .left {
                i {
                    margin-right: 8px;
                }
            }

            .right {
                font-size: 14px;
                color: #a3a3a3;

                i {
                    margin-left: 8px;
                }
            }
        }
    }
}
</style>