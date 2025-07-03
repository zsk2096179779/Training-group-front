// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 登录记忆检查
    const userId = wx.getStorageSync('userId');
    const loginTime = wx.getStorageSync('loginTime');
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
    if (!userId || !loginTime || now - loginTime > maxAge) {
      // 未登录或已过期，跳转到登录页
      wx.redirectTo({ url: '/pages/login/login' });
    } else {
      // 已登录且未过期，跳转首页
      wx.redirectTo({ url: '/pages/index/index' });
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})