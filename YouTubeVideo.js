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
        quality: 'default',
        embedded: true
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
    },

    enqueueVideoAction: function(fn) {
        // Pop the first argument, which would be the function
        var args = Array.from(arguments);
        args.shift();

        if (this.playerReady) {
            fn.apply(this.object, args);
        } else {
            // If the player isn't ready yet, add an event to fire the
            // requested function with the requested arguments when it
            // will be ready.
            var self = this;
            this.addEvent('playerReady', function() {
                fn.apply(self.object, args);
            });
        }
    },

    playVideo: function() {
        this.enqueueVideoAction(this.object.playVideo);
    },

    pauseVideo: function() {
        this.enqueueVideoAction(this.object.pauseVideo);
    },

    seekTo: function(seconds, seekAhead) {
        this.enqueueVideoAction(this.object.seekTo, seconds, seekAhead);
    },
});