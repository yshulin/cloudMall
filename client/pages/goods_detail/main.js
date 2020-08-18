import { request } from "../../request/index";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsobj:{},
    iscollect:false
  },
  goodsinfo:{},
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    let pages=getCurrentPages();
    let currentPage=pages[pages.length-1];
    
    let options=currentPage.options;

    const{goods_id}=options;
    this.getgoodsdetail(goods_id);

  },

  async getgoodsdetail(goods_id){
    // const goodsobj = await request({ url: "/goods/detail", data: { goods_id } });
    const goodsobj = await wx.cloud.callFunction({
      name:'detail',
      data:{
        goods_id
      }
    });
    
    this.goodsinfo=goodsobj;
    let collect = wx.getStorageSync("collect") || [];
    
    let iscollect = collect.some(v=>v.goods_id === this.goodsinfo.goods_id);

    
    this.setData({
      goodsobj: {
        goods_name: goodsobj.result.message.goods_name,
        goods_price: goodsobj.result.message.goods_price,
        goods_introduce: goodsobj.result.message.goods_introduce.replace(/\.webp/g, '.jpg'),
        pics: goodsobj.result.message.pics,
        goods_small_logo: goodsobj.result.message.goods_small_logo,
        goods_id
      },
      iscollect,
      
    })

  },

  handleprevewimage(e){
    const urls=this.data.goodsobj.pics.map(v=>v.pics_mid);
    const current=e.currentTarget.dataset.url;
    
    wx.previewImage({
      current,
      urls: urls,
    })
  },

  handlecartadd(){
    let cart=wx.getStorageSync('cart')||[];
    let index=cart.findIndex(v=>v.goods_id===this.data.goodsobj.goods_id);
    if(index===-1){
      this.data.goodsobj.num=1;
      this.data.goodsobj.checked=true;
      cart.push(this.data.goodsobj);
    }else{
      cart[index].num++;
    }
    wx.setStorageSync('cart', cart)
    wx.showToast({
      title: '加入成功',
      icon:'success',
      mask:true
    })
  },

  handlecollect(){
    let iscollect=false;
    let collect=wx.getStorageSync('collect')||[];

    
    let index = collect.findIndex(v=>v.goods_id===this.data.goodsobj.goods_id);

    
    if(index!==-1){
      collect.splice(index,1);
      iscollect=false;
      wx.showToast({
      title:'取消成功',
      mask:true,
      });
    }else{
      collect.push(this.data.goodsobj);
      iscollect=true;
      wx.showToast({
      title:'收藏成功',
      mask:true,
    });
    }
    wx.setStorageSync("collect",collect);
    this.setData({
      iscollect,
    })


  },

  async  handleorderpay(e){
    console.log(e);
    
   wx.showLoading({
     title: '正在下单',
 });
 
 // 利用云开发新接口，调用云函数发起订单
 let id = e.target.dataset.goodid;
 const { result } = await wx.cloud.callFunction({
     name: 'pay',
     data: {
         type: 'unifiedorder',
         data: {
             goodId: id
         }
     } 
 });
 
 const data = result.data;
 
 wx.hideLoading();
 
 wx.navigateTo({
     url: `/pages/result/index?id=${data.out_trade_no}`
 });
  }
 
})