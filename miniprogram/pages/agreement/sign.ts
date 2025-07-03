Page({
  data: {
    agreements: [],
    allChecked: false,
    productId: ''
  },
  onLoad(options) {
    this.setData({ productId: options.productId || '' });
    this.loadAgreements();
  },
  loadAgreements() {
    const agreements = [
      {
        id: '1',
        name: '基金投资风险揭示书',
        content: `<h3>基金投资风险揭示书</h3>
<p>尊敬的投资者：</p>
<p>在您投资本基金产品前，请务必认真阅读本风险揭示书，充分了解基金产品的风险特征，并根据自身风险承受能力谨慎决策。</p>
<p><b>一、基金产品风险</b></p>
<ul>
  <li>基金产品不同于银行储蓄和债券等投资工具，存在本金亏损的风险。</li>
  <li>基金管理人不保证基金一定盈利，也不保证最低收益。</li>
  <li>基金过往业绩不代表未来表现，市场波动可能导致基金净值大幅波动。</li>
  <li>投资者应充分了解基金合同、招募说明书等法律文件，知悉基金的投资范围、投资策略、风险收益特征等。</li>
</ul>
<p><b>二、投资者权利与义务</b></p>
<ul>
  <li>投资者有权知悉基金产品的相关信息，有权获得基金管理人依法披露的信息。</li>
  <li>投资者应当遵守基金合同、法律法规的相关规定，履行信息真实、合规申购等义务。</li>
</ul>
<p><b>三、特别提示</b></p>
<ul>
  <li>基金投资有风险，投资需谨慎。请根据自身风险承受能力选择合适的产品。</li>
  <li>如有疑问，请咨询基金管理人或销售机构。</li>
</ul>
<p>本人已充分阅读、理解并同意本风险揭示书的全部内容。</p>`,
        checked: false
      },
      {
        id: '2',
        name: '客户权益须知',
        content: `<h3>客户权益须知</h3>
<p>1. 您有权知悉基金产品的相关信息和风险。</p>
<p>2. 您有权自主决定是否投资本产品。</p>
<p>3. 您的信息将严格保密，不会泄露给无关方。</p>
<p>4. 您有权依法获得基金管理人、销售机构的服务与支持。</p>
<p>5. 如有疑问或投诉，可拨打客服电话：400-xxx-xxxx。</p>`,
        checked: false
      }
    ];
    this.setData({ agreements });
  },
  onCheckGroupChange(e: any) {
    const checkedIds = e.detail.value; // 选中的 id 数组
    const agreements = this.data.agreements.map((item: any) => ({
      ...item,
      checked: checkedIds.includes(item.id)
    }));
    const allChecked = agreements.every((item: any) => item.checked);
    console.log('agreements:', agreements, 'allChecked:', allChecked);
    this.setData({ agreements, allChecked });
  },
  onAgree() {
    const ids = this.data.agreements.filter((item: any) => item.checked).map((item: any) => item.id);
    wx.request({
      url: 'http://localhost:8080/api/agreement/sign',
      method: 'POST',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'userId': wx.getStorageSync('userId'),
        'content-type': 'application/json'
      },
      data: { agreementIds: ids },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.success) {
          wx.showToast({ title: '签署成功', icon: 'success' });
          setTimeout(() => {
            wx.redirectTo({ url: `/pages/purchase/transfer?productId=${this.data.productId}` });
          }, 1200);
        } else {
          wx.showToast({ title: res.data.message || '签署失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  }
}); 