/* Class to create you tube video */

var YouTubeVideo = new Class({
    Extends: Swiff,
    Implements: Events,
    // Options
    options: {
        id: null,
        quality: 'default',
        embedded: true
    },
    // The default url
    chromelessUrl: new URI("http://www.youtube.com/apiplayer").setData({
        enablejsapi: 1,
        version: 3
    }),
    embeddedUrl: new URI("http://www.youtube.com/v/").setData({
        enablejsapi: 1,
        version: 3
    }),
    
    initialize: function(options) {
        var self = this;

        var swfUrl;
        if (true) {
            var swfUrl = this.embeddedUrl;
            swfUrl.set('directory', swfUrl.get('directory') + options.videoId);
        } else {
            var swfUrl = this.chromelessUrl.setData({
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

// Random stuff for debugging
window.addEvent('domready', function() {
    var video = new YouTubeVideo({
        width: 425,
        height: 356,
        videoId: 'u1zgFlCw8Aw',
        id: 'ytvideo'
    });

    $('ytplayer').empty();
    $('ytplayer').grab(video);

    $('ytplayer').addEvent('click', function() {
        video.pauseVideo();
    });
});