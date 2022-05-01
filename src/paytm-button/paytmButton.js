import React, { useEffect, useState } from "react"
const PaytmChecksum = require('./paytmChecksum');
const https = require('https');


// Go To Index HTML Place Merchant Id Before Whatever Action on Pay Now

export function PaytmButton () {
    const [paymentData, setPaymentData] = useState({
        token: "", 
        order: "", 
        mid: "",
        amount: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = () => {
        let orderId = 'Order_'+new Date().getTime();

        let mid = "Merchant_ID"; // Merchant ID
        let mkey = "Merchant_Key"; // Merhcant Key
        var paytmParams = {};

        paytmParams.body = {
            "requestType"   : "Payment",
            "mid"           : mid,
            "websiteName"   : "WEBSTAGING",
            "channelId"     : "WEB",
            "industryType"  : "Retail", 
            "orderId"       : orderId,
            "callbackUrl"   : "http://merchantcallback", // http://{host}:${port}
            "txnAmount"     : {
                "value"     : 10,
                "currency"  : "INR",
            },
            "userInfo"      : {
                "custId"    : '1001',
            }
        };

        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), mkey).then(function(checksum){
            paytmParams.head = {
                "signature"    : checksum
            };

            var post_data = JSON.stringify(paytmParams);

            var options = {
                /* for Staging */
                hostname: 'securegw-stage.paytm.in',

                /* for Production */
                //  hostname: 'securegw.paytm.in',

                port: 443,
                path: `/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            var response = "";
            var post_req = https.request(options, function(post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });
                post_res.on('end', function(){
                    setPaymentData({
                        ...paymentData,
                        token: JSON.parse(response).body.txnToken, 
                        order: orderId, 
                        mid: mid,
                        amount: 100
                    })
                });
            });

            post_req.write(post_data);
            post_req.end();
        });
    }

    const makePayment = () => {
        var config = {
            "root":"",
            "style": {
              "bodyBackgroundColor": "#fafafb",
              "bodyColor": "",
              "themeBackgroundColor": "#0FB8C9",
              "themeColor": "#ffffff",
              "headerBackgroundColor": "#284055",
              "headerColor": "#ffffff",
              "errorColor": "",
              "successColor": "",
              "card": {
                "padding": "",
                "backgroundColor": ""
              }
            },
            "data": {
              "orderId": paymentData.order,
              "token": paymentData.token,
              "tokenType": "TXN_TOKEN",
              "amount": paymentData.amount /* update amount */
            },
            "payMode": {
              "labels": {},
              "filter": {
                "exclude": []
              },
              "order": [
                  "CC",
                  "DC",
                  "NB",
                  "UPI",
                  "PPBL",
                  "PPI",
                  "BALANCE"
              ]
            },
            "website": "WEBSTAGING",
            "flow": "DEFAULT",
            "merchant": {
              "mid": paymentData.mid,
              "redirect": false
            },
            "handler": {
              "transactionStatus":
        function transactionStatus(paymentStatus){
              if(paymentStatus.STATUS === 'TXN_SUCCESS'){
                  // Update Data When Success
              }
              },
              "notifyMerchant":
        function notifyMerchant(eventName,data){
                console.log("Closed");
              }
            }
        };
      
        if (window.Paytm && window.Paytm.CheckoutJS) {
       	window.Paytm.CheckoutJS.init(config).
        then(function onSuccess() {
            window.Paytm.CheckoutJS.invoke();
        }).catch(function onError(error) {
            console.log("Error => ", error);
        });
        }}

    return (
        <div>        
                    <button onClick={makePayment} className="btn btn-outline-success">Pay Now</button>
        </div>
    )
}