<template>
    <div class="video-image-preview">
        <div class="preview-title">视频预览</div>
        <div class="thumbnail-list">
            <div class="thumbnail" v-for="(img, index) in list" :key="index" @click="openImagePreview(index)">
                <img :src="img" alt="预览图" :style="{ height: heightStyle }" />
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios"
import { ImagePreview } from 'vant';

export default {
    name: 'VideoImagePreview',
    props: {
        previewImgValue: {
            type: String,
            default: ''
        },
        height: {
            type: [Number, String],
            default: 100
        }
    },
    computed: {
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        heightStyle() {
            return typeof this.height === 'number' ? this.height + 'px' : this.height;
        }
    },
    data() {
        return {
            list: []
        }
    },
    created() {
        this.getImg()
    },
    methods: {
        async getImg() {
            if (!this.previewImgValue) {
                this.list = []
                return
            }
            let res = await axios.get(this.imageBase + this.previewImgValue, {
                transformRequest: [(data, headers) => {
                    // 注意：headers 是 merge 之后、待发送的最终 headers 对象
                    delete headers.macct;
                    delete headers.language;
                    // 如果你想把所有自定义头都清空，也可以遍历 headers，然后删掉非浏览器原生的那些
                    return data;
                }],
            })
            if (res.status == 200 && res.data) {
                this.list = res.data.split(',')
                this.list = this.list.map((item) => {
                    return this.imageBase + item
                })
            }
        },
        openImagePreview(index) {
            ImagePreview({
                images: this.list,
                startPosition: index
            });
        }
    }
};
</script>

<style scoped>
.video-image-preview {
    padding: 0 12px 0 12px;
}

.preview-title {
    color: var(--text-color);
    margin-bottom: 12px;
}

.thumbnail-list {
    overflow-x: auto;
    white-space: nowrap;
}

.thumbnail {
    display: inline-block;
    margin-right: 5px;
    vertical-align: middle;
}

.thumbnail img {
    object-fit: cover;
}
</style>