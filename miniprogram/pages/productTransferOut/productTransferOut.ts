Page({
  data: {
    productId: '',
    productName: '',
    productType: '',
    totalAmount: 0,
    ratio: 100,
    expectedAmount: 0
  },
  onLoad(options) {
    const { productId, productName, productType, totalAmount } = options;
    this.setData({
      productId,
      productName: decodeURIComponent(productName || ''),
      productType: decodeURIComponent(productType || ''),
      totalAmount: Number(totalAmount) || 0,
      ratio: 100
    }, this.updateExpectedAmount);
  },
  onRatioChange(e) {
    const ratio = Number(e.detail.value) || 0;
    this.setData({ ratio }, this.updateExpectedAmount);
  },
  onRatioInput(e) {
    let ratio = Number(e.detail.value) || 0;
    if (ratio < 1) ratio = 1;
    if (ratio > 100) ratio = 100;
    this.setData({ ratio }, this.updateExpectedAmount);
  },
  updateExpectedAmount() {
    const { totalAmount, ratio } = this.data;
    const expectedAmount = ((totalAmount * ratio) / 100).toFixed(2);
    this.setData({ expectedAmount });
  },
  onConfirmTransfer() {
    const { productId, ratio, expectedAmount } = this.data;
    wx.showModal({
      title: '转出确认',
      content: `确定要转出${ratio}%（${expectedAmount}元）吗？`,
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 调用后端转出接口
          wx.request({
            url: 'http://localhost:8080/api/product/transferOut',
            method: 'POST',
            header: {
              'Authorization': wx.getStorageSync('token'),
              'userId': wx.getStorageSync('userId'),
              'content-type': 'application/json'
            },
            data: {
              userId: wx.getStorageSync('userId'),
              productId,
              ratio
            },
            success: (resp) => {
              if (resp.statusCode === 200 && resp.data && resp.data.success) {
                wx.showToast({ title: '转出申请成功', icon: 'success' });
                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              } else {
                wx.showToast({ title: resp.data.message || '转出失败', icon: 'none' });
              }
            },
            fail: () => {
              wx.showToast({ title: '网络异常', icon: 'none' });
            }
          });
        }
      }
    });
  }
}); 