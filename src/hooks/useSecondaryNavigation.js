import store from '@/store'
import { Dialog } from 'vant'

// 根据当前路由查找二级导航
export default function useSecondaryNavigation(path) {
  const Secondary =
    store.state.appFooter
      .find(item => item.expand === path)
      .child.map(item => ({
        ...item,
        label: item.secondCategoryName,
        value: item.categoryId,
      })) || []

  if (!Secondary.length) {
    Dialog.confirm({
      title: '提示',
      message: '获取菜单信息失败，请刷新页面',
      className: 'gold-dialog',
    })
      .then(async () => {
        window.location.reload()
      })
      .catch(() => {})
  }
  return Secondary
}
