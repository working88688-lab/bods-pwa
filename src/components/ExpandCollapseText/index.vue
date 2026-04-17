<template>
    <div v-if="text" class="text-container" :class="{ 'collapsed-container': !expanded }">
        <div class="text-content" :class="{ 'collapsed': !expanded }" ref="textContent">
            <span class="label">简介：</span>{{ text }}
        </div>
        <div class="toggle-icon" v-if="isOverflow" @click="toggleExpand">
            <span v-if="!expanded" class="sp-wrap">
                <span>点击展开</span>
                <van-icon name="arrow-down" />
            </span>
            <span v-else class="sp-wrap">
                <span>点击收起</span>
                <van-icon name="arrow-up" />
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ExpandCollapseText',
    props: {
        text: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            expanded: false,
            isOverflow: false
        }
    },
    mounted() {
        this.checkOverflow()
        window.addEventListener('resize', this.checkOverflow)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkOverflow)
    },
    methods: {
        toggleExpand() {
            this.expanded = !this.expanded
        },
        checkOverflow() {
            if (this.text) {
                this.$nextTick(() => {
                    const el = this.$refs.textContent
                    // 检测是否内容溢出（兼容不同浏览器）
                    this.isOverflow = el.scrollWidth > el.offsetWidth
                })
            }
        }
    }
}
</script>

<style scoped>
.text-container {
    width: 100%;
    color: #b1b1b1;
    position: relative;
    display: block;
}

/* 未展开时使用 flex 布局保持同行 */
.text-container.collapsed-container {
    display: flex;
    align-items: center;
    overflow: hidden;
}

.text-content {
    font-size: 14px;
    padding: 6px 0;

    .label {
        color: #111;
    }
}

/* 未展开时的文本样式 */
.text-content.collapsed {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}

.toggle-icon {
    cursor: pointer;
    position: absolute;
    right: 0;
    bottom: 0;
    padding-left: 8px;
}

/* 未展开时的按钮样式 */
.text-container.collapsed-container .toggle-icon {
    position: static;
    flex-shrink: 0;
    padding: 0 0 0 8px;
    background: none;
}

.sp-wrap {
    display: inline-flex;
    align-items: center;
    font-size: 14px;
    color: #FFA211;
}

.van-icon {
    font-size: 14px;
    margin-left: 2px;
}
</style>