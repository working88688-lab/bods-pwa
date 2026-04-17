<template>
    <div class="base-info" v-if="actorInfo">
        <div class="info-item">
            <div class="item-label">来自</div>
            <div class="item-value">
                <template v-for="(country, idx) in countryList">
                    <span v-if="actorInfo.country === country.value" :key="idx">{{ country.label }}</span>
                </template>
            </div>
        </div>
        <div class="info-item">
            <div class="item-label">语言</div>
            <div class="item-value">
                <template v-for="(item, i) in actorInfo.languages">
                    <template v-for="(bodyType, idx) in languagesList">
                        <span v-if="item === bodyType.value" :key="idx">{{ bodyType.label }}</span>
                    </template>
                </template>
            </div>
        </div>
        <div class="info-item">
            <div class="item-label">年龄</div>
            <div class="item-value">{{ actorInfo.age }} 岁</div>
        </div>
        <div class="info-item">
            <div class="item-label">类型</div>
            <div class="item-value">
                <template v-for="(gender, idx) in broadcastGenderList">
                    <span v-if="actorInfo.broadcastGender === gender.value" :key="idx">{{ gender.label }}</span>
                </template>
            </div>
        </div>
        <div class="info-item">
            <div class="item-label">有兴趣</div>
            <div class="item-value">
                <template v-for="(interestedIn, idx) in interestedInList">
                    <span v-if="actorInfo.interestedIn === interestedIn.value" :key="idx">{{ interestedIn.label }}</span>
                </template>
            </div>
        </div>
        <div class="info-item">
            <div class="item-label">我的体型</div>
            <div class="item-value">
                <template v-for="(bodyType, idx) in bodyTypeList">
                    <span v-if="actorInfo.bodyType === bodyType.value" :key="idx">{{ bodyType.label }}</span>
                </template>
            </div>
        </div>
        <div class="info-item">
            <div class="item-label">身材特征</div>
            <div class="item-value">
                <template v-for="(item, i) in actorInfo.specifics">
                    <template v-for="(bodyType, idx) in specificsList">
                        <span v-if="item === bodyType.value" :key="idx">{{ bodyType.label }}</span>
                    </template>
                </template>
            </div>
        </div>
        <div class="info-item">
            <div class="item-label">头发颜色</div>
            <div class="item-value">
                <template v-for="(hairColor, idx) in hairColorList">
                    <span v-if="actorInfo.hairColor === hairColor.value" :key="idx">{{ hairColor.label }}</span>
                </template>
            </div>
        </div>
        <div class="info-item">
            <div class="item-label">眼睛颜色</div>
            <div class="item-value">
                <template v-for="(eyesColor, idx) in eyesColorList">
                    <span v-if="actorInfo.eyeColor === eyesColor.value" :key="idx">{{ eyesColor.label }}</span>
                </template>
            </div>
        </div>
        <div class="info-item">
            <div class="item-label">主题</div>
            <div class="item-value">{{ actorInfo.topic }}</div>
        </div>
        <div class="info-item">
            <div class="item-label">介绍</div>
            <div class="item-value">{{ actorInfo.description }}</div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'LiveBaseInfo',
    props: {
        actorInfo: {
            type: Object,
            default: function() {
                return null
            }
        }
    },
    data() {
        return {
            countryList: [
                { label: '中国大陆', value: 'cn' },
                { label: '中国香港', value: 'hk' },
                { label: '中国台湾', value: 'tw' },
                { label: '中国澳门', value: 'mo' },
                { label: '日本', value: 'jp' },
                { label: '韩国', value: 'kr' }
            ],
            languagesList: [
                { label: '英语', value: 'en' },
                { label: '中文', value: 'zh' },
                { label: '日语', value: 'ja' },
                { label: '朝鲜语', value: 'ko' },
                { label: '马来语', value: 'ms' },
                { label: '法语', value: 'fr' }
            ],
            broadcastGenderList: [
                { label: '男性', value: 'male', type: 'success' },
                { label: '女性', value: 'female', type: 'info' },
                { label: '变性人', value: 'tranny', type: 'warning' },
                { label: '群体表演', value: 'group', type: 'error' },
                { label: '情侣', value: 'couple', type: 'tertiary' }
            ],
            bodyTypeList: [
                { label: '瘦', value: 'bodyTypeThin', type: 'success' },
                { label: '中等', value: 'bodyTypeAverage', type: 'info' },
                { label: '运动型', value: 'bodyTypeAthletic', type: 'warning' },
                { label: '大号美女', value: 'bodyTypeLarge', type: 'error' },
                { label: '丰满', value: 'bodyTypeCurvy', type: 'tertiary' }
            ],
            interestedInList: [
                { label: '男人', value: 'interestedInMen', type: 'success' },
                { label: '女人', value: 'interestedInWomen', type: 'info' },
                { label: '变性人', value: 'interestedInTranssexuals', type: 'warning' },
                { label: '所有人', value: 'interestedInEverybody', type: 'error' }
            ],
            specificsList: [
                { label: '大屁股', value: 'specificsBigAss' },
                { label: '巨乳', value: 'specificsBigTits' },
                { label: '大屌', value: 'specificsBigCock' },
                { label: '阴部多毛', value: 'specificsHairy' },
                { label: '纹身', value: 'specificsTattoos' },
                { label: '穿孔', value: 'specificsPiercing' },
                { label: '女同', value: 'specificLesbians' },
                { label: '跨种族', value: 'specificInterracial' },
                { label: '怀孕', value: 'specificPregnant' },
                { label: '小胸部', value: 'specificSmallTits' },
                { label: '剃光', value: 'specificShaven' }
            ],
            hairColorList: [
                { label: '棕发', value: 'hairColorBlonde' },
                { label: '红发', value: 'hairColorRed' },
                { label: '黑发', value: 'hairColorBlack' },
                { label: '彩色', value: 'hairColorColorful' },
                { label: '没头发', value: 'hairColorHairless' },
                { label: '其他', value: 'hairColorOther' }
            ],
            eyesColorList: [
                { label: '灰色', value: 'eyeColorGrey' },
                { label: '绿色', value: 'eyeColorGreen' },
                { label: '蓝色', value: 'eyeColorBlue' },
                { label: '褐色', value: 'eyeColorHazel' },
                { label: '棕色', value: 'eyeColorBrown' },
                { label: '黑色', value: 'eyeColorBlack' }
            ]
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    created() {},
    mounted() {},
    destroyed() {},
    methods: {}
}
</script>
  
<style lang="less" scoped>
.base-info {
    padding: 0 16px 16px;
    .info-item {
        padding: 12px 0;
        display: flex;
        align-items: center;
        font-size: 14px;
        .item-label {
            width: 100px;
            color: #a3a3a3;
        }
        .item-value {
            width: calc(100% - 100px);
            color: #ebebeb;
            word-wrap: break-word;
            span {
                margin-right: 12px;
                white-space: nowrap;
            }
        }
    }
}
</style>