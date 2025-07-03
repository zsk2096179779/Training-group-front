Page({
  data: {
    phone: '',
    password: '',
    nickname: ''
  },
  onPhoneInput(e: any) {
    this.setData({ phone: e.detail.value });
  },
  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value });
  },
  onNicknameInput(e: any) {
    this.setData({ nickname: e.detail.value });
  },
  onRegister() {
    wx.request({
      url: 'http://localhost:8080/api/user/register',
      method: 'POST',
      data: {
        phone: this.data.phone,
        password: this.data.password,
        nickname: this.data.nickname
      },
      success: (res) => {
        if (res.data && (res.data as any).success) {
          wx.showToast({ title: '注册成功' });
          wx.redirectTo({ url: '/pages/login/login' });
        } else {
          wx.showToast({ title: (res.data as any).message || '注册失败', icon: 'none' });
        }
      }
    });
  },
  goBack() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
}); 