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

    //--------------------------------------------------------------------------
    // Queueing functions


    loadVideo: function(idOrUrl, seconds, play, quality) {
        // If no quality is specified, use the one specified when
        // creating the object
        if (!quality) {
            quality = this.quality;
        }

        var fnName;

        
        if (this.isId(idOrUrl)) {
            // If the play paramenter is not present, default to load
            if (play === undefined || play) {
                this.object.loadVideoById(idOrUrl, seconds, quality);
            } else {
                this.object.cueVideoById(idOrUrl, seconds, quality);
            }
        } else {
            if (play === undefined || play) {
                this.object.loadVideoByUrl(idOrUrl, seconds, quality);
            } else {
                this.object.cueVideoByUrl(idOrUrl, seconds, quality);
            }

            // Set the quality
            this.setQuality(quality);
        }
    },

    cueVideo: function(idOrUrl, seconds, quality) {
        this.loadVideo(idOrUrl, seconds, false, quality);
    },

    
    //--------------------------------------------------------------------------
    // Playback controls and player settings

    play: function() {
        this.object.playVideo();
    },

    pause: function() {
        this.object.pauseVideo();
    },

    stop: function() {
        this.object.stopVideo();
    },

    seek: function(seconds, seekAhead) {
        this.object.seekTo(seconds, seekAhead);
    },

    clear: function() {
        this.object.clearVideo();
    },

    //--------------------------------------------------------------------------
    // Player volume
    
    
    
    //--------------------------------------------------------------------------
    // Utilities

    // This function is supposed to test id and urls only.
    isId: function(s) {
        // If it has a dot in it, it must be an url.
        return s.indexOf(".") == -1;
    }.protect()
});