var nodemailer = require('nodemailer');

var Twitter = require('twitter');

console.log('consumer_key= '        + process.env.consumer_key);
console.log('consumer_secret= '     + process.env.consumer_secret);
console.log('access_token_key= '    + process.env.access_token_key);
console.log('access_token_secret= ' + process.env.access_token_secret);
console.log('screen_name= '         + process.env.screen_name);


function main ()
{
	 
	var client = new Twitter({
	  consumer_key         : process.env.consumer_key,
	  consumer_secret      : process.env.consumer_secret,
	  access_token_key     : process.env.access_token_key,
	  access_token_secret  : process.env.access_token_secret
	});
	 
	var params = {screen_name: process.env.screen_name };
	client.get('statuses/home_timeline', params, function(error, tweets, response){
	  if (!error) {
	  	 sendit(tweets);  // now generate a mail from it 
	  }
	  if (error) {
	  	console.log(error);	
	  }
	});
}

//------------------------------- Send mail --------------------------


function sendit (twitts)
{
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'twittermaildigest@gmail.com',
            pass: 'userpass83247HJK'
        }
    });

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    var ts_hms = new Date;

    var  htmlbody ;

    htmlbody ='<b> items ' +twitts.length +'</b>'
    htmlbody+='<table style="width:100%" border="1">'

    twitts.forEach(function additemtomail(t){
        htmlbody+='<tr>'
        htmlbody+='<td><img src="' +t.user.profile_image_url +'" style="width:32px;height:32px;"></td> '
        htmlbody+='<td>'+ t.text + '</td>';
    
        htmlbody+='</tr>';
    }) ; 
    htmlbody+='</table>';

     console.log(htmlbody);
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'twittermaildigest@gmail.com ✔ <twittermaildigest@gmail.com>', // sender address
        to: 'neatsunz@gmail.com', // list of receivers
        subject: 'Twitter Mail Digest ✔'+ts_hms.toISOString(), // Subject line
        text: 'items' +twitts.length, // plaintext body
        html: htmlbody
    };




    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);

    });
}


//---------------------------------------  run ----------------------

main();  			// run once 

setInterval(function(){
  main();
}, 1000*60*60*24 );  // now  run every 24 hours 


console.log("next call is in next 24 Hours ");
