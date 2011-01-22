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

var YouTubeVideo = new Class({
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

        // Set the player id if we have it.
        // Actually since now the youtube video is a class, it's
        // pretty useless to have this functionality. I'll decide
        // later whether to keep it or not.
        if (options.id) {
            swfUrl.setData({playerapiid: options.id}, true);
        }

        this.parent(swfUrl, options);

        // Fire the "playerReady" events when the player is ready.
        var self = this;
        window.onYouTubePlayerReady = function() {
            self.playerReady = true,
            self.fireEvent('playerReady');
        }

        // It is necessary to create a global function to handle the
        // API events, since the addEventListener function accepts
        // string function name as paramenter, and not actual
        // functions.        
        // HACKY CODE AHEAD
        var YTEventsHandler = new Class({
            listeners: new Object(),

            initialize: function() {
                for (var i in self.ytEvents) {
                    this.listeners[i] = new Array();
                }
            },

            addEvent: function(type, fn) {
                this.listeners[type] = this.listeners[type].concat([fn]);
            },
            
            fireEvent: function(type, arg) {
                // Call all the events
                for (var i = 0; i < this.listeners[type].length; i++) {
                    this.listeners[type][i](arg);
                }
            }
        });

        window.ytEventsHandler = new YTEventsHandler();
    },

    addEvent: function(type, fn) {
        if (this.ytEvents[type] != undefined) {
            // If the event is one of the events provided by the API,
            // add the event listener through the API function.
            window.ytEventsHandler.addEvent(type, fn);

            // Remember that one event can be listened at a time, so
            // the last event added will be listened.
            window.ytEventsHandlerListener = function(arg) {
                window.ytEventsHandler.fireEvent(type, arg);
            }

            this.enqueueAction('addEventListener', this.ytEvents[type],
                               'ytEventsHandlerListener');
        } else if (this.playerReady && type == 'playerReady') {
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
                this.object.loadVideoByUrl(idOrUrl, seconds, suggestedQuality);
            } else {
                this.object.cueVideoByUrl(idOrUrl, seconds, suggestedQuality);
            }

            // Set the quality
            this.setQuality(suggestedQuality);
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
        return this.object.isMuted();
    },

    setVolume: function(volume) {
        this.enqueueAction('setVolume', volume);
    },

    getVolume: function() {
        return this.object.getVolume();
    },


    // Changing player size

    setSize: function(width, height) {
        this.enqueueAction('setSize', width, height);
    },
    

    // Playback status

    getBytesLoaded: function() {
        return this.object.getVideoBytesLoaded();
    },

    getBytesTotal: function() {
        return this.object.getVideoBytesTotal();
    },

    getPlayerState: function() {
        return this.object.getPlayerState();
    },

    getCurrentTime: function() {
        return this.object.getCurrentTime();
    },

    
    // Playback quality

    getPlaybackQuality: function() {
        return this.object.getPlaybackQuality();
    },

    setPlaybackQuality: function(suggestedQuality) {
        this.suggestedQuality = suggestedQuality;
        
        this.enqueueAction('setPlaybackQuality', suggestedQuality);
    },

    getAvailableQualityLevels: function() {
        return this.object.getAvailableQualityLevels();
    },

    // Video info

    getDuration: function() {
        return this.object.getDuration();
    },

    getVideoUrl: function() {
        return this.object.getVideoUrl();
    },

    getVideoEmbedCode: function() {
        return this.getVideoEmbedCode();
    },

    //--------------------------------------------------------------------------
    // Utilities

    // This function is supposed to test id and urls only.
    isId: function(s) {
        // If it has a dot in it, it must be an url.
        return s.indexOf(".") == -1;
    }.protect()
});