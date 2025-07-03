// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    nickname: '',
    totalAsset: 200000.00,
    totalProfit: 0.00,
    mainProduct: null,
    combos: [],
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    products: [],
    statusBarHeight: 0
  },
  methods: {
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
    onLoad() {
      const sysInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sysInfo.statusBarHeight
      });
      const userId = wx.getStorageSync('userId');
      // 获取用户信息
      wx.request({
        url: `http://localhost:8080/api/user/info?userId=${userId}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            this.setData({ userInfo: res.data });
          }
        }
      });
      // 获取产品列表
      wx.request({
        url: 'http://localhost:8080/api/product/list',
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && Array.isArray(res.data)) {
            this.setData({ products: res.data });
          }
        }
      });
    },
    onMenuTap() {
      wx.showActionSheet({
        itemList: ['查看订单', '产品总览', '退出登录'],
        success: (res) => {
          if (res.tapIndex === 0) {
            wx.navigateTo({ url: '/pages/order/order' });
          } else if (res.tapIndex === 1) {
            wx.navigateTo({ url: '/pages/productSummary/productSummary' });
          } else if (res.tapIndex === 2) {
            wx.removeStorageSync('userId');
            wx.removeStorageSync('loginTime');
            wx.redirectTo({ url: '/pages/login/login' });
          }
        }
      });
    },
    onViewDetail(e: any) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({ url: `/pages/productDetail/productDetail?id=${id}` });
    },
    onOrderTap() {
      wx.navigateTo({ url: '/pages/order/order' });
    },
    onProductSummaryTap() {
      wx.navigateTo({ url: '/pages/productSummary/productSummary' });
    }
  },
})
