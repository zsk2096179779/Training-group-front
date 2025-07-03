Page({
  data: {
    reason: '',
    productId: ''
  },
  onLoad(options: any) {
    this.setData({
      reason: options.reason ? decodeURIComponent(options.reason) : '',
      productId: options.productId || ''
    });
  },
  onBack() {
    if (this.data.productId) {
      wx.redirectTo({ url: `/pages/productDetail/productDetail?id=${this.data.productId}` });
    } else {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  }
}); 