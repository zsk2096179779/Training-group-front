// const echarts = require('../../components/ec-canvas/echarts');
// let chart = null;

Page({
  data: {
    product: {},
    hasBought: false,
    selectedRange: 7,
    customStart: '',
    customEnd: '',
    filteredCurveData: []
  },
  onLoad(options) {
    const id = options.id;
    wx.request({
      url: `http://localhost:8080/api/product/detail?id=${id}`,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'userId': wx.getStorageSync('userId')
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.setData({ product: res.data }, () => {
            setTimeout(() => {
              this.drawCurve();
            }, 100);
          });
        }
      }
    });
    // 判断是否已买过该商品
    const userId = wx.getStorageSync('userId');
    wx.request({
      url: `http://localhost:8080/api/order/hasBought?userId=${userId}&productId=${id}`,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token')
      },
      success: (res) => {
        this.setData({ hasBought: (res.data as { bought: boolean }).bought });
      }
    });
    // 加载完后默认过滤
    this.filterCurveData();
  },
  onReady() {
    this.drawCurve();
  },
  drawCurve() {
    const curveData = this.data.filteredCurveData.length ? this.data.filteredCurveData : (this.data.product as any).curveData || [];
    if (!curveData.length) return;
    const categories = curveData.map((item: { date: string; value: number }) => item.date);
    const data = curveData.map((item: { date: string; value: number }) => Number(item.value));
    const ctx = wx.createCanvasContext('curveCanvas', this);
    const width = 320;
    const height = 180;
    const padding = 36;
    const r = 2; // 节点半径
    // 计算最大最小
    const min = Math.min(...data);
    const max = Math.max(...data);
    // 坐标变换
    const points = data.map((v: number, i: number) => {
      const x = padding + r + (width - 2 * padding - r * 2) * (i / (data.length - 1));
      const y = height - padding - (height - 2 * padding) * ((v - min) / (max - min));
      return { x, y };
    });
    // 画布背景
    ctx.setFillStyle('#fff5f5');
    ctx.fillRect(0, 0, width, height);
    // 红色渐变
    const grad = ctx.createLinearGradient(Number(padding), 0, Number(width - padding), 0);
    grad.addColorStop(0, '#ff7875');
    grad.addColorStop(1, '#ff4d4f');
    // 曲线阴影填充
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach((pt: {x: number, y: number}, i: number) => {
      if (i === 0) ctx.lineTo(pt.x, pt.y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + pt.x) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + pt.y) / 2);
      }
    });
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.setFillStyle('rgba(255,77,79,0.10)');
    ctx.fill();
    // 曲线主线
    ctx.beginPath();
    points.forEach((pt: {x: number, y: number}, i: number) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + pt.x) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + pt.y) / 2);
      }
    });
    ctx.setStrokeStyle(grad);
    ctx.setLineWidth(2.5);
    ctx.shadowColor = 'rgba(255,77,79,0.12)';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // 节点
    points.forEach((pt: {x: number, y: number}) => {
      // 内圈红色
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
      ctx.setFillStyle('#ff4d4f');
      ctx.shadowColor = 'rgba(255,77,79,0.18)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    // 坐标轴
    ctx.setStrokeStyle('#f5d6d7');
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    ctx.draw();
  },
  // 辅助接口调用方法
  checkOtcAccount() {
    const userId = wx.getStorageSync('userId');
    return new Promise((resolve) => {
      wx.request({
        url: `http://localhost:8080/api/user/otcStatus?userId=${userId}`,
        header: {
          'Authorization': wx.getStorageSync('token'),
          'userId': userId
        },
        success: (res) => resolve(res.data)
      });
    });
  },
  checkAgreement() {
    const userId = wx.getStorageSync('userId');
    return new Promise((resolve) => {
      wx.request({
        url: `http://localhost:8080/api/user/agreementStatus?userId=${userId}`,
        header: {
          'Authorization': wx.getStorageSync('token'),
          'userId': userId
        },
        success: (res) => resolve(res.data)
      });
    });
  },
  checkKyc() {
    return new Promise((resolve) => {
      wx.request({
        url: 'http://localhost:8080/api/user/kycStatus',
        header: {
          'Authorization': wx.getStorageSync('token'),
          'userId': wx.getStorageSync('userId')
        },
        success: (res) => resolve(res.data)
      });
    });
  },
  checkSuitability(productId: string) {
    return new Promise((resolve) => {
      wx.request({
        url: `http://localhost:8080/api/user/suitabilityCheck?productId=${productId}`,
        header: {
          'Authorization': wx.getStorageSync('token'),
          'userId': wx.getStorageSync('userId')
        },
        success: (res) => resolve(res.data)
      });
    });
  },
  onBuyTap: async function() {
    // 1. 优先检查是否开户
    const otcRes = await this.checkOtcAccount();
    console.log('otcRes', otcRes);
    if (!otcRes || otcRes.otcStatus !== '已开户') {
      const productId = (this.data.product as any).id;
      wx.navigateTo({ url: `/pages/otc/open?productId=${productId}` });
      return;
    }
    // 2. 检查是否已签约
    const signRes = await this.checkAgreement() as { signed: boolean };
    if (!signRes.signed) {
      const productId = (this.data.product as any).id;
      wx.navigateTo({ url: `/pages/agreement/sign?productId=${productId}` });
      return;
    }
    // 3. 检查风险测评
    const kycRes = await this.checkKyc() as { passed: boolean };
    if (!kycRes.passed) {
      const productId = (this.data.product as any).id;
      wx.navigateTo({ url: `/pages/kyc/kyc?productId=${productId}` });
      return;
    }
    // 4. 适当性检查
    const productId = (this.data.product as any).id;
    const matchRes = await this.checkSuitability(productId) as { matched: boolean, reason?: string };
    if (!matchRes.matched) {
      wx.navigateTo({ url: `/pages/match/result?reason=${encodeURIComponent(matchRes.reason || '')}&productId=${productId}` });
      return;
    }
    // 5. 跳转转入页面
    wx.navigateTo({ url: `/pages/purchase/transfer?productId=${productId}` });
  },
  onRangeTap(e: any) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      selectedRange: range,
      customStart: '',
      customEnd: ''
    }, () => {
      this.filterCurveData();
    });
  },
  onStartDateChange(e: any) {
    this.setData({ customStart: e.detail.value }, () => {
      this.filterCurveData();
    });
  },
  onEndDateChange(e: any) {
    this.setData({ customEnd: e.detail.value }, () => {
      this.filterCurveData();
    });
  },
  filterCurveData() {
    const { selectedRange, customStart, customEnd } = this.data;
    const curveData = (this.data.product as any).curveData || [];
    let filtered = curveData;
    if (Number(selectedRange) === 7 || Number(selectedRange) === 30) {
      filtered = curveData.slice(-Number(selectedRange));
    } else if (selectedRange === 'custom' && customStart && customEnd) {
      filtered = curveData.filter((item: any) => item.date >= customStart && item.date <= customEnd);
    }
    this.setData({ filteredCurveData: filtered }, () => {
      this.drawCurve();
    });
  },
  onContinueBuyTap() {
    const productId = (this.data.product as any).id;
    if (productId) {
      wx.navigateTo({ url: `/pages/purchase/transfer?productId=${productId}` });
    } else {
      wx.showToast({ title: '缺少产品ID', icon: 'none' });
    }
  },
  onBackHomeTap() {
    wx.reLaunch({ url: '/pages/index/index' });
  }
}); 