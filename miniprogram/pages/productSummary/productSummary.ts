Page({
  data: {
    products: [],
    totalAmount: 0
  },
  onLoad() {
    const userId = wx.getStorageSync('userId');
    // 获取总购买额
    wx.request({
      url: `http://localhost:8080/api/order/totalAmount?userId=${userId}`,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'userId': userId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && typeof res.data.totalAmount === 'number') {
          this.setData({ totalAmount: res.data.totalAmount });
        }
      }
    });
    // 获取每个产品的累计购买额（后端已统计好）
    wx.request({
      url: `http://localhost:8080/api/order/productSummary?userId=${userId}`,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'userId': userId
      },
      success: (res) => {
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          const products = res.data;
          // 适当性检查
          const checkSuitability = (productId) => {
            return new Promise((resolve) => {
              wx.request({
                url: `http://localhost:8080/api/user/suitabilityCheck?userId=${userId}&productId=${productId}`,
                method: 'GET',
                header: {
                  'Authorization': wx.getStorageSync('token'),
                  'userId': userId
                },
                success: (res) => resolve(res.data),
                fail: () => resolve({ matched: true })
              });
            });
          };
          Promise.all(products.map(p => checkSuitability(p.productId)))
            .then(results => {
              // 兼容后端返回的 match 字段
              const merged = products.map((p, i) => {
                const suitability = results[i];
                if (typeof suitability.matched === 'undefined' && typeof suitability.match !== 'undefined') {
                  suitability.matched = suitability.match;
                }
                return { ...p, suitability };
              });
              this.setData({ products: merged });

              // 读取本地已同意列表
              let agreedList = wx.getStorageSync('suitabilityAgreed') || [];
              if (!Array.isArray(agreedList)) agreedList = [];

              // 找到第一个未同意且不匹配的产品
              const firstUnmatched = merged.find(
                p => p.suitability && p.suitability.matched === false && !agreedList.includes(p.productId)
              );
              if (firstUnmatched) {
                wx.showModal({
                  title: '适当性匹配意见及投资者确认书',
                  content: firstUnmatched.suitability.message || firstUnmatched.suitability.reason || '您的风险等级与产品不匹配，请重新签署确认书。',
                  confirmText: '同意',
                  cancelText: '不同意',
                  success: (res) => {
                    if (res.confirm) {
                      // 记录同意
                      agreedList.push(firstUnmatched.productId);
                      wx.setStorageSync('suitabilityAgreed', agreedList);
                      wx.navigateTo({ url: `/pages/agreement/sign?productId=${firstUnmatched.productId}` });
                    }
                  }
                });
              }
            });
        }
      },
      fail: () => {
        wx.showToast({ title: '获取产品信息失败', icon: 'none' });
      }
    });
  },
  onTransferOut(e) {
    const { productId, productName, productType, totalAmount } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/productTransferOut/productTransferOut?productId=${productId}&productName=${encodeURIComponent(productName)}&productType=${encodeURIComponent(productType)}&totalAmount=${totalAmount}`
    });
  },
  onBackHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
  onSuitabilitySign(e) {
    const productId = e.currentTarget.dataset.productId;
    wx.navigateTo({ url: `/pages/agreement/sign?productId=${productId}` });
  }
}); 