import store from '@/store'

const renderMine = e =>
  e.some(item => item.path === '/mine')
    ? []
    : [
      {
        label: '我的',
        name: '/mine',
        path: '/mine',
        default: require('@/assets/images/my.png'),
        active: require('@/assets/images/my_sel.png'),
      },
    ]

export default function useFooterData() {
  const appFooter = store.state.appFooter
  const imageBase = (store.state.cdnLine && store.state.cdnLine.cdnLine) || ''
  const footerData = appFooter.map(item => ({
    ...item,
    label: item.firstCategoryName,
    name: item.firstCategoryId,
    path: item.expand,
    default: imageBase + item.clickOutIcon,
    active: imageBase + item.clickOnIcon,
  }))
  return footerData.concat(renderMine(footerData))
}
