export const usePayType = ({ payType, userLevel, goldPayUnit }) => {
    switch (payType) {
        case 1:
            return {
                class: 'free',
                text: `免费`
            }
        case 2:
            return {
                class: 'gold',
                text: goldPayUnit
            }
        case 3:
            return {
                class: 'level',
                text: `Lv${userLevel}`
            }
        case 4:
            return {
                class: 'vip',
                text: `VIP`
            }

        default:
            break;
    }
}