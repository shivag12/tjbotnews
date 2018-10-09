var TJBot = require('tjbot');
var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');


var discovery = new DiscoveryV1({
    username: 'ba47b73f-da1e-4cbc-8b26-cecda3a3c658',
    password: '0Bhr0c40tM4L',
    version_date: DiscoveryV1.VERSION_DATE_2017_09_01
});

var nlu = new NaturalLanguageUnderstandingV1({
    username: '32da486f-3ef3-454c-85d3-b7d2850ad65a',
    password: 'qbqJaUmqUyeR',
    version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
});


var hardware = ['speaker','microphone'];
var credentials = {
    speech_to_text: {
        username: "No UserName",
        password: "No Password"
    },
    text_to_speech: {
        username: 'f7011eb2-9b0f-48b1-8237-6816cceca67d',
        password: 'npf4eNaszcak'
    }

}


var configuration = {
    robot: {
        gender: 'male',
	name : 'watson'
    },
    log : {
	level : 'silly'
    },
    speak: {
        language: 'en-US',
	speakerDeviceId: "plughw:0,0"
    },
    listen: {
        microphoneDeviceId: 'plughw:1,0'
    }

};

var tj = new TJBot(hardware,configuration,credentials);


tj.listen(function (data) {
    console.log(data);
    if (data.results.length === 0) {
        console.log('Error : Audio data is being streamed too fast..!!');
    } else {
        var msg = data.results[0].alternatives[0].transcript;

        if (msg.startsWith("Thomas") || msg.startsWith("thomas") || msg.startsWith(" Thomas")) {
            console.log('FACERECOG : Pausing the listening');
            tj.pauseListening();
            var msg_stt = msg.replace("Thomas", "");
            console.log(msg_stt);
            naturalAndDiscoveryService(msg_stt);
            //conversationmessage(msg_stt);
            tj.resumeListening();
        }
    }
})

function naturalAndDiscoveryService(msg){
    nlu.analyze(
    {
        html: msg, // Buffer or String
        features: {
            entities: {},
            keywords: {}
        }
    },
    function (err, response) {
        if (err) {
            console.log('error:', err);
        } else {
            console.log(JSON.stringify(response, null, 2));
            var query = null; 
            if(response.keywords.length != 0){
                if (response.entities.length === 0) {
                    if (response.keywords.length > 1) {
                        console.log(response.keywords[0].text + ' ' + response.keywords[1].text);
                        query = response.keywords[0].text + ' ' + response.keywords[1].text;
                    } else {
                        query = response.keywords[0].text;
                    }

                } else {
                    query = response.entities[0].text;
                }
                discovery.query({
                    environment_id: 'system',
                    collection_id: 'news-en',
                    query: query // Set the topic from the context.
                    //filter: filter.remove('').join(',') // Join the filter into a string after removing blank elements.
                }, function (err, discoveryResponse) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(discoveryResponse.results[0].title + ', ' + discoveryResponse.results[1].title);
                        tj.speak(discoveryResponse.results[0].title + ', ' + discoveryResponse.results[1].title);
                    }
                })

            } else {
                console.log("Sorry couldn't understand.");   
                tj.speak("Sorry couldn't understand.");
            }
        }
    }
  );
}