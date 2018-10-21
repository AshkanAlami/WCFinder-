/**
 * Created by ashkan on 3/24/2018.
 */
var fs = require('fs');
const TeleBot = require('telebot');
const bot = new TeleBot('*************************');
var L = [];//[ { n: 'Cinema azadi', lat: 35.728053, lon: 51.416349 },
    // { n: 'Park saei', lat: 35.735186, lon: 51.411078 },
    // { n: 'Arjantin', lat: 35.737027, lon: 51.414861 },
    // { n: 'Park shafagh', lat: 35.729835, lon: 51.408971 },
    // { n: 'Park iranshahr', lat: 35.71069, lon: 51.421547 },
    // { n: 'Empress walk', lat: 43.768465, lon: -79.411909 } ] ;// [{n: '1', lat: 35.732, lon: 51.415}, {n: '2', lat: 35.742, lon: 51.515}, {n: '3', lat: 35.632, lon: 51.43},{n: '4', lat: 36.632, lon: 51.43},{n: '5', lat: 35.832, lon: 51.190},{n: '6', lat: 35.72, lon: 52.43}];
var LL=[];
var nwc = [];
var user = [];
var wcID = 0;

fs.open('WCLocation.json', 'r', (err, fds) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.error('myfile does not exist');
            return;
        }

        throw err;
    }

    var content = fs.readFileSync("WCLocation.json");
    console.log("Output Content : \n"+ content);
    var jsonContent = JSON.parse(content);
    console.log(jsonContent);
    for(var i = 0; i < jsonContent.length; i++){
        L.push(jsonContent[i]);
        if(wcID < L[i].ID){
            wcID = L[i].ID;
        }
    }
    wcID++;

});
fs.open('newWC.json', 'r', (err, fds) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.error('myfile does not exist');
            return;
        }

        throw err;
    }

    var content = fs.readFileSync("newWC.json");
    console.log("Output Content : \n"+ content);
    var jsonContent = JSON.parse(content);
    console.log(jsonContent);
    for(var i = 0; i < jsonContent.length; i++){
        nwc.push(jsonContent[i]);
    }

});
fs.open('user.json', 'r', (err, fds) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.error('myfile does not exist');
            return;
        }

        throw err;
    }

    var content = fs.readFileSync("user.json");
    console.log("Output Content : \n"+ content);
    var jsonContent = JSON.parse(content);
    console.log(jsonContent);
    for(var i = 0; i < jsonContent.length; i++){
        user.push(jsonContent[i]);
    }

});


