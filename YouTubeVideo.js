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
    
    initialize: function(options) {
        var self = this;

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

        // Set the player id if we have it
        if (options.id) {
            swfUrl.setData({playerapiid: options.id}, true);
        }

        this.parent(swfUrl, options);

        // Fire the "playerReady" events when the player is ready.
        window.onYouTubePlayerReady = function(playerapiid) {
            self.fireEvent('playerReady', playerapiid);
        }
    },

});