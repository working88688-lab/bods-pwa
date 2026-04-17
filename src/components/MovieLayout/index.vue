<template>
  <div class="wraper">
    <Layout1
      v-if="layout === 1"
      :data="data"
      @more="handleMore"
      @item="handleItem"
      @change="pageSize => $emit('change', { data, pageSize })"
    />
    <Layout2
      v-else-if="layout === 2"
      :data="data"
      @more="handleMore"
      @item="handleItem"
      @change="pageSize => $emit('change', { data, pageSize })"
    />
    <Layout3
      v-else-if="layout === 3"
      :data="data"
      @more="handleMore"
      @item="handleItem"
      @change="pageSize => $emit('change', { data, pageSize })"
    />
    <Layout4
      v-else-if="layout === 4"
      :data="data"
      @more="handleMore"
      @item="handleItem"
      @change="pageSize => $emit('change', { data, pageSize })"
    />
    <Layout5
      v-else-if="layout === 5"
      :data="data"
      @more="handleMore"
      @item="handleItem"
      @change="pageSize => $emit('change', { data, pageSize })"
    />
    <Layout6
      v-else-if="layout === 6"
      :data="data"
      @more="handleMore"
      @item="handleItem"
      @change="pageSize => $emit('change', { data, pageSize })"
    />
    <Layout7
      v-else-if="layout === 7"
      :data="data"
      @more="handleMore"
      @item="handleItem"
      @change="pageSize => $emit('change', { data, pageSize })"
    />
    <Layout10
      v-else-if="layout === 10"
      :data="data"
      @more="handleMore"
      @item="handleItem"
    />
    <Layout4
      v-else
      :data="data"
      @more="handleMore"
      @item="handleItem"
      @change="pageSize => $emit('change', { data, pageSize })"
    />
  </div>
</template>

<script>
import Layout1 from './layout1.vue'
import Layout2 from './layout2.vue'
import Layout3 from './layout3.vue'
import Layout4 from './layout4.vue'
import Layout5 from './layout5.vue'
import Layout6 from './layout6.vue'
import Layout7 from './layout7.vue'
import Layout10 from './layout10.vue'

export default {
  components: {
    Layout1,
    Layout2,
    Layout3,
    Layout4,
    Layout5,
    Layout6,
    Layout7,
    Layout10,
  },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    showMore: {
      type: Boolean,
      default: true,
    },
    layout: {
      type: Number,
      default: 4,
    },
  },
  methods: {
    handleMore() {
      this.$router.push({
        path: '/movieList',
        query: {
          label: this.data.categoryName,
          categoryId: this.data.categoryId,
          layout: this.data.layout,
        },
      })
    },
    handleItem(e) {
      this.$router.push({
        path: '/play',
        query: {
          videoId: e.mediaId,
          categoryId: e.categoryId,
          payType: e.payType,
        },
      })
    },
  },
}
</script>
