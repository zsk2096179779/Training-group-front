Page({
  data: {
    productId: ''
  },
  onLoad(options) {
    this.setData({ productId: options.productId || '' });
  },
  onSubmit(e: any) {
    const { name, idCard, mobile } = e.detail.value;
    if (!name || !idCard || !mobile) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    wx.request({
      url: 'http://localhost:8080/api/otc/open',
      method: 'POST',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'userId': wx.getStorageSync('userId'),
        'content-type': 'application/json'
      },
      data: { name, idCard, mobile },
      success: (res) => {
        if (res.statusCode === 200 && typeof res.data === 'object' && 'success' in res.data && (res.data as any).success) {
          wx.showToast({ title: '开户成功', icon: 'success' });
          setTimeout(() => {
            wx.redirectTo({ url: `/pages/agreement/sign?productId=${this.data.productId}` });
          }, 1500);
        } else if (typeof res.data === 'object' && 'message' in res.data) {
          wx.showToast({ title: (res.data as any).message || '开户失败', icon: 'none' });
        } else {
          wx.showToast({ title: '开户失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  }
}); 