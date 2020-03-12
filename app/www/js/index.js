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

const url = "0.0.0.0";
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

    // debuggin
    console.log("Hello yes am recording...");
    // using cordova-plugin-media and cordova-plugin-file
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        console.log('file system open: ' + fs.name);
        let fileName = fs.root.fullPath + "audio1984-" + id +(device.platform == "Android" ? ".aac" : ".mp3");
        console.log("file name: " + fileName);
        
        fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
            console.log("fileEntry is file? " + fileEntry.isFile.toString());
            // fileEntry.name == 'someFile.txt'
            // fileEntry.fullPath == '/someFile.txt'
            writeFile(fileEntry, new Blob([''], { type: "audio/mpeg" }));

            // create media and record
            let media = Media(fileName, 
                function() {
                    console.log("Audio file created successfully!");
                    console.log("Media object: " + media);
                    /*
                    media.startRecord();
                    // we record for 7 seconds for testing
                    await sleep(7000);
                    media.stopRecord();
                    media.release();
                    */
                },
                function(err) {
                    console.log("Audio file created unsuccessfully... (" + err + ")");
                });
            },
            function(_) {
                console.log("FILE ERROR!");
            });
    }, function(_) {
        console.log("FS ERROR!");
        });

    // send the file with Ajax
    /*
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", url + "?id=" + id);
    xhr.setRequestHeader("Content-type", "audio/mpeg");
    xhr.onload = function(e) {
        document.getElementById("status").innerTex = e.target.responseText;
    }
    xhr.send(new File("audio1984/audio-" + id + ".mp3"));
    */
    // debuggin again
    console.log("sent file!")
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
    }

};

app.initialize();