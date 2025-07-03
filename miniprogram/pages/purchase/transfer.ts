Page({
  data: {
    product: {},
    accountNo: '600*****005',
    amount: '',
    readRisk: false,
    canSubmit: false
  },
  onLoad(options) {
    const productId = options.productId || '';
    console.log('purchase page options:', options);
    if (!productId) {
      wx.showToast({ title: '缺少产品ID', icon: 'none' });
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/index/index' });
      }, 1200);
      return;
    }
    wx.request({
      url: `http://localhost:8080/api/product/detail?id=${productId}`,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'userId': wx.getStorageSync('userId')
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.setData({ product: res.data });
        }
      }
    });
    // 新增：获取用户资金账户号
    const userId = wx.getStorageSync('userId');
    wx.request({
      url: `http://localhost:8080/api/user/info?userId=${userId}`,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'userId': userId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.accountNo) {
          this.setData({ accountNo: res.data.accountNo });
        }
      }
    });
    console.log('onLoad: amount', this.data.amount, 'readRisk', this.data.readRisk, 'canSubmit', this.data.canSubmit);
    this.updateCanSubmit();
  },
  onAmountInput(e) {
    let amount = e.detail.value;
    console.log('onAmountInput:', amount);
    // 写死范围：最小10000，最大100000
    const min = 10000;
    const max = 100000;
    if (Number(amount) < min && amount !== '') {
      wx.showToast({ title: `最低${min}元`, icon: 'none' });
    } else if (Number(amount) > max) {
      wx.showToast({ title: `最高${max}元`, icon: 'none' });
    }
    this.setData({ amount }, this.updateCanSubmit);
  },
  onRiskCheck(e) {
    const checked = e.detail.value.length > 0;
    console.log('onRiskCheck:', checked);
    this.setData({ readRisk: checked }, this.updateCanSubmit);
  },
  updateCanSubmit() {
    const { amount, readRisk } = this.data;
    const valid = Number(amount) >= 10000 && Number(amount) <= 100000 && readRisk;
    console.log('updateCanSubmit:', { amount, readRisk, valid });
    this.setData({ canSubmit: valid });
  },
  onSubmit() {
    const { product, amount } = this.data;
    wx.request({
      url: 'http://localhost:8080/api/order/create',
      method: 'POST',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'userId': wx.getStorageSync('userId'),
        'content-type': 'application/json'
      },
      data: {
        productId: product.id,
        amount: Number(amount)
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.success) {
          wx.showToast({ title: '购买成功', icon: 'success' });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/index/index' });
          }, 1500);
        } else {
          wx.showToast({ title: res.data.message || '购买失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  }
}); 