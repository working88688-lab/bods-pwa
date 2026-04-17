<template>
   <div class="act-bar">
      <van-tag @click="onResetListSort">重置</van-tag>
      <!-- <img class="icon" :src="icon" @click="onChangeListLayout" /> -->
      <van-tag class="icon-tag">
        <img class="icon" :src="icon" @click="onChangeListLayout" /> 
      </van-tag>
   </div>
  </template>
  
  <script>

  import dashiconsScreenoptionsIcon from '@/assets/images/dashicons-screenoptions-white.png'
  import materialSymbolsSplitscreenIcon from '@/assets/images/material-symbols-splitscreen-white.png'
  import { ListLayoutTagEnum } from '@/enums'

  export default {
    name: 'ListResetSwitchLayout',
    components: {},
    computed: {
      
    },
    data() {
      return {
        icon: dashiconsScreenoptionsIcon,
        listLayoutTag: ListLayoutTagEnum.column
      }
    },
    created() {},
    mounted() {},
    methods: {
      onResetListSort() {
        this.$emit('onResetListSort')
      },
      onChangeListLayout() {
        if (this.listLayoutTag == ListLayoutTagEnum.row) {
          this.icon = dashiconsScreenoptionsIcon
          this.listLayoutTag = ListLayoutTagEnum.column
        } else {
          this.icon = materialSymbolsSplitscreenIcon
          this.listLayoutTag = ListLayoutTagEnum.row
        }

        this.$emit('onChangeListLayout', this.listLayoutTag)
      }
    }
  }
  </script>
  
  <style lang="less" scoped>

  .act-bar {
    display: flex;
    margin-left: auto;

    .icon-tag {
      margin-left: 8px;

      .icon {
        width: 22px;
        height: 18px;
        flex-grow: 0;
        object-fit: contain;
      }
    }
  }

  ::v-deep .van-tag--default {
    height: 22px;
    background: #109fff;
  }
  </style>
  