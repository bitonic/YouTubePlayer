# YouTubePlayer

Simple [MooTools](http://mootools.net/ "MooTools") class with the aim
to provide a simple interface to the [YouTube player
API](http://code.google.com/apis/youtube/js_api_reference.html
"YouTube JS API reference"), built on top of the Swiff class.

The code is well commented and it should be easy to read. The class
serves my needs as it is, but if you need a feature contact me!

## More infos

I wrote an
[article](http://mazzo.li/b/articles/2011-02-07-youtubeplayer.html)
describing what this class is for and how to use it. Go to the bottom
of the page for a demo that shows more or less what you can do with
it.

## Requirements
You will need the core MooTools library and the URI class from More.

## Advantages
The main advantages are:

*   You do not have to define the "onYouTubePlayerReady" function. The
    class will create it itself.
*   All the functions that return void are automatically enqueued if the
    player is not ready, and executed when the player becomes ready.
*   The functions that are supposed to return something return null if the
    player is not ready.
*   MooTools-like events: 'playerReady', 'stateChange',
    'playbackQualityChange' and 'error'. These event can be added with
    the usual .addEvent function directly on the YouTubePlayer object.
*   All the standard api functions have been added to the YouTubePlayer
    bject You can also set specific attributes of the object with the
    "set" and "get" functions, that operate on the actual flash &lt;object&gt; tag.
*   The &lt;object&gt; tag is still accessible via the .object attribute of the
    YouTubePlayer object.


