var express = require('express');
var request = require('request');
var app = express();
var http = require('http');
var url = require('url');
var util = require('util');
var Web3 = require("web3");
var crptBls = require('crypto-balances');
const regBTC = /^1\w{25,33}$/; //比特币地址规则
const regETH = /^0x\w{40}$/; //以太坊地址规则
const regLTC = /^L\w{25,33}$/; //莱特币地址规则
const regXRP = /^r\w{25,33}$/; //瑞波币地址规则

 
app.get('/', function (req, res) {
	
	var params = url.parse(req.url, true).query;
	var address = params.ad;

	
	crptBls(address, function(error, result) {
  		console.log(result[0].status);
  		if (result[0] == null) {
  				res.json([{'result':101}]); //101 输入地址无法识别
  				
  		} 
  		else if(result[0].status == "success"){
  				res.json([{'result':0,'name':result[0].asset, 'balance': result[0].quantity}]);
  		}
  		else if(result[0].status == "error"){
  			console.log("call homebrewBls")
  			homebrewBls(address, res);
  			
  		}

	});


	function homebrewBls (address, res){
		
		if (regBTC.test(address)) coinName = 'BTC';
		else if (regETH.test(address)) coinName = 'ETH';
		else if (regLTC.test(address)) coinName = 'LTC';
		else if (regXRP.test(address)) coinName = 'XRP';
		else coinName = 'unKnown';
		console.log("coinName: "+coinName);

		switch(coinName) {

	   		case 'BTC':	
			   	var queryURL = 'https://blockchain.info/q/addressbalance/' + address;
			   	var btcBal = null;
			   	
				request(queryURL, function (error, response, body) {
			  	if (!error && response.statusCode == 200) {
			    	console.log(body) // Show the response body.
			    	btcBal = body;
			    	res.json([{'result':0,'name':'BTC', 'balance': btcBal}])
			  	}
			  	else {
			  		//console.log("比特币服务器维护中……")
			  		res.json([{'result':102}]); //区块链服务器维护中……
			  	}	
				});
				break;
				
			case 'ETH':
				var queryURL = 'https://etherscan.io/address/' + address;
		   		var ethBal = null;
		   	
				request(queryURL, function (error, response, body) {
			  	if (!error && response.statusCode == 200) {
			    	var regx = /<td>ETH Balance:[\s\S]*?(\d*)<b>.<\/b>(\d*) Ether\n/g;
			    	var s = body;
			    	var result = regx.exec(s);
			    	res.json([{'name':'ETH', 'balance': result[1]+'.'+result[2]}])
			  	}
			  	else {
			  		//console.log("以太坊服务器维护中……")
			  		res.json([{'result':102}]); //区块链服务器维护中……
			  	}	
				});
				break;

			case 'XRP':
				'use strict';
				const RippleAPI = require('ripple-lib').RippleAPI;

				const api = new RippleAPI({
				  server: 'wss://s1.ripple.com' // Public rippled server
				});
				api.connect().then(() => {
				  /* begin custom code ------------------------------------ */
				  const myAddress = address;

				  console.log('getting account info for', myAddress);
				  return api.getAccountInfo(myAddress);

				}).then(info => {
				  console.log(info);
				  console.log('getAccountInfo done');
				  res.json([{'name':'XRP', 'balance': info.xrpBalance}])

				  /* end custom code -------------------------------------- */
				}).then(() => {
				  return api.disconnect();
				}).then(() => {
				  console.log('done and disconnected.');
				}).catch(console.error);
				break;

			default:
				console.log("查询的币种暂不支持")
				res.json([{'result':103}]);//查询的币种暂不支持
				
			}
		
	}

});


app.get('/balance', function (req, res) {
	
    var params = url.parse(req.url, true).query;
    var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    var etheBal = null;
    var zbbBal = null;

    web3.eth.getBalance(params.ad)
    .then(function(str){
        etheBal = web3.utils.fromWei(str, 'ether');	
    })
    
    
    res.json([{'name':'ETH', 'balance': etheBal},{'name':'Token_Name', 'balance': 888}])
    
    
})

var server = app.listen(8888, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})

