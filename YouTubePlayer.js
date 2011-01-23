/*
  ---

  script: YouTubeVideo.js

  description: Wrapper to the YouTube JavaScript APIs.

  license: GPLv2

  authors:
  - Francesco Mazzoli <f@mazzo.li>

  requires:
  - core:1.3
  - more:1.3/URI

  provides: [YouTubeVideo]
  
  ...
*/

// This class uses the following global variables, and it won't work
// if you override them:
// - window.onYouTubePlayerReady: a function required by the YouTube
//   APIs, that is called when the player is ready.
// - window.youTubePlayerCounter: keeps track of how many videos we have.
// - window.youTubePlayers: keeps all the istances of the class in a object.
var YouTubePlayer = new Class({
    Extends: Swiff,
    Implements: Events,

    // Options
    options: {
        id: null,
        suggestedQuality: 'default',
        embedded: true
    },

    // The events available, mapped to the api events
    ytEvents: {
        stateChange: 'onStateChange',
        playbackQualityChange: 'onPlaybackQualityChange',
        error: 'onError'
    },
    
    // The default URIs
    chromelessURI: new URI("http://www.youtube.com/apiplayer").setData({
        enablejsapi: 1,
        version: 3
    }),
    embeddedURI: new URI("http://www.youtube.com/v/").setData({
        enablejsapi: 1,
        version: 3
    }),

    // Records if the player is ready or not
    playerReady: false,
    
    initialize: function(options) {
        this.setOptions(options);
        options = this.options;

        var swfUrl;
        if (options.embedded) {
            var swfUrl = this.embeddedURI;
            swfUrl.set('directory', swfUrl.get('directory') + options.videoId);
        } else {
            var swfUrl = this.chromelessURI.setData({
                video_id: options.videoId,
            }, true);            
        }

        // Set a unique number for the video, so that we can recognise
        // it when onYouTubePlayerReady gets called.
        if (window.youTubePlayerCounter == undefined) {
            window.youTubePlayerCounter = this.uniqueId = 0;
        } else {
            window.youTubePlayerCounter++;
            this.uniqueId = window.youTubePlayerCounter;
        }
        if (options.id) {
            swfUrl.setData({playerapiid: this.uniqueId}, true);
        }

        // Call swiff
        this.parent(swfUrl, options);

        var self = this;
        // We create an object with the videos, with the uniqueId as
        // an index.
        if (window.youTubePlayers == undefined) {
            window.youTubePlayers = new Object();
        }
        window.youTubePlayers[self.uniqueId.toString()] = self;

        // Fire the "playerReady" events when the player is ready.
        window.onYouTubePlayerReady = function(id) {
            youTubePlayers[id].playerReady = true,
            youTubePlayers[id].fireEvent('playerReady');
        }


        // Fire the yt api events
        for (var i in this.ytEvents) {
            var fn = 'window.youTubePlayers[' + this.uniqueId +
                '].fireEventFunction("' + i + '")';
            this.enqueueAction('addEventListener', this.ytEvents[i], fn);
        }

    },

    
    //--------------------------------------------------------------------------
    // Class internals...

    addEvent: function(type, fn) {
        if (this.playerReady && type == 'playerReady') {
            // If the event is playerReady and the player is ready,
            // simply execute the function.
            fn();
        } else {
            // Otherwise, fall back to the default addEvent method.
            Events.prototype.addEvent.call(this, type, fn);
        }
    },
            
    // This function enqueues functions to be executed when the player
    // is ready
    enqueueAction: function(fnName) {
        // Pop the first argument, which is the function name
        var args = Array.from(arguments);
        args.shift();

        if (this.playerReady) {
            this.object[fnName].apply(this.object, args);
        } else {
            // If the player isn't ready yet, add an event to fire the
            // requested function with the requested arguments when it
            // will be ready.
            var self = this;
            this.addEvent('playerReady', function() {
                self.enqueueAction.apply(self, [fnName].concat(args));
            });
        }
    },

    // This function is to use with functions that are supposed to
    // return something. It will return null if the player is not
    // ready, or what the action should return if the player is ready.
    maybeAction: function(fnName) {
        // Pop the first argument, which is the function name
        var args = Array.from(arguments);
        args.shift();

        if (this.playerReady) {
            return this.object[fnName].apply(this.object, args);
        } else {
            return null;
        }
    },

    // We need this function so that we can return a global function
    // for the state changes
    fireEventFunction: function(type) {
        var self = this;
        return function() {
            self.fireEvent.apply(self, [type].concat(arguments));
        }
    },

    get: function(attribute) {
        return this.object.get(attribute);
    },

    set: function(attribute, value) {
        this.object.set(attribute, value);
    },


    //--------------------------------------------------------------------------
    // Queueing functions


    loadVideo: function(idOrUrl, seconds, play, suggestedQuality) {
        // If no quality is specified, use the one specified when
        // creating the object
        if (!suggestedQuality) {
            suggestedQuality = this.suggestedQuality;
        }

        var fnName;

        
        if (this.isId(idOrUrl)) {
            // If the play paramenter is not present, default to load
            if (play === undefined || play) {
                this.object.loadVideoById(idOrUrl, seconds, suggestedQuality);
            } else {
                this.object.cueVideoById(idOrUrl, seconds, suggestedQuality);
            }
        } else {
            if (play === undefined || play) {
                this.object.loadVideoByUrl(idOrUrl, seconds);
            } else {
                this.object.cueVideoByUrl(idOrUrl, seconds);
            }

            // Set the quality
            this.setPlaybackQuality(suggestedQuality);
        }
    },

    cueVideo: function(idOrUrl, seconds, quality) {
        this.loadVideo(idOrUrl, seconds, false, quality);
    },

    
    //--------------------------------------------------------------------------
    // Playback controls and player settings


    // Playing videos

    playVideo: function() {
        this.enqueueAction('playVideo');
    },

    pauseVideo: function() {
        this.enqueueAction('pauseVideo');
    },

    stopVideo: function() {
        this.enqueueAction('stopVideo');
    },

    seekTo: function(seconds, seekAhead) {
        this.enqueueAction('seekTo', seconds, seekAhead);
    },

    clearVideo: function() {
        this.enqueueAction('clearVideo');
    },


    // Changing volume

    mute: function() {
        this.enqueueAction('mute');
    },

    unMute: function() {
        this.enqueueAction('unMute');
    },
    
    isMuted: function() {
        return this.maybeAction('isMuted');
    },

    setVolume: function(volume) {
        this.enqueueAction('setVolume', volume);
    },

    getVolume: function() {
        return this.maybeAction('getVolume');
    },


    // Changing player size

    setSize: function(width, height) {
        this.set('width', width);
        this.set('height', height);
    },
    

    // Playback status

    getVideoBytesLoaded: function() {
        return this.maybeAction('getVideoBytesLoaded');
    },

    getVideoBytesTotal: function() {
        return this.maybeAction('getVideoBytesTotal');
    },

    getVideoStartBytes: function() {
        return this.maybeAction('getVideoStartBytes');
    },

    getPlayerState: function() {
        return this.maybeAction('getPlayerState');
    },

    getCurrentTime: function() {
        return this.maybeAction('getCurrentTime');
    },

    
    // Playback quality

    getPlaybackQuality: function() {
        return this.maybeAction('getPlaybackQuality');
    },

    // Array that stores all the functions to change the quality, so
    // that we have a reference to delete them from the events
    playbackQualityEvents: new Array(),

    setPlaybackQuality: function(suggestedQuality) {
        // If the player is "playing" or "paused", change the
        // quality. If it isn't, wait until the state changes and try
        // again.

        var self = this;
        if (this.getPlayerState() == 1 || this.getPlayerState() == 2) {
            this.suggestedQuality = suggestedQuality;
            
            this.enqueueAction('setPlaybackQuality', suggestedQuality);

            // Remove all the events
            this.playbackQualityEvents.each(function(fn) {
                self.removeEvent('stateChange', fn);
            });
        } else {
            var fn = function() {
                self.setPlaybackQuality(suggestedQuality);
            };
            // Add the function to the list of functions
            this.playbackQualityEvents = this.playbackQualityEvents.concat([fn]);
            this.addEvent('stateChange', fn);
        }
    },
    
    getAvailableQualityLevels: function() {
        return this.maybeAction('getAvailableQualityLevels');
    },

    // Video info

    getDuration: function() {
        return this.maybeAction('getDuration');
    },

    getVideoUrl: function() {
        return this.maybeAction('getVideoUrl');
    },

    getVideoEmbedCode: function() {
        return this.maybeAction('getVideoEmbedCode');
    },

    //--------------------------------------------------------------------------
    // Utilities

    // This function is supposed to test id and urls only.
    isId: function(s) {
        // If it has a dot in it, it must be an url.
        return s.indexOf(".") == -1;
    }.protect()
});

YouTubePlayer.qualities = ['default',
                           'small',
                           'medium',
                           'large',
                           'hd720',
                           'hd1080'
                          ];

YouTubePlayer.states = {
    '-1': 'unstarted',
    '0':  'ended',
    '1':  'playing',
    '2':  'paused',
    '3':  'buffering',
    '5':  'video cued'
};