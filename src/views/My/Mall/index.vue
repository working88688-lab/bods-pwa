<template>
    <div class="page-container">
        <Header textColor="#222222" color="#fff" rightColor="#222222" title="金币商城" right="兑换记录" @onClickLeft="onBack" @onClickRight="onRecord" />
        <div class="page-content">
            <Loading v-if="isInit" />
            <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
                <div class="empty-box" v-if="!taskList.length">
                    <van-empty
                        :image="require('@/assets/images/emptyImage.png')"
                        image-size="120"
                        description="暂无数据哦~"
                    />
                </div>
                <div class="task-list" v-else>
                    <div class="task-item" v-for="(task, idx) in taskList" :key="idx" @click="onJump(task)">
                        <img class="task-img" :src="imageBase + task.taskImageUrl">
                        <div class="task-name">{{ task.taskName }}</div>
                        <van-button block type="primary" :disabled="!task.receiveAgain" @click="onReceive(task, idx)">
                            {{ task.receiveAgain ? ('参加任务，赚取' + task.giveCoins + '金币') : '已参加' }}
                        </van-button>
                    </div>
                </div>
            </van-pull-refresh>
        </div>
        <van-dialog v-model:show="showDialog" :showConfirmButton="false" :closeOnClickOverlay="true" @close="onClose">
            <div class="content">
                <div class="task-label">恭喜获得任务奖励</div>
                <div class="task-money" v-if="rowData">
                    <span>{{( rowData.giveCoins || 0)}}</span>
                    <span>金币</span>
                </div>
                <div>
                    <van-button round type="primary" native-type="submit">开心收下</van-button>
                </div>
                <div class="task-tip">领取后在“我的-钱包”里面查看</div>
            </div>
            <div class="btn-box">
                <img class="btn-close" src="@/assets/images/icon_close.png" @click="onClose">
            </div>
        </van-dialog>
    </div>
</template>

<script>
import Header from '@/components/Header'
import { userGetTaskList, recieveTask, clickTask } from '@/apis/activity'
import { userGetAllProduct } from '@/apis/pointsMall'
import Loading from '@/components/Loading'

export default {
    name: 'Task',
    components: {
        Header,
        Loading
    },
    data(){
        return {
            isInit: true,
            refreshing: false,
            loading: false,
            taskList: [],
            rowData: null,
            showDialog: false
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        isApp() {
            return this.$store.state.isApp
        }
    },
    created() {
        this.getDataList(null)
    },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        onRecord() {
            this.$router.push('/mallRecord')
        },
        async getDataList(done) {
            this.isInit = true
            const res = await userGetAllProduct({}).catch(() => {
                this.isInit = false
                done && done()
            })
            done && done()
            if (this.refreshing) {
                this.refreshing = false
            }
            this.isInit = false
            if (res && res.code === 0) {
                this.taskList = res.data
            }
        },
        onRefresh(done) {
            this.getDataList(done)
        },
        async onReceive(task, idx) {
            if (task.receiveAgain) {
                if (this.loading) {
                    return null
                }
                this.loading = true
                const res = await recieveTask({ taskCode: task.taskCode}).catch(() => {
                    this.loading = false
                })
                this.loading = false
                if (res && res.code === 0) {
                    task.receiveAgain = false
                    this.$set(this.taskList, idx, task)
                    this.rowData = task
                    this.showDialog = true
                }
            } else {
                clickTask({ taskCode: task.taskCode})
            }
        },
        onJump(task) {
            if (task.isJump === 0) {
                window.open(task.advertiseUrl,'_blank')
            }
        },
        onClose() {
            this.showDialog = false
            this.rowData = null
        }
    }
}
</script>

<style lang="less" scoped>
.page-content {
    padding: 45px 16px 0;
    background: #f9f9f9;
    min-height: 100vh;
    .task-list {
        .task-item {
            background: #fff;
            margin-bottom: 12px;
            border-radius: 8px;
            overflow: hidden;
            .task-img {
                width: 100%;
            }
            .task-name {
                font-size: 12px;
                font-weight: bold;
                color: #222222;
                padding: 18px 7px 21px;
            }
        }
    }
}
::v-deep .van-button--disabled {
    background: #dddddf!important;
    border-color: #dddddf!important;
    color: #8c8c8c!important;
}
.van-pull-refresh {
    min-height: 50vh;
}
.van-dialog {
    width: 270px;
    background-color: transparent;
    .van-dialog__content {
        .content {
            height: 320px;
            background: #fff;
            padding: 140px 0 12px;
            text-align: center;
            .task-label {
                font-size: 19px;
                color: #7a2816;
            }
            .task-money {
                margin: 10px 0;
                >span:first-child {
                    font-size: 45px;
                    color: #ef250e;
                } 
                >span:last-child {
                    font-size: 20px;
                    color: #ef250e;
                    margin-left: 10px;
                } 
            }
            .van-button {
                width: 130px;
                height: 42px;
                line-height: 42px;
                background: linear-gradient(to bottom, #faa26a, #f92c06, #f1355c)!important;
            }
            .task-tip {
                color: #7a2816;
                margin-top: 10px;
                font-size: 12px;
            }
        }
        .btn-box {
            text-align: center;
            margin-top: 30px;
            .btn-close {
                width: 30px;
                height: 30px;
            }
        }
    }
}
</style>
