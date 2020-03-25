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

const url = "http://10.150.83.3:9966/upload";
const sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkIfFileExists(path){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        fileSystem.root.getFile(path, { create: false }, fileExists, fileDoesNotExist);
    }, getFSFail); //of requestFileSystem
}
function fileExists(fileEntry){
    alert("File " + fileEntry.fullPath + " exists!");
}
function fileDoesNotExist(){
    alert("file does not exist");
}
function getFSFail(evt) {
    console.log(evt.target.error.code);
}

function createDirectory(rootDirEntry, dirName) {
    rootDirEntry.getDirectory(dirname, { create: true }, (entry) => { }, onErrorGetDir);
}

function createFile(dirEntry, fileName, isAppend) {
    // Creates a new file or returns the file if it already exists.
    dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {

        writeFile(fileEntry, null, isAppend);

    }, onErrorCreateFile);

}

function onErrorGetDir(e) {
    document.getElementById("debugWindow").innerText = e;
}

function onErrorCreateFile(e) {
    document.getElementById("debugWindow").innerText = e;
}

function collectEnv() {    
    // create a recording id
    let id = Math.floor(Math.random() * 10000).toString();
    document.getElementById("debugWindow").innerText = id;

    // using cordova-plugin-media and cordova-plugin-file
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(entry) {
        let filePrefix = entry.toURL();

        // create new file should error if already exists
        createDirectory(entry, "media");
        createFile(entry, "media/1984." + (device.platform === "Android" ? "m4a" : "mp3"));


        console.log("fs " + filePrefix);
        let filePath = "/" + filePrefix + "media/1984." + (device.platform === "Android" ? "m4a" : "mp3");
        console.log(filePath);
        document.getElementById("debugWindow").innerText = filePath;

        // record here
        let media = new Media(filePath,
        () => { console.log("successful media load!"); }, (e) => { 
            console.log("Media error: " + e);
            document.getElementById("debugWindow").innerText = "Media error: " + e;
            return;
        });
        
        if (media != null) {
            console.log("Recording...");
            document.getElementById("debugWindow").innerText = filePath;
        }
        media.startRecord();
    
        setTimeout(function() {
            media.stopRecord();
            document.getElementById("debugWindow").innerText = "Done recording!";

            cordova.plugin.http.uploadFile(url, { "id": id }, { Authorization: 'OAuth2: token' }, filePath, "file",
            function(response) {
                console.log("sent environment! " + response.status);
                document.getElementById("debugWindow").innerText = "sent environment " + id + "! (" +
                response.status + ")";
                document.getElementById("environment").innerText = response.data;
            }, function(response) {
                console.error(response.error);
                document.getElementById("debugWindow").innerHTML = response.error;
            });
        }, 3000);
    }, function(err) {
        console.log("kill me");
        console.log(err);
        document.getElementById("debugWindow").innerText = err;
    });
}

// clear all audio files on pause
function onPause() {
    console.log("Application paused.");
}

// this apparently handles accelerometer data
function handleOrientation(event) {
    var absolute = event.absolute;
    var alpha    = event.alpha;
    var beta     = event.beta;
    var gamma    = event.gamma;
  
    // Do stuff with the new orientation data
    console.log(absolute + " " + alpha + " " + beta + " " + gamma);
  }

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener('pause', onPause, false);
        document.addEventListener("deviceorientation", handleOrientation, true);
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