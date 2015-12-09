var nodemailer = require('nodemailer');
 
var Twitter = require('twitter');

console.log('consumer_key= '        + process.env.consumer_key);
console.log('consumer_secret= '     + process.env.consumer_secret);
console.log('access_token_key= '    + process.env.access_token_key);
console.log('access_token_secret= ' + process.env.access_token_secret);
console.log('screen_name= '         + process.env.screen_name);

console.log('gmail_sender_email= '  + process.env.gmail_sender_email);
console.log('gmail_sender_pass= '   + process.env.gmail_sender_pass);
console.log('send_digest_to_email= '+ process.env.send_digest_to_email);


function main ()
{
     
    var client = new Twitter({
      consumer_key         : process.env.consumer_key,
      consumer_secret      : process.env.consumer_secret,
      access_token_key     : process.env.access_token_key,
      access_token_secret  : process.env.access_token_secret
    });
     
    var params = {screen_name: process.env.screen_name,
    count: 200};
    client.get('statuses/home_timeline', params, function(error, tweets, response){
      if (!error) {
         sendit(build_mail_content(tweets),tweets.length);  // now generate a mail from it 
      }
      if (error) {
        console.log(error); 
      }
    });
}

//------------------------------- Send mail --------------------------
function build_mail_content (twitts)
{

 var  htmlbody ;

    htmlbody ='<b> items ' +twitts.length +'</b>'
    htmlbody+='<table style="width:100%" border="1">'

    twitts.forEach(function additemtomail(t){
        htmlbody+='<tr>'
        htmlbody+='<td><img src="' +t.user.profile_image_url +'" style="width:32px;height:32px;"></td> '
        htmlbody+='<td>'+ t.text ;
    
        
        console.log(t);
        mda=t.entities.media;
        if (typeof(mda) != "undefined"){
            console.log(">>>>>>>>");
            mda.forEach(function prnt(tt){
                    console.log(tt);
                    console.log("-----"+tt.sizes.small.w);
                    htmlbody+='<img src="' +tt.media_url +'" style="width:'+tt.sizes.small.w+'px;height:'+tt.sizes.small.h+'px;"> '
            });
            console.log("<<<<<");
        }

         htmlbody+='</td></tr>';

    }) ; 
    htmlbody+='</table>';

     console.log(htmlbody);

    return  htmlbody;
}

function sendit (html_body,item_count)
{

    console.log("******************"+ item_count);
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.gmail_sender_email,
            pass: process.env.gmail_sender_pass
        }
    });

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    var ts_hms = new Date;

   
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'twittermaildigest@nomail.com ✔ <twittermaildigest@nomail.com>', // sender address
        to: process.env.send_digest_to_email, // list of receivers
        subject: 'Twitter Mail Digest ✔'+ts_hms.toISOString(), // Subject line
        text: 'items' +item_count, // plaintext body
        html: html_body
    };


console.log(mailOptions);

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        console.log("------------wait 6 Hours");

    });
}


//---------------------------------------  run ----------------------

main();             // run once 

setInterval(function(){
  main();
}, 1000*60*60*6 );  // now  run every 24 hours 


