# whatsapp-api

This is a simple whatsapp-web.js api created using socket.io

Here I used simple jquery and bootstrap to setup the fronend for simplicity


**Here is the html code**
```html
<div class="row ">
    <div class="col-md-6">
        <div style="padding: 10px; background: #fff; width: 320px; height: 320px" id="qrcode">
            <h3 class="text-center">Loading . . .</h3>
        </div>
    </div>
    <div class="col-md-6 block">
        <form action="javascript:;" id="sendWhatsApp" class="form-horizontal sendWhatsApp">
            <div class="form-group row">
                <label class="col-md-4 control-label">Mobile:</label>
                <div class="col-md-8">
                    <input type="number" class="form-control" name="number" placeholder="Mobile Number">
                </div>
            </div>

            <div class="form-group row">
                <label class="col-md-4 control-label">Message:</label>
                <div class="col-md-8">
                    <textarea name="message" placeholder="Message" class="form-control" rows="5"></textarea>
                </div>
            </div>

            <div class="form-group row">
                <div class="col-md-4">&nbsp;</div>
                <div class="col-md-8">
                    <button class="btn btn-primary">Send Message <i class="fa fa-plane"></i></button>
                </div>
            </div>
        </form>
    </div>
</div>
```


**Here is javascript code**

```javascript
// create a jwt_token in localstorage if not exist
if (!localStorage.jwt_token) {
    localStorage.jwt_token = "";
}

// get the jwt_token from localStorage
const jwt_token = localStorage.jwt_token;


// socket io server - here mine is using localhost and server is running on port 5200
const socketIoServer = "ws://localhost:5200"; 

// initialize the socket.io
const socket = io(socketIoServer, {
    auth: {
        jwt_token
    }
});


// listen for message event in socket
socket.on("message", text => {
    console.log(text);
});


// listen for qr event in socket
socket.on("qr", qrcode_data => {

    // when qr is fired clear the $("#qrcode") area
    $("#qrcode").html("");
    
    // generate a qr code using qrcode.js ( https://davidshimjs.github.io/qrcodejs/ )
    const qr = new QRCode("qrcode", {
        width: 300,
        height: 300,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    qr.makeCode(qrcode_data);
});


// listen for authenticated event
socket.on("authenticated", jwt_token => {

    // authenticated event returns a json web token
    // which we will store in the localStorage
    localStorage.jwt_token = jwt_token;
    
    // set $("#qrcode") area with "Authenticated Text" clearing the qr code image as we don't need it anymore
    $("#qrcode").html("<h1 class='text-center text-success'>Authenticated</h1>");
});


// listen for disconnect event
// this event fires when user logs out from whatsapp web 
socket.on("disconnected", reason => {
    console.log(reason);
    delete localStorage.jwt_token;
    $("#qrcode").html(`<h1 class='text-center text-danger'>Disconnected: ${reason}</h1>`);
});


// listen for "state change" 
socket.on("change_state", state => {
    console.log(state);
    
    // show the state in $("#qrcode") area
    $("#qrcode").html(`<h1 class='text-center text-primary'>${state}</h1>`);
});


// listen for "ready" event and show the message in $("#qrcode") area
socket.on("ready", msg => {
    console.log(msg);
    $("#qrcode").html(`<h3 class='text-center text-success'>${msg}</h3>`);
});


// in jQuery form submit here is a demonstration of how to send a message
$("#sendWhatsApp").on("submit", function(e) {
    e.preventDefault();

    // emit the "message" event to send the message to the server
    socket.emit("message", {
        number: $(this).find("[name=number]").val(),
        message: $(this).find("[name=message]").val(),
    });
    
    // reset the form
    $("#sendWhatsApp")[0].reset();
});


// listen for message to be sent or seen
socket.on("message_ack", function (data) {
    console.log(data);
});
```
