let pluginsConfig
console.log('==========打包环境==========' + process.env.VUE_APP_DEVICE)
if (process.env.VUE_APP_DEVICE === 'h5') {
    pluginsConfig = {
        'postcss-px-to-viewport': {
            unitToConvert: 'px',
            viewportWidth: 375,
            unitPrecision: 5,
            propList: ['*'],
            viewportUnit: 'vw',
            fontViewportUnit: 'vw',
            selectorBlackList: [],
            minPixelValue: 1,
            mediaQuery: false,
            replace: true,
            exclude: undefined,
            include: undefined,
            landscape: false,
            landscapeUnit: 'vw',
            landscapeWidth: 568
        },
        'autoprefixer':{}
    }
} else {
    pluginsConfig = {
        'autoprefixer':{}
    }
}

module.exports = {
    plugins: pluginsConfig
}
