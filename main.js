const { createClient, Platform, segment } = require("oicq")
const account = 2441288014
const group1 = 519700368
const group2 = 700458704
const client = createClient(account)
const acg = require('./ac_automation');
const main = require('./spider');
const superagent = require('superagent');
const cron = require('node-cron');
const downloadVideo = require('./downloadvideo');

client.on("system.login.qrcode", function (e) {
    //扫码后按回车登录
    process.stdin.once("data", () => {
      this.login()
    })
  }).login()

client.on("system.online", () => console.log("Logged in!"))

// client.on("message", e => {
//   console.log(e)
//   e.reply("hello world",false) //true表示引用对方的消息
// })


let list = ["嘉然","向晚","乃琳","贝拉","珈乐","asoul","a手",
          "嘉心糖","顶碗人","奶淇琳","黄嘉琪","音乐珈","一个魂"];

client.on("message.group", (event) => {
  if(event.group_id === group2||event.group_id === group1){
    let msg = event.message[0].text;
    let result = acg.acSearch(list,msg);
    // console.log(result)
    if(result.length!=0){
      event.reply("acg",false);
    }
  }
});

//定时任务，从抖音用户界面更新视频数据，如果有新视频就下载到本地并发送
cron.schedule("08 * * * *", () => {
  console.log('start');
  (async () => {
    let boolean = await main();
    if(boolean === false){
      return;
    }
    let str = await downloadVideo();
    let msg = segment.video(`./video${str}.mp4`);
    //发送视频需要ffmpeg
    client.sendGroupMsg(group2,msg).then(() => {
      console.log('Video sent successfully.');
    }).catch((reason) => {
      console.log(reason);
    })
  })(); 
});

// //设置心跳间隔(单位/秒)
// client.interval = 360;
// //设置心跳函数
// client.heartbeat = () =>{
//   let msg = segment.video('/video.mp4');
//   //发送视频需要ffmpeg
//   client.sendGroupMsg(group1,msg).then(() => {
//     console.log('success')
//   }).catch((reason) => {
//     console.log(reason);
//   })
// };