Page({
  data: {
    questions: [
      { question: '您的年龄是？', options: ['18-30', '31-45', '46-60', '60以上'] },
      { question: '您的投资经验？', options: ['无', '1-3年', '3-5年', '5年以上'] },
      { question: '您的风险承受能力？', options: ['低', '中', '高'] },
      { question: '您的年收入区间？', options: ['5万以下', '5-20万', '20-50万', '50万以上'] },
      { question: '您的主要投资目标？', options: ['保值', '增值', '高收益'] },
      { question: '您是否有股票投资经验？', options: ['无', '有'] },
      { question: '您是否有基金投资经验？', options: ['无', '有'] },
      { question: '您能承受的最大单笔亏损比例？', options: ['5%以内', '5%-10%', '10%-20%', '20%以上'] },
      { question: '您的家庭资产规模？', options: ['50万以下', '50-200万', '200-500万', '500万以上'] },
      { question: '您对金融产品的了解程度？', options: ['不了解', '一般', '较了解', '非常了解'] }
    ],
    current: 0,
    answers: {},
    submitted: false,
    productId: ''
  },
  onLoad(options) {
    this.setData({ productId: options.productId || '' });
  },
  onOptionChange(e: any) {
    const { value } = e.detail;
    const { current, answers } = this.data;
    answers[current] = value;
    this.setData({ answers });
  },
  onPrev() {
    if (this.data.current > 0) {
      this.setData({ current: this.data.current - 1 });
    }
  },
  onNext() {
    if (this.data.current < this.data.questions.length - 1) {
      this.setData({ current: this.data.current + 1 });
    }
  },
  onSubmit() {
    const { questions, answers, productId } = this.data;
    for (let i = 0; i < questions.length; i++) {
      if (!answers[i]) {
        wx.showToast({ title: '请完成所有题目后再提交', icon: 'none' });
        return;
      }
    }
    const answerJson = JSON.stringify(answers);
    wx.request({
      url: 'http://localhost:8080/api/kyc/submit',
      method: 'POST',
      data: {
        userId: wx.getStorageSync('userId') || '',
        answerJson
      },
      success: (res) => {
        wx.showToast({ title: '提交成功' });
        this.setData({ submitted: true });
        setTimeout(() => {
          if (productId) {
            wx.redirectTo({ url: `/pages/productDetail/productDetail?id=${productId}` });
          } else {
            wx.redirectTo({ url: '/pages/index/index' });
          }
        }, 3000);
      },
      fail: () => {
        wx.showToast({ title: '提交失败', icon: 'none' });
      }
    });
  }
}); 