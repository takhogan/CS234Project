/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const url = "localhost:5000";
const sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function writeFile(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            readFile(fileEntry);
        };
        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
}

function readFile(fileEntry) {
    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            console.log("Successful file read: " + this.result);
            // displayFileData(fileEntry.fullPath + ": " + this.result);
        };
        reader.readAsText(file);

    }, function(_) {
        console.log("READ ERROR!");
    });
}

function collectEnv() {
    // reset status
    document.getElementById("status").innerText = "";
    
    // create a recording id
    let id = Math.floor(Math.random() * 10000).toString();
    document.getElementById("debugWindow").innerText = id;

    // using cordova-plugin-media and cordova-plugin-file
    
    let filePath = "media/1984audio-holder." + (device.platform == "Android" ? "m4a" : "mp3");
    console.log(filePath);
    document.getElementById("debugWindow").innerText = filePath; 
    let media = new Media(filePath,
    () => { console.log("successful media load!"); }, (e) => { 
        console.log("Media error: " + e);
        document.getElementById("debugWindow").innerText = "Media error: " + e; 
    });
    
    if (media != null) {
        console.log("Hello yes am recording...");
        document.getElementById("debugWindow").innerText = "Hello yes am recording...";
    }
    media.startRecord();
    let flag = false;

    setTimeout(function() {
        media.stopRecord();
        document.getElementById("debugWindow").innerText = "Done recording!";
        flag = true;

        // send the file with Ajax
        // this is here because we want it to run
        // synchronously
        // JS is annoying
        let xhr = new XMLHttpRequest();
        xhr.open("PUT", url /*+ "?id=" + id*/);
        xhr.setRequestHeader("Content-type", "audio/mpeg");
        xhr.onload = function(e) {
            document.getElementById("status").innerTex = e.target.responseText;
        }
        xhr.send(new File(filePath));
        // debuggin again
        console.log("sent environment!");
        document.getElementById("debugWindow").innerText = "sent environment " + id + "!";
    }, 10000);
}

// clear all audio files on pause
function onPause() {
    console.log("Application paused.");
}

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener('pause', onPause, false);
        document.getElementById("refresh").addEventListener("click", collectEnv);
    },
    
    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    status: {
        0: "MEDIA_NONE",
        1: "MEDIA_STARTING",
        2: "MEDIA_RUNNING",
        3: "MEDIA_PAUSED",
        4: "MEDIA_STOPPED",
    },

    err: {
        0: "MEDIA_SUCCESS",
        1: "MEDIA_ERR_ABORTED",
        2: "MEDIA_ERR_NETWORK",
        3: "MEDIA_ERR_DECODE",
        4: "MEDIA_ERR_NONE_SUPPORTED"
    }
};

app.initialize();