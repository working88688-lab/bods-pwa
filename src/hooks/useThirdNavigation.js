import store from '@/store'

// 根据二级id查找三级导航
export default function useThirdNavigation(id) {
  const appFooter = store.state.appFooter

  const allSecond = []
  appFooter.forEach(item=>{
    if(item.child){
      allSecond.push(item.child)
    }
  })

  if(allSecond.flat().find(item=>item.categoryId === id)){
    return allSecond.flat().find(item=>item.categoryId === id).child
  }else{
    return []
  }
}
