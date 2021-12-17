#!/usr/bin/env node

var https = require('https');
require('dotenv').config()

// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require("tencentcloud-sdk-nodejs");

let serverList = [
  'https://api64.ipify.org',
  'https://ident.me',
  'https://api.ip.sb/ip'
];
const getServer = () => {
  return serverList[Math.floor(Math.random() * serverList.length)]
}

const getServer6 = () => {
  let server6List = serverList.concat([
    'https://speed.neu6.edu.cn/getIP.php?r=' + Math.random(),
    'https://api.myip.la',
  ]);
  return server6List[Math.floor(Math.random() * server6List.length)]
}

function getIP(version = 6) {
  let serverIP = getServer6();
  if(version == 4) {
    serverIP = getServer();
  }
  console.log('server', serverIP);
  return new Promise((resolve, reject) => {
    const req = https.get(serverIP, { family: version }, (res) => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve(String(rawData).trim())
        } catch (e) {
          console.log(e);
          reject(e.message)
        }
      });
    });
    req.on('error', (e) => {
      reject(e)
    });
  });


}
// https://cloud.tencent.com/document/api/1427/56157
// https://cloud.tencent.com/document/api/1427/56166
// https://cloud.tencent.com/document/api/1427/56193
function updateRecord(currentIP, params) {

  const DnspodClient = tencentcloud.dnspod.v20210323.Client;

  const clientConfig = {
    credential: {
      // 建议新建子用户，新建策略。 不要使用全局管理员的key
      secretId: process.env.secretId,
      secretKey: process.env.secretKey,
    },
    region: "",
    profile: {
      httpProfile: {
        endpoint: "dnspod.tencentcloudapi.com",
      },
    },
  };

  const client = new DnspodClient(clientConfig);
  const paramsDefault = {
    "Domain": "passby.me",
    "SubDomain": "v6pod",
    "RecordType": currentIP.match(/\:/) ? 'AAAA' : 'A',
    "RecordLine": "默认",
    "Value": currentIP,
    "TTL": 120,
    "RecordId": 1004146284 // 每个子域名的RecordId保持不变，先写死。见上面注释里的链接
  };
  const mergedParams = Object.assign({}, paramsDefault, params)
  return client.ModifyRecord(mergedParams);
}

async function main() {
  let ip, response;
  try {
    ip = await getIP();
    response = await updateRecord(ip, { TTL: 125 });
  } catch (error) {
    console.error(error)
  }
  console.log(ip,response)
}

main();