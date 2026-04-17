<template>
    <div class="loader">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  </template>
  
  <style lang="less" scoped>
  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    height: 100%;
  }
  
  .dot {
    width: 12px;
    height: 12px;
    background: var(--theme-color); /* 设置渐变颜色 */
    border-radius: 50%;
    animation: bounce 1s infinite ease-in-out;
    margin-right: 8px;
    &:last-of-type {
      margin-right: 0;
    }
  }
  
  .dot:nth-child(1) {
    animation-delay: 0s;
  }
  .dot:nth-child(2) {
    animation-delay: 0.15s;
  }
  .dot:nth-child(3) {
    animation-delay: 0.3s;
  }
  .dot:nth-child(4) {
    animation-delay: 0.45s;
  }
  .dot:nth-child(5) {
    animation-delay: 0.6s;
  }
  
  @keyframes bounce {
    0%,
    100% {
      transform: scale(0.5);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.3); /* 增加缩放比例 */
      opacity: 1;
    }
  }
  </style>
  