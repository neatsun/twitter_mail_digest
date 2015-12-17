//----------------------------------------------------------------------------------------------------------------------------------\\
//  ______     __  __     ______     ______     ______        ______   __     __     __     ______   ______   ______     ______     \\
// /\  ___\   /\ \_\ \   /\  == \   /\  ___\   /\  == \      /\__  _\ /\ \  _ \ \   /\ \   /\__  _\ /\__  _\ /\  ___\   /\  == \    \\
// \ \ \____  \ \____ \  \ \  __<   \ \  __\   \ \  __<      \/_/\ \/ \ \ \/ ".\ \  \ \ \  \/_/\ \/ \/_/\ \/ \ \  __\   \ \  __<    \\
//  \ \_____\  \/\_____\  \ \_____\  \ \_____\  \ \_\ \_\       \ \_\  \ \__/".~\_\  \ \_\    \ \_\    \ \_\  \ \_____\  \ \_\ \_\  \\
//   \/_____/   \/_____/   \/_____/   \/_____/   \/_/ /_/        \/_/   \/_/   \/_/   \/_/     \/_/     \/_/   \/_____/   \/_/ /_/  \\
//----------------------------------------------------------------------------------------------------------------------------------\\
                                                                                                                               


// master mode

var nodemailer = require('nodemailer');
var Twitter    = require('twitter');

/* // for Debug of Env.:
    console.log('consumer_key= '        + process.env.consumer_key);
    console.log('consumer_secret= '     + process.env.consumer_secret);
    console.log('access_token_key= '    + process.env.access_token_key);
    console.log('access_token_secret= ' + process.env.access_token_secret);
    console.log('screen_name= '         + process.env.screen_name);

    console.log('gmail_sender_email= '  + process.env.gmail_sender_email);
    console.log('gmail_sender_pass= '   + process.env.gmail_sender_pass);
    console.log('send_digest_to_email= '+ process.env.send_digest_to_email);
*/

//---------------------------------  Main : init params and call get twitts ------------------------
function main ()
{
    var client = new Twitter({
      consumer_key         : process.env.consumer_key,
      consumer_secret      : process.env.consumer_secret,
      access_token_key     : process.env.access_token_key,
      access_token_secret  : process.env.access_token_secret
    });

    var params=  {screen_name: process.env.screen_name,  count: 200};
    var fulltweets=[];

  //------------------------------------ Get twitter data ---------------------------------
    function get_twitts()
    {
        console.log ("---get twitter with :" +JSON.stringify(params));

        client.get('statuses/home_timeline', params, function(error, tweets, response){
            if (!error) {           //-------------- got first 200 tweets 

                if (tweets.length>1)
                {
                    var last_tweet=tweets[tweets.length-1];
                    
                    fulltweets=fulltweets.concat(tweets);
                    
                    console.log("last tweet time "+last_tweet + " out of "+ tweets.length);
                            
                    var difff= Date.now() - Date.parse(last_tweet.created_at);
                                // console.log("diff " +difff + " vs " + 1000*60*60*24);  // debug itteration till we get 24 H
                    if (difff <1000*60*60*24)  // check we have all that was tweeted in the past 24 Hours 
                     {
                        console.log("we are not done- now get more twitts ");
                        params = {screen_name: process.env.screen_name,  count: 200, max_id:last_tweet.id };  //get from last tweet we got 
                        get_twitts();
                     }
                    else
                    {
                        console.log("we are done!!! -> sending to mail size:"+fulltweets.length);
                        
                        sendit(build_mail_content(fulltweets),fulltweets.length);  // now generate a mail from it 
                    }
                }
                else
                {
                        console.log("we are done(no more tweets )!!! -> sending to mail size:"+fulltweets.length);
                        
                        sendit(build_mail_content(fulltweets),fulltweets.length);  // now generate a mail from it 
                }
            }
            if (error) { // probably couldnt login or over quota 
                console.log("Error getting twitter home : " + JSON.stringify(error)); 
            }

        });
    }

    get_twitts(); // run for the first time 
}




//------------------------------- Send mail --------------------------
function build_mail_content (twitts)
{

 var  htmlbody ;

    htmlbody ='<b> items ' +twitts.length +'</b>'
    htmlbody+='<table style="width:100%" border="1">'
    var counter=0;
    var langtext ;

    twitts.forEach(function additemtomail(t){
        counter++;
        htmlbody+='<tr>'

        if (t.user.lang!="en")
           langtext= '<br>('+t.user.lang+')';
        else
            langtext="";

        htmlbody+='<td style="width:36px">'+counter+'<br><img src="' +t.user.profile_image_url +'" style="width:32px;height:32px;"><br>'+ t.user.name+langtext+'</td>'  ;
        htmlbody+='<td>'+ t.text ;
    
        
     //   console.log(t);
        mda=t.entities.media;
        if (typeof(mda) != "undefined"){
            
            mda.forEach(function prnt(tt){
                       
                    htmlbody+='<img src="' +tt.media_url +'" style="width:'+tt.sizes.small.w+'px;height:'+tt.sizes.small.h+'px;"> '
            });
            
        }

         htmlbody+='</td></tr>';

    }) ; 
    htmlbody+='</table>';

   //  console.log(htmlbody);
     console.log("----- End building HTml -----");
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


//console.log(mailOptions);

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

console.log("------------start");
main();             // run once 

setInterval(function(){
  main();
}, 1000*60*60*6 );  // now  run every 24 hours 


