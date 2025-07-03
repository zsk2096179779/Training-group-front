Page({
  data: {
    phone: '',
    password: ''
  },
  onPhoneInput(e: any) {
    this.setData({ phone: e.detail.value });
  },
  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value });
  },
  onLogin() {
    wx.request({
      url: 'http://localhost:8080/api/user/login',
      method: 'POST',
      data: {
        phone: this.data.phone,
        password: this.data.password
      },
      success: (res) => {
        console.log('login response:', res);
        if (res.statusCode === 200 && res.data) {
          // 兼容后端返回userId或id字段
          const userId = (res.data as any).userId || (res.data as any).id;
          if (userId) {
            wx.showToast({ title: '登录成功' });
            wx.setStorageSync('userId', userId);
            // 登录成功后，检查KYC状态
            wx.request({
              url: 'http://localhost:8080/api/kyc/status',
              method: 'GET',
              data: { userId },
              success: (kycRes) => {
                if (kycRes.data && !(kycRes.data as any).completed) {
                  wx.redirectTo({ url: '/pages/kyc/kyc' });
                } else {
                  wx.redirectTo({ url: '/pages/index/index' });
                }
              },
              fail: () => {
                wx.redirectTo({ url: '/pages/index/index' });
              }
            });
          } else {
            wx.showToast({ title: '登录失败', icon: 'none' });
          }
        } else {
          wx.showToast({ title: '登录失败', icon: 'none' });
        }
      }
    });
  },
  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  }
}); 