bot.on(['/start','/back','/cancel'], msg => {
if(!user.find(x => x.id == msg.chat.id)){
    user.push({
        id: msg.chat.id,
        st: "main"
    });
    writeJSUS();
}else {
    user.find(x => x.id == msg.chat.id).st = "main";
    var index1 = nwc.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    if(index1 != -1){nwc = nwc.filter(function (i) {
        return i != nwc[index1];
    });}
    writeJSNewWC();
}
    let replyMarkup = bot.keyboard([
        ['/AddNewWC', '/FindWC']
    ], {resize: true});

    return bot.sendMessage(msg.from.id, 'choose?', {replyMarkup});

});
bot.on('/FindWC', msg => {
    var index = user.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    if(index != -1){
        switch(user[index].st){
            case "main":
                user[index].st = "mainFindWC";
                writeJSUS();
                let replyMarkup = bot.keyboard([
                    ['/cancel',bot.button('location', 'send your location')]
                ], {resize: true});

                return bot.sendMessage(msg.from.id, 'please send your location', {replyMarkup});
                break;
            // default:
            //     sendStart(msg);

        }
    }else { sendStart(msg);}


});
bot.on('/AddNewWC', msg => {
    var index = user.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    if(index != -1){
        if(user[index].st == "main"){
            user[index].st = "mainAddNewWC";
            writeJSUS();
            let replyMarkup = bot.keyboard([
                ['/cancel']
            ], {resize: true});
            nwc.push({
                id: msg.chat.id,
                la: 0,
                lo: 0,
                name: '',
                data: 'No Data',
            });

            return bot.sendMessage(msg.from.id, 'please send wc location', {replyMarkup});
        }else {
            sendStart(msg);
        }
    }else {sendStart(msg);}

});
bot.on('location',msg => {
    var index = user.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    if(index != -1){
        switch (user[index].st){
            case "mainFindWC":
                FindWC(msg);
                break;
            case "mainAddNewWC":
                user[index].st = "mainAddNewWCLocation";
                writeJSUS();
                AddNewWC(msg);
                break;
            // default:
            //     sendStart(msg);
            //     break;
        }
    }else {
        sendStart(msg);
    }


});
bot.on('callbackQuery',msg => {
    var k = JSON.parse("[" + msg.data + "]");
    console.log("k = ",k);
    var inB = [];
    var kend = k[k.length-1];
    var klen = k.length-1;
    for(var i = 0 ;i < klen;i++){
        if(k[i] != -1){
            k[klen] = k[i];
            inB[i] = [bot.inlineButton(L[k[i]].n, {callback: k})]
        }
    }

    let replyMarkup = bot.inlineKeyboard(inB);
    var sendto = msg.from.id;


    setTimeout(function DeletTime() {
        // bot.deleteMessage(msg.from.id, msg.message.message_id);
        console.log("");
    }, 300);
    return bot.deleteMessage(msg.from.id, msg.message.message_id).then(bot.sendVenue(sendto, [L[kend].lat, L[kend].lon],L[kend].n,L[kend].data, {replyMarkup}));

});
bot.on('text',msg =>{
    if(user.find(x => x.id == msg.chat.id)){
        var index = user.map(function(x) {return x.id; }).indexOf(msg.chat.id);
        switch (user[index].st){
            case "mainAddNewWCLocation":
                user[index].st = "mainAddNewWCLocationName";
                writeJSUS();
                if(msg.text != '/cancel'){
                    AddNewWCName(msg);
                }
                break;
            case "mainAddNewWCLocationNameData":
                user[index].st = "mainAddNewWCLocationNameDataEND";
                writeJSUS();
                if(msg.text != '/check and save without data'){
                    AddNewWCData(msg);
                }
                break;

            // default:
            //     sendStart(msg);
            //     break;
        }
    }else if(!(['/start','/back','/cancel','/check','/save','/AddData','/AddNewWC','/FindWC'].includes(msg.text)) ) {
        sendStart(msg);
    }

});
bot.on('/check', msg => {
    var index = user.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    if(index != -1){
        var index1 = nwc.map(function(x) {return x.id; }).indexOf(msg.chat.id);
        if(index1 != -1){
            checkForNewWC(msg,index1);
        }
    }else { sendStart(msg);}
});
bot.on('/AddData',msg => {
    var index = user.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    if(index != -1){
        switch(user[index].st){
            case "mainAddNewWCLocationName":
                user[index].st = "mainAddNewWCLocationNameData";
                writeJSUS();
                let replyMarkup = bot.keyboard([
                    ['/check and save without data']
                ], {resize: true});

                return bot.sendMessage(msg.from.id, 'please send wc data', {replyMarkup});
                break;
            // default:
            //     sendStart(msg);

        }
    }else { sendStart(msg);}
});
bot.on('/save',msg => {
    var index = user.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    if(index != -1){
        var index1 = nwc.map(function(x) {return x.id; }).indexOf(msg.chat.id);
        if(index1 != -1){
            L.push({
                n: nwc[index1].name,
                lat: nwc[index1].la,
                lon: nwc[index1].lo,
                data: nwc[index1].data,
                us: msg.from.id,
                ID: wcID
            });
            wcID++;
            writeJSWCLoc();
            nwc = nwc.filter(function (i) {
                return i != nwc[index1];
            });
            writeJSNewWC();
            bot.sendMessage(msg.from.id, 'thank you!',{});
            setTimeout(function a() {
                console.log("");
            }, 1000);
            user[index].st = "main";
            writeJSUS();
            let replyMarkup = bot.keyboard([
                ['/AddNewWC', '/FindWC']
            ], {resize: true});

            return bot.sendMessage(msg.from.id, 'choose?', {replyMarkup});
        }else {
            sendStart(msg);
        }
    }else {
        sendStart(msg);
    }
});
bot.start();

function FindWC(msg){
    var k = findnear(msg.location.latitude, msg.location.longitude);
    // console.log(L[k[0]].lat, L[k[0]].lon);
    var inB = [];
    var klen = k.length;
    for(var i = 0 ;i < klen;i++){
        if(k[i] != -1){
            k[klen] = k[i];
            inB[i] = [bot.inlineButton(L[k[i]].n, {callback: k})]
        }
    }

    let replyMarkup = bot.inlineKeyboard(inB);

    // let replyMarkup1 = bot.keyboard([
    //     ['/AddNewWC', bot.button('location', 'Find WC')]
    // ], {resize: true});
    let replyMarkup1 = bot.keyboard([
        ['/back']
    ], {resize: true});

    if(k[0] == -1){
        return bot.sendMessage(msg.from.id, "Sorry, there is no enough data in this zone",{replyMarkup1});
    }else {
        return bot.sendVenue(msg.from.id, [L[k[0]].lat, L[k[0]].lon],L[k[0]].n,L[k[0]].data, {replyMarkup});
    }
}
function AddNewWC(msg) {
    var index = nwc.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    nwc[index].la = msg.location.latitude;
    nwc[index].lo = msg.location.longitude;
    if(checkNewLocation(nwc[index].la, nwc[index].lo)){
        let replyMarkup = bot.keyboard([
            ['/back']
        ], {resize: true});
        nwc = nwc.filter(function (i) {
            return i != nwc[index];
        });
        writeJSNewWC();
        user.find(x => x.id == msg.chat.id).st = "gohome! :))";
        return bot.sendMessage(msg.from.id, 'this wc is already define /back', {replyMarkup});
    }
    writeJSNewWC();
    let replyMarkup = bot.keyboard([
        ['/cancel']
    ], {resize: true});
    return bot.sendMessage(msg.from.id, "send name",{replyMarkup});
}
function AddNewWCName(msg) {
    var index = nwc.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    nwc[index].name = msg.text;
    writeJSNewWC();
    let replyMarkup = bot.keyboard([
        ['/AddData','/check and save without data']
    ], {resize: true});
    return bot.sendMessage(msg.from.id, "do you want to add data?",{replyMarkup});
}
function AddNewWCData(msg) {
    var index = nwc.map(function(x) {return x.id; }).indexOf(msg.chat.id);
    nwc[index].data = msg.text;
    writeJSNewWC();
    return checkForNewWC(msg,index);
}
function sendStart(msg){
    let replyMarkup = bot.keyboard([
        ['/start']
    ], {resize: true});

    return bot.sendMessage(msg.from.id, 'please send /start or /back', {replyMarkup});
}
function checkForNewWC(msg,index) {
    let replyMarkup = bot.keyboard([
        ['/cancel','/save']
    ], {resize: true});
    return bot.sendVenue(msg.from.id, [nwc[index].la, nwc[index].lo],nwc[index].name,nwc[index].data, {replyMarkup});
}
setInterval(() => {
    console.log("u:\n ",user);
    console.log("L:\n ",L);
    console.log("nwc:\n ",nwc);
},30000);

function findnear(a,b) {
    var k = [-1,-1,-1];
    var R = [10000000,10000000,1000000];
    for(var i = 0; i < L.length ; i++){
        var r = 0.000001;
        r = (a - L[i].lat)*(a - L[i].lat) + (b - L[i].lon)*(b - L[i].lon);
        if (r < R[0]){
            R[2] = R[1];
            k[2] = k[1];
            R[1] = R[0];
            k[1] = k[0];
            R[0] = r;
            k[0] = i;
        }else if (r < R[1]){
            R[2] = R[1];
            k[2] = k[1];
            R[1] = r;
            k[1] = i;
        }else if ( r < R[2]){
            R[2] = r;
            k[2] = i;
        }
    }
    // console.log(R);
    // console.log(k);
    return k;

}
function checkNewLocation(a,b) {
    for(var i = 0; i < L.length ; i++){
        var r = 0.000001;
        r = (a - L[i].lat)*(a - L[i].lat) + (b - L[i].lon)*(b - L[i].lon);
        if(r < 2.1607999999347332e-8){
            return true;
        }
    }
    return false;
}

function writeJSUS() {
    fs.open('user.json', 'w', (err, fd) => {
        if (err) {
            if (err.code === 'EEXIST') {
                console.error('myfile already exists');
                return;
            }

            throw err;
        }
        fs.writeFile("user.json", JSON.stringify(user, null, 4), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("File has been created");
        });
    });
}
function writeJSWCLoc() {
    fs.open('WCLocation.json', 'w', (err, fd) => {
        if (err) {
            if (err.code === 'EEXIST') {
                console.error('myfile already exists');
                return;
            }

            throw err;
        }
        fs.writeFile("WCLocation.json", JSON.stringify(L, null, 4), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("File has been created");
        });
    });
}
function writeJSNewWC() {
    fs.open('newWC.json', 'w', (err, fd) => {
        if (err) {
            if (err.code === 'EEXIST') {
                console.error('myfile already exists');
                return;
            }

            throw err;
        }
        fs.writeFile("newWC.json", JSON.stringify(nwc, null, 4), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("File has been created");
        });
    });
}