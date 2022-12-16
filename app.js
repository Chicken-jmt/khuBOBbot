var express = require('express');
const request = require('request');
const PUSH_TARGET_URL = 'https://api.line.me/v2/bot/message/push'
const REPLY_TARGET_URL = 'https://api.line.me/v2/bot/message/reply'
const TOKEN = 'Zd+BLpi6wLHMngB3EK74S1W7ApnAXuYZ86xGIi60JKrSW0xI0JyXlCzpunYxk9fxtOkH4y2/CNrb6K7WYldpXBwUkCKNIyEQ04AUpQKQ1EzS6C3qm6y5sBm0zs/Gmzn6n1v1jLfmSpxyLir7VqHk5wdB04t89/1O/w1cDnyilFU='
const fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const domain = "yoongja.shop"
const sslport = 23023;

const bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

const mysql = require("./mysql.js");

const restaurant_table = mysql.restaurant_table;
const menu_table = mysql.menu_table;
const schoolfood_table = mysql.schoolfood_table;

const food_menu_arr = ["한식", "중식", "양식", "일식", "분식", "아시안", "패스트 푸드", "학식", "카페"];

app.post('/hook', function (req, res){
    var eventObj = req.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;

    // request log
    console.log('======================', new Date() ,'======================');
    console.log('[request]', req.body);
    console.log('[request source] ', eventObj.source);
    console.log('[request message]', eventObj.message);

    var food = food_menu_arr.find(element =>  element == message.text);
    var restaurant_info = restaurant_table.find(element => element.name == message.text);

    if (message.text == "메뉴"){
        send_menu(eventObj);
    } 
    else if (food !=  undefined){
        send_restaurant(eventObj, food);
    }
    else if(restaurant_info != undefined){
        send_restaurant_info(eventObj, restaurant_info);
    }
    else{
        send_error_message(eventObj);
    }
    
    res.sendStatus(200);
});

function food_row_layout(food){
    return {
        "type": "button",
        "action": {
        "type": "message",
        "label": food,
        "text": food
        },
        "style": "secondary",
        "color": "#EEEEEE"
    }
}
function send_menu(eventObj){
    request.post(
        {
            url: REPLY_TARGET_URL,
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            },
            json: {
                "replyToken": eventObj.replyToken,
                "messages":[
                    {
                        "type": "flex",
                        "altText": "this is a flex message",
                        "contents": {
                            "type": "bubble",
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type":"box",
                                        "layout":"horizontal",
                                        "contents":[
                                            food_row_layout(food_menu_arr[0]),
                                            food_row_layout(food_menu_arr[1]),
                                            food_row_layout(food_menu_arr[2])
                                        ]
                                    },
                                    {
                                        "type":"box",
                                        "layout":"horizontal",
                                        "contents":[
                                            food_row_layout(food_menu_arr[3]),
                                            food_row_layout(food_menu_arr[4]),
                                            food_row_layout(food_menu_arr[5])
                                        ]
                                    },
                                    {
                                        "type":"box",
                                        "layout":"horizontal",
                                        "contents":[
                                            food_row_layout(food_menu_arr[6]),
                                            food_row_layout(food_menu_arr[7]),
                                            food_row_layout(food_menu_arr[8])
                                        ]
                                }
                                ]
                              }
                          }
                    }
                        
                      
                ]
              }
        }, (error, response, body) => {
            console.log(body);
        }
    )
}

function send_restaurant(eventObj, food){
    let restaurants = [];
    let idx = 0;
    let length = restaurant_table.length;
    for(let i = 0; i < length; i++){
        if(restaurant_table[i].category == food){
            restaurants[idx] = {
                "title": restaurant_table[i].name,
                "text": "평점: " + restaurant_table[i].point + "\n주소: " + restaurant_table[i].address,
                "actions": [
                {
                    "type": "message",
                    "label": "press",
                    "text":restaurant_table[i].name
                }
            ]};
            idx++;
        }
        if(idx >= 10){break;}
    };
    request.post(
        {
            url: REPLY_TARGET_URL,
            headers: {
                Authorization: `Bearer ${TOKEN}`
            },
            json: {
                "replyToken":eventObj.replyToken,
                "messages":[
                    {
                        "type": "template",
                        "altText": "this is a carousel template",
                        "template": {
                          "type": "carousel",
                          "columns": restaurants
                        }
                    }
                ]
            }
        },(error, response, body) => {
            console.log(body)
        });
}


function send_restaurant_info(eventObj, restaurant_info){
    let menu = ""
    
    for(let i = 0; i <menu_table.length; i++){
        if(menu_table[i].name == restaurant_info.name){
            menu += menu_table[i].menu + "  " +menu_table[i].price +"\n";
        }
    }
    if (menu == ""){
        menu = "메뉴 정보 없음"
    }

    request.post(
        {
            url:REPLY_TARGET_URL,
            headers:{
                'Authorization' :`Bearer ${TOKEN}`
            },
            json:{
                "replyToken": eventObj.replyToken,
                "messages":[
                    {
                        "type": "location",
                        "title": restaurant_info.name,
                        "address": restaurant_info.address,
                        "latitude": restaurant_info.latitude,
                        "longitude": restaurant_info.longitude
                    },
                    {
                        "type": "text",
                        "text": menu
                    }
                ]
            }
        }
    )
}
function send_error_message(eventObj){
    request.post(
        {
            url:REPLY_TARGET_URL,
            headers:{
                'Authorization' :`Bearer ${TOKEN}`
            },
            json:{
                "replyToken": eventObj.replyToken,
                "messages":[
                    {
                        "type" : "text",
                        "text": "다시 입력해주세요."
                    },
                ]
            }
        }    
    )
}

try {
    const option = {
        ca: fs.readFileSync('/etc/letsencrypt/live/' + domain +'/fullchain.pem'),
        key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/privkey.pem'), 'utf8').toString(),
        cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/cert.pem'), 'utf8').toString(),
    };
    
    HTTPS.createServer(option, app).listen(sslport, () => {
        console.log(`[HTTPS] Server is started on port ${sslport}`);
    });
    } catch (error) {
    console.log('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
    console.log(error);
    }