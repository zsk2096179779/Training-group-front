Page({
  data: {
    orders: []
  },
  onLoad() {
    const userId = wx.getStorageSync('userId');
    wx.request({
      url: `http://localhost:8080/api/order/list?userId=${userId}`,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'userId': userId
      },
      success: (res) => {
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.setData({ orders: res.data });
        } else if (res.data && Array.isArray(res.data.orders)) {
          this.setData({ orders: res.data.orders });
        }
      },
      fail: () => {
        wx.showToast({ title: '获取订单失败', icon: 'none' });
      }
    });
  },
  onBuyAgain(e) {
    const productId = e.currentTarget.dataset.productId;
    if (productId) {
      wx.navigateTo({ url: `/pages/purchase/transfer?productId=${productId}` });
    } else {
      wx.showToast({ title: '缺少产品ID', icon: 'none' });
    }
  },
  onBackHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  }
}); 