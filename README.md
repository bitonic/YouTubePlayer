# YouTubePlayer

Simple [MooTools](http://mootools.net/ "MooTools") class with the aim
to provide a simple interface to the [YouTube player
API](http://code.google.com/apis/youtube/js_api_reference.html
"YouTube JS API reference"), built on top of the Swiff class.

## Demo
I coded a simple [clone](http://mazzo.li/YouTubePlayer/demo.html
"Demo") of the original demo.

## Requirements
You will need the core MooTools library and the URI class from More.

## Advantages
The main advantages are:

*   You do not have to define the "onYouTubePlayerReady" function. The
    class will create it itself.
*   All the functions that return void are automatically enqueued if the
    player is not ready, and executed when the player becomes ready.
*   MooTools-like events: 'playerReady', 'stateChange',
    'playbackQualityChange' and 'error'. These event can be added with
    the usual .addEvent function directly on the YouTubePlayer object.
*   All the standard api functions have been added to the YouTubePlayer
    <object>. You can also set specific attributes of the object with the
    "set" and "get" functions, that operate on the <object>.
*   The <object> is still accessible via the .object attribute of the
    YouTubePlayer object.


