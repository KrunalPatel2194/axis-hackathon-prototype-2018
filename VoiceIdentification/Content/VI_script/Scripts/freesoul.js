var loggedinIdentificationId="";
var Uname="";
var name="";
var email="";
var phone="";
var verificationProfileId="";
var vId="";
var thingsToRead = [
	"Act the way that the people around you are acting. This phrase might come in handy when you're traveling abroad notice that people do things differently than you're used to.",
	"If you have an enemy, pretend to be friends with them instead of openly fighting with them. That way you can watch them carefully and figure out what they're planning.",
	"When you try to do something great, you'll probably make a few people annoyed or angry. Don't worry about those people; just focus on the good results.",
	"When there are too many people trying to lead and give their opinions, it's confusing and leads to bad results. Jobs and projects should have one or two strong leaders.",
];

function enrollNewProfile(){
    $("#preloader").show();
    navigator.getUserMedia({audio: true}, function(stream){
        $('.loader--text').text('I\'m listening... just start talking for a few seconds...');
        //console.log('I\'m listening... just start talking for a few seconds...');
        $('.loader--text').text('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
        onMediaSuccess(stream, createProfile, 15);
    }, onMediaError);
}

function enrollNewVerificationProfile(){
    $("#preloader").show();
    navigator.getUserMedia({audio: true}, function(stream){
        $('.loader--text').text('I\'m listening... say one of the predefined phrases...');
        onMediaSuccess(stream, createVerificationProfile, 4);
    }, onMediaError);
}

function startListeningForIdentification(){
    profileidsString=profileIds.toString();
    if (profileIds.length > 0 ){
        $('.loader--text').text('I\'m listening... just start talking for a few seconds...');
        $('.loader--text').text('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
        navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, identifyProfile, 10)}, onMediaError);
    } else {
        $('.loader--text').text('No profiles enrolled yet! Click the other button...');
    }
}

function startListeningForVerification(){
    $("#preloader").show();
    //alert(vId);   
    if (vId){
        $('.loader--text').text('I\'m listening... say your predefined phrase...');
        navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, verifyProfile, 4)}, onMediaError);
    } else {
        $('.loader--text').text('No verification profile enrolled yet! opt for Online transaction First...');
        setTimeout(() => {$('#preloader').hide();}, 1000);
    }
}

function onMediaError(e) {
    console.error('media error', e);
}

function identifyProfile(blob){
    addAudioPlayer(blob);
    //console.log(profileidsString+"profileidsString");
    //var Ids = profileIds.map(x => x.profileId).join();
    const identify = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identify?identificationProfileIds=' + profileidsString + '&shortAudio=true';
  
    var request = new XMLHttpRequest();
    request.open("POST", identify, true);
	
    request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
  
    request.onload = function () {
        $('.loader--text').text('identifying profile');
        $('.loader--text').text(request.responseText);
        var location = request.getResponseHeader('Operation-Location');
        
        if (location!=null) {
            pollForIdentification(location);
        } else {
            console.log('Ugh. I can\'t poll, it\'s all gone wrong.');
        }
    };
  
    request.send(blob);
}

function verifyProfile(blob){
    addAudioPlayer(blob);

    var verify = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verify?verificationProfileId=' + vId;
  
    var request = new XMLHttpRequest();
    request.open("POST", verify, true);
	
    request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
  
    request.onload = function () {
        $('.loader--text').text('verifying profile');
        //$('.loader--text').text(request.responseText);
        var parsed = JSON.parse(request.responseText);
        if(parsed.result == "Accept")
        {
            $('.loader--text').text('Initiating Payment');
            setTimeout(() => {
                if($('#btn_pay').hasClass('btn_disabled'))
                {
                    $('#btn_pay').removeClass();
                    $('#btn_pay').addClass('btn_green')
                }
            }, 1000);
           
        }else{
            $('.loader--text').text('Transaction cannot be initiated! Pleasetry again');
            if($('#btn_pay').hasClass('btn_green'))
            {
                $('#btn_pay').removeClass();
                $('#btn_pay').addClass('btn_disabled')
            }
        }
       
        setTimeout(() => {$('#preloader').hide();}, 1000);
    };
  
    request.send(blob);
}

function createProfile(blob){
    addAudioPlayer(blob);

    var create = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles';

    var request = new XMLHttpRequest();
    request.open("POST", create, true);

    request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

    request.onload = function () {
        if($("#regrecord").hasClass("fa-play-circle-o"))
        {
            $("#regrecord").removeClass("fa-play-circle-o");
            $("#regrecord").addClass("fa-check-circle");

        }
        $('.loader--text').text('creating profile');
        $('.loader--text').text(request.responseText);

        var json = JSON.parse(request.responseText);
        var profileId = json.identificationProfileId;

        // Now we can enrol this profile using the profileId
        enrollProfileAudio(blob, profileId);
    };

    request.send(JSON.stringify({ 'locale' :'en-us'}));
}

function enrollProfileAudio(blob, profileId){
    const enroll = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles/'+profileId+'/enroll?shortAudio=true';

    var request = new XMLHttpRequest();
    request.open("POST", enroll, true);
  
    request.setRequestHeader('Content-Type','multipart/form-data');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

    request.onload = function () {
        $('.loader--text').text('enrolling');
        $('.loader--text').text(request.responseText);
        var location = request.getResponseHeader('Operation-Location');

        if (location!=null) {
            pollForEnrollment(location, profileId);
        } else {
            console.log('Ugh. I can\'t poll, it\'s all gone wrong.');
        }
    };

    request.send(blob);
}

function enrollProfileAudioForVerification(blob, profileId){
    addAudioPlayer(blob);
    verificationProfileId=profileId;
    if (profileId == undefined)
    {
        $('.loader--text').text('Verification enrollment already completed! Proceed for Transaction');
        //console.log("Failed to create a profile for verification; try again");
        setTimeout(() => {$('#preloader').hide();}, 1000);
        return;
    }
	
    const enroll = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles/'+profileId+'/enroll';
  
    var request = new XMLHttpRequest();
    request.open("POST", enroll, true);
	
    request.setRequestHeader('Content-Type','multipart/form-data');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
  
    request.onload = function () {
        $('.loader--text').text('enrolling');
        $('.loader--text').text(request.responseText);

        var json = JSON.parse(request.responseText);
        verificationProfile.remainingEnrollments = json.remainingEnrollments;
        if (verificationProfile.remainingEnrollments == 0) 
        {
            $('.loader--text').text('"Verification should be enabled!"');            
            setTimeout(() => {$('.loader--text').text('Registering for online transaction!');}, 1000);

            $.post("/Account/RecordVerificationIdTodb",
                       {
                           verificationId: verificationProfileId,
                           Id: uid
                       },
                       function(data, status){
                           if(data)
                           {
                               window.location = "http://localhost:65482/Account/Profile";
                           }else{
                               $('.loader--text').text("Enrollment failed | Please try again.");
                               setTimeout(() => {$('#preloader').hide();}, 1000);
                               setTimeout(() => {window.location = "http://localhost:65482/Account/Profile";}, 1000);
                           }
                          
                           
                       });
            setTimeout(() => {$('#preloader').hide();}, 1000);
        }else{
            enrollNewVerificationProfile();
        }
    };
  
    request.send(blob);
}


function pollForEnrollment(location, profileId){
    var success = false;
    var enrolledInterval;

    enrolledInterval = setInterval(function()
    {
        var request = new XMLHttpRequest();
        request.open("GET", location, true);

        request.setRequestHeader('Content-Type','multipart/form-data');
        request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

        request.onload = function()
        {
            $('.loader--text').text('getting status');
            //$('.loader--text').text(request.responseText);

            var json = JSON.parse(request.responseText);
            if (json.status == 'succeeded' && json.processingResult.enrollmentStatus == 'Enrolled')
            {
                clearInterval(enrolledInterval);
                $('.loader--text').text('enrollment complete!');
             //   var name = window.prompt('Who was that talking?');
                //profileIds.push(new Profile(name, profileId));
                //  $('.loader--text').text(profileId + ' is now mapped to ' + name);
                $.post("/Access/RecordIdentificationIdTodb",
                       {
                           identificationId: profileId,
                           Id: uId
                       },
                       function(data, status){
                           // alert("Data: " + data + "\nStatus: " + status);
                           $('.loader--text').text("Enrollment successful | redirecting you to login.");
                           setTimeout(() => {$('#preloader').hide();}, 1000);
                           setTimeout(() => {window.location = "http://localhost:65482/Access/Login";}, 1000);
                           
                       });
               
            }
            else if(json.status == 'succeeded' && json.processingResult.remainingEnrollmentSpeechTime > 0) {
                clearInterval(enrolledInterval);
                $('.loader--text').text('That audio wasn\'t long enough to use');
            }
            else 
            {			
                $('.loader--text').text('Not done yet..');
                $('.loader--text').text(json);
            }
        };

        request.send();
    }, 4000);
}

function pollForIdentification(location){
    var success = false;
    var enrolledInterval;

    enrolledInterval = setInterval(function()
    {
        var request = new XMLHttpRequest();
        request.open("GET", location, true);

        request.setRequestHeader('Content-Type','multipart/form-data');
        request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

        request.onload = function()
        {
            $('.loader--text').text('getting status');
            $('.loader--text').text(request.responseText);
           // alert(JSON.stringify(request.identifiedProfileId));
            var json = JSON.parse(request.responseText);
           //alert(json.processingResult.identifiedProfileId);

            if (json.status == 'succeeded' && json.processingResult.identifiedProfileId == loggedinIdentificationId)
            {
                clearInterval(enrolledInterval);
                var speaker = profileIds.filter(function(p){return p.profileId == json.processingResult.identifiedProfileId});
				
                if (speaker != null && speaker.length > 0){
                    $('.loader--text').text('I think ' + speaker[0].name + ' was talking');
                } else {
                    $('.loader--text').text('Logging you in...');
                    window.location = "z/Account/Profile";
                }
            }
            else 
            {			
                $('.loader--text').text('still thinking..');
                //console.log(json);
                $('.loader--text').text('Credentials mismatch ! not authorized');
                window.location = "http://localhost:65482/Access/Login";
            }
        };

        request.send();
    }, 2000);
}

function createVerificationProfile(blob){
    //alert(JSON.stringify(verificationProfile.profileId));
    if (verificationProfile && verificationProfile.profileId) 
    {
        if (verificationProfile.remainingEnrollments == 0)
        {   
            verificationProfileId=verificationProfile.profileId;
            $('.loader--text').text('Verification enrollment already completed');
            //console.log("Verification enrollment already completed");
            Showloader();
            return;
        } 
        else 
        {
            if(verificationProfile.remainingEnrollments>0)
            {
                $('.loader--text').text("Verification enrollments remaining: " + verificationProfile.remainingEnrollments);
            }
            else{
                $('.loader--text').text("Verification Failed ! wait & Speak again");
            }
            //console.log("Verification enrollments remaining: " + verificationProfile.remainingEnrollments);
            enrollProfileAudioForVerification(blob, verificationProfile.profileId);
            return;
        }
    }

    var create = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles';

    var request = new XMLHttpRequest();
    request.open("POST", create, true);
    request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

    request.onload = function () {
        var json = JSON.parse(request.responseText);
        var profileId = json.verificationProfileId;
        verificationProfile.profileId = profileId;

        // Now we can enrol this profile with the profileId
        enrollProfileAudioForVerification(blob, profileId);
    };

    request.send(JSON.stringify({ 'locale' :'en-us'}));
}

function BurnItAll(mode = 'identification'){
    // brute force delete everything - keep retrying until it's empty
    var listing = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/' + mode + 'Profiles';

    var request = new XMLHttpRequest();
    request.open("GET", listing, true);

    request.setRequestHeader('Content-Type','multipart/form-data');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

    request.onload = function () {
        var json = JSON.parse(request.responseText);
        for(var x in json){
            if (json[x][mode + 'ProfileId'] == undefined) {continue;}
            var request2 = new XMLHttpRequest();
            request2.open("DELETE", listing + '/'+ json[x][mode + 'ProfileId'], true);

            request2.setRequestHeader('Content-Type','multipart/form-data');
            request2.setRequestHeader('Ocp-Apim-Subscription-Key', key);
            request2.onload = function(){
                console.log(request2.responseText);
            };
            request2.send();
        }
    };

    request.send();
}

    function addAudioPlayer(blob){	
        var url = URL.createObjectURL(blob);
        var log = document.getElementById('log');

        var audio = document.querySelector('#replay');
        if (audio != null) {audio.parentNode.removeChild(audio);}

        audio = document.createElement('audio');
        audio.setAttribute('id','replay');
        audio.setAttribute('controls','controls');

        var source = document.createElement('source');
        source.src = url;

        audio.appendChild(source);
        //log.parentNode.insertBefore(audio, log);
    }

    // found on SO: vanilla javascript queystring management
    var qs = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));
    // to get all profile for identification
    function getAllProfileForIdentification(){
        $("#preloader").show();
        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles",
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",key);
            },
            type: "GET"
        })
           .done(function(data) {
               // alert("success"+ JSON.stringify(data.length));
              // $("#wait1").css("display", "block");
               var count;
               for (count = 0; count < data.length; count++) { 
                   profileIds.push(data[count]["identificationProfileId"]);
               }
               //console.log(profileIds +"from getall profile");
               startListeningForIdentification();
           })
           .fail(function() {
               alert("error");
           });
    }
    var key='da24ac3f4a0341c895f6b19ec5c7758c';
    var Profile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId;}};
    var VerificationProfile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId; this.remainingEnrollments = 3}};
    var profileIds = [];
    var profileidsString="";
    var verificationProfile = new VerificationProfile();

   