window.urlList = [];
window.end = '';
window.current = new Array(4).fill(null);
window.playing = new Array(4).fill(null);
window.toLoad = 0;
window.all = 0;
window.nexting = new Array(4).fill(null);
var initial = new Array(4).fill(null);;

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

if (getUrlVars()['tv1'] >= '') {
  window.urlList[0] = getUrlVars()["tv1"];
  window.urlList[1] = getUrlVars()["tv2"]
  window.urlList[2] = getUrlVars()["tv3"]
  window.urlList[3] = getUrlVars()["tv4"]
  next(1)
  if (window.urlList[1] != null) {
    next(2)
  }
  if (window.urlList[2] != null) {
    next(3)
  }
  if (window.urlList[3] != null) {
    next(4)
  }
};

function nameVideo(arg) {
  var videoNum = 'video' + arguments[0];
  return videoNum;
}

function removeVideo(arg) {
  var videoNum = nameVideo(arguments[0]);
  videoToRemove = document.getElementById(videoNum)
  videoToRemove.parentNode.removeChild(videoToRemove);
}

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

var td = htmlToElement('<td>foo</td>'),
  div = htmlToElement('<div><span>nested</span> <span>stuff</span></div>');

document.getElementById('video1').addEventListener('loadeddata', (event) => {
  window.playing[0] = 1;
  window.nexting[0] = 0;
  console.log('loadeddata 1');
});

document.getElementById('video2').addEventListener('loadeddata', (event) => {
  window.playing[1] = 1;
  window.nexting[1] = 0;
  console.log('loadeddata 2');
});

document.getElementById('video3').addEventListener('loadeddata', (event) => {
  window.playing[2] = 1;
  window.nexting[2] = 0;
  console.log('loadeddata 3');
});

document.getElementById('video4').addEventListener('loadeddata', (event) => {
  window.playing[3] = 1;
  window.nexting[3] = 0;
  console.log('loadeddata 4');
});

function autoNext(arg) {
  if (window.end.match('next')) {
    console.log('autonext ' + arguments[0]);
    next(arguments[0]);
  } else if (window.end.match('restart')) {
    console.log('autorestart ' + arguments[0]);
    start(arguments[0]);
  }
}

function addVideo(arg) {
  var videoNum = nameVideo(arguments[0]);
  let tvIndex = arguments[0] - 1;
  var video = htmlToElement('<video class="vid" id="' + videoNum + '" controls muted></video>');
  videoToRemove = document.getElementById(videoNum)
  videoToRemove.parentNode.replaceChild(video, videoToRemove);
  video = document.getElementById(videoNum)
  video.addEventListener('loadeddata', (event) => {
    window.playing[tvIndex] = 1;
    window.nexting[tvIndex] = 0;
    console.log('loadeddata ' + videoNum);
  });
  video.addEventListener('ended', (event) => {
    autoNext(arguments[0])
  });
}

function addTwitch(arg) {
  var vidNum = nameVideo(arguments[0]);
  var iframe = htmlToElement('<iframe id="' + vidNum + '" width="100%" height="100%" allowfullscreen="" src="https://player.twitch.tv/?autoplay=true&muted=true" parent=["kmfd.github.io"]></iframe>');
  videoToRemove = document.getElementById(vidNum);
  videoToRemove.parentNode.replaceChild(iframe, videoToRemove);
}

function addYouTube(arg) {
  var vidNum = nameVideo(arguments[0]);
  var iframe = htmlToElement('<iframe id="' + vidNum + '" width="100%" height="100%" allowfullscreen="" src="https://www.youtube.com/embed/YE7VzlLtp-4?autoplay=1&mute=1"></iframe>');
  //iframe.onload = loaded(1);
  videoToRemove = document.getElementById(vidNum);
  videoToRemove.parentNode.replaceChild(iframe, videoToRemove);
}

function loaded(tvNum, vidtype) {
  if (vidtype == 'youTube') {

  } else if (vidtype == 'twitch') {}

  else {
    // its hls
  }
}


function isTwitch(item) {
  let pattern = new RegExp("(https?)?(:\/\/)?(www.)?twitch\.(?:com|tv)\/(video\/|channel\/)?.*(?!&)");
  if (pattern.test(item)) {
    return true
  } else {
    return false
  }
}

function isYT(item) {
  let pattern = new RegExp("(https?)?(:\/\/)?(www.)?(?:youtube\.com|youtu\.be)\/(?!(feed\/|channel\/|c\/)).*([A-Za-z0-9_-]){11}(&.*)?");
  if (pattern.test(item)) {
    return true
  } else {
    return false
  }
}

function ytFormat(item) {
  if (isYT(item)) {
    let pattern = new RegExp("(https?)?(:\/\/)?(www.)?(?:youtube\.com|youtu\.be)\/(?!(feed\/|channel\/|c\/)).*([A-Za-z0-9_-]){11}(&.*)?");
    ytID = item.match(/(?<=\=|\/)([A-Za-z0-9_-]){11}(?![a-zA-Z])/)[0]
    return 'https://www.youtube.com/embed/' + ytID
  } else {
    return item
  }
}
  function next(arg) {
    tvNum = arguments[0]
    tvIndex = tvNum - 1
    clearTimeout(initial[tvIndex])
    // if theres urls on the list to load
    if (window.urlList.length != 0) {
      //reset the playing flag
      window.playing[tvIndex] = 0;
      //if the one we're trying to load is already on the grid,
      if (skipcurrent()) {
        let video = document.getElementById(nameVideo(tvNum));
        document.getElementById('drop' + tvNum).innerHTML = '<li>' + ytFormat(window.urlList[window.toLoad]) + '</li>';
        window.current.splice(eval('tvIndex'), 1, window.urlList[window.toLoad]);
        //if the url to load is YouTube
        if (isYT(window.urlList[window.toLoad])) {
          addYouTube(tvNum);
          let video = document.getElementById('video' + tvNum);
          video.src = ytFormat(window.urlList[window.toLoad]) + '?autoplay=1&mute=1'
          //TODO needs to convert all youtube video urls to the embed code before loading above
          console.log(video)
        } else {
          //if url to load is Twitch
          if (isTwitch(window.urlList[window.toLoad])) {
            addTwitch(tvNum);
            let video = document.getElementById('video' + tvNum);
            video.src = window.urlList[window.toLoad] + '?autoplay=true&muted=true'
            console.log(video)
          } else {
            // if the url to load is not YT or Twitch, its probably mp4, HLS or TLS, or nothing (try anyway)
            addVideo(tvNum);
            let video = document.getElementById('video' + tvNum);
            if ((/\.mp4$/).test(window.urlList[window.toLoad])) {
              playmp4(tvNum);
            } else //if ((/m3u|\.ts/).test(window.urlList[window.toLoad]))
            {
              console.log('next ' + tvNum + ': trying m3u/ts...')
              loadhls(tvNum);
              //  } else {
              //    cantplay(tvNum);
            };
          };
        }
      } else {
        console.log("nothing in the queue that isn't on the grid");
      }
      //}
      if (window.all == 0) {
        console.log(window.current);
      }
      iterate();
      if ((window.nexting[tvIndex] == 0) || (window.nexting[tvIndex] == null)) {
        window.nexting[tvIndex] = 1;
        console.log('nexting to 1');
              };
              timeout(tvNum);
    };
  };

  function timeout(tvNum) {
    tvIndex = tvNum - 1
    initial[tvIndex] = window.setTimeout(
      function() {
        console.log("timeout");
        if (!isPlaying(tvNum)) {
          next(tvNum);
        } else {
          window.nexting[tvIndex] = 0
        };
      }, 2000);
  }

  function isPlaying(arg) {
    tvNum = arguments[0]
    tvIndex = tvNum - 1
    // might get a solution to check for yt vids failing to load from the yt iframe api
    if ((!isYT(window.current[tvIndex])) && (!vidPlaying(tvNum))) {
      console.log('timeout, next ' + tvNum + ". nexting is 1, next");
      return false
    } else {
      console.log("timeout " + tvNum + " passed")
      window.nexting[tvIndex] = 0;
      console.log('nexting is 1, setting to 0');
      return true
    }
    //}
  }

  function vidPlaying(tvNum) {
    tvIndex = tvNum - 1
    var video = document.getElementById(nameVideo(tvNum));
    if (isYT(window.current[tvIndex]) && video.contentWindow.location) {
      return true
    } else {
      if (window.playing[tvIndex] == 1) {
        return true
      } else {
        return false
      }
    }
  }

  function loadhls(arg) {
    let video = document.getElementById('video' + arguments[0]);
    if (Hls.isSupported()) {
      console.log('Loading HLS: ' + window.urlList[window.toLoad]);
      var config = {
        debug: false,
      };
      let hls = new Hls(config);
      hls.loadSource(window.urlList[window.toLoad]);
      hls.attachMedia(video);
      loading = window.urlList[window.toLoad]
      video.play().catch((e) => {
        console.log('failed to load url: ' + loading);
      });
    }

    // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
    // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
    // This is using the built-in support of the plain video element, without using hls.js.
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = window.urlList[window.toLoad];
      video.addEventListener('canplay', function() {
        video.play().catch((e) => {
          console.log('failed to load url: ' + loading);
          next(arg);
        });
      });
    }

  }



  function nextall() {
    let i;
    window.all = 1;
    for (i = 1; i < 5; i++) {
      let video = document.getElementById('video' + i);
      next(i);
    }
    console.log(window.current);
    window.all = 0;
  };


  function iterate() {
    if (window.urlList.length != 0) {
      if (window.toLoad <= window.urlList.length - 2) {
        window.toLoad++;
      } else {
        window.toLoad = 0;
      }
    }
  }

  function skipcurrent() {
    let i = 1;
    while (window.current.includes(window.urlList[window.toLoad]) | window.urlList[window.toLoad] == 0) {
      if (i <= window.urlList.length) {
        iterate();
        i++;
      } else {
        return false;
      }
    }
    return true;
  }

  function playmp4(arg) {
    console.log('mp4 found...');
    let video = document.getElementById('video' + arguments[0]);
    video.src = window.urlList[window.toLoad];
    console.log('next ' + arguments[0] + ': ' + video.src);
    video.type = 'video/mp4';
    video.play().catch((e) => {
      console.log('failed to load mp4: ' + window.urlList[window.toLoad]);
    });;
    console.log('loaded');
  };


  function cantplay(arg) {
    if ((/\.mkv$/).test(window.urlList[window.toLoad])) {
      let video = document.getElementById('video' + arguments[0]);
      video.src = window.urlList[window.toLoad];
      console.log('next ' + arguments[0] + ': mkv not supported on Firefox');
      video.type = 'video/x-matroska';
      video.play();
    } else {
      console.log(window.urlList[window.toLoad] + ' was unplayable, next...');
      window.urlList.splice(0, 0, '0')
    }
  };



  function start(arg) {
    let video = document.getElementById('video' + arguments[0]);
    video.play();
  };

  function startall() {
    let i;
    for (i = 1; i < 5; i++) {
      let video = document.getElementById('video' + i);
      start(i);
    }
  };

  function skip(arg) {
    let video = document.getElementById('video' + arguments[0]);
    video.currentTime = video.currentTime + 30;
  };

  function skipall() {
    let i;
    for (i = 1; i < 5; i++) {
      let video = document.getElementById('video' + i);
      skip(i);
    }
  };

  function stopall() {
    let i;
    for (i = 1; i < 5; i++) {
      let video = document.getElementById('video' + i);
      stop(i);
    }
  };

  function stop(arg) {
    let video = document.getElementById('video' + arguments[0]);
    video.load();
  };


  function shuffle(a) {
    let j, x, i;
    for (i = a.length; i; i--) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    };
    console.log('shuffling...')
  }

  document.getElementById("filebutton").onclick = function() {
    document.getElementById("files").click();
  }

  document.getElementById("next-1").onclick = function() {
    next('1');
  };
  document.getElementById("next-2").onclick = function() {
    next('2');
  };
  document.getElementById("next-3").onclick = function() {
    next('3');
  };
  document.getElementById("next-4").onclick = function() {
    next('4');
  };

  document.getElementById("nextall").onclick = nextall;


  document.getElementById("start-1").onclick = function() {
    start('1');
  };
  document.getElementById("start-2").onclick = function() {
    start('2');
  };
  document.getElementById("start-3").onclick = function() {
    start('3');
  };
  document.getElementById("start-4").onclick = function() {
    start('4');
  };

  document.getElementById("startall").onclick = startall;

  document.getElementById("stop-1").onclick = function() {
    stop('1');
  };
  document.getElementById("stop-2").onclick = function() {
    stop('2');
  };
  document.getElementById("stop-3").onclick = function() {
    stop('3');
  };
  document.getElementById("stop-4").onclick = function() {
    stop('4');
  };


  document.getElementById("stopall").onclick = stopall;

  document.getElementById("skip-1").onclick = function() {
    skip('1');
  };
  document.getElementById("skip-2").onclick = function() {
    skip('2');
  };
  document.getElementById("skip-3").onclick = function() {
    skip('3');
  };
  document.getElementById("skip-4").onclick = function() {
    skip('4');
  };

  document.getElementById("skipall").onclick = skipall;

  document.getElementById("shuffle").onclick = function() {
    shuffle(window.urlList);
  };

  document.getElementById("loopnext").onclick = function() {
    window.end = 'next';
    console.log('loop next enabled');
  };


  document.getElementById("loopsame").onclick = function() {
    window.end = 'restartsame';
    console.log('loop restart enabled');
  };


  document.getElementById("loopoff").onclick = function() {
    window.end = 'off';
    console.log('loop off');
  };


  function handleFileSelect(evt) {
    let files = evt.target.files; // FileList object

    // Loop through the FileList
    for (let i = 0, f; f = files[i]; i++) {

      let reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          let vlc = document.getElementById("vlc");
          let playlistUL = reader.result;
          let plarray = playlistUL.split(/\r\n/);
          let exts = [/ext/i]
          let filteredArr = plarray.filter(function(val) {
            return !(val === "");
          });
          let newitems = filteredArr.filter(function(text) {
            return !exts.some(function(regex) {
              return regex.test(text);
            });
          });
          let urls = [];

          combined = newitems.concat(window.urlList);
          window.urlList = combined;
          for (let i = 0; i < (window.urlList.length) - 1; i++) {
            let re = new RegExp("file:///");
            // let regex = /^(?:(?:https?|ftp|rtmp|rtsp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
            let regex = /^(http|ftp|rtmp|rtsp)/i;
            if (regex.test(window.urlList[i])) {
              console.log(regex.test(window.urlList[i]));
              urls[i] = window.urlList[i];
            } else if (re.test(window.urlList[i])) {} else {

              window.urlList[i] = 'file:///' + window.urlList[i];
            }

          }
          console.log(urls.length + " urls: " + urls);
          console.log(urlList.length + " urlList: " + window.urlList);;
        };
      })(f);

      // Read in the file as a data URL.
      // Can perhaps instead use object URLs see https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications#Using_object_URLs
      reader.readAsText(f);
    }
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);


  document.getElementById("log").onclick = log1

  function log1() {
    var newDiv = document.createElement('logbox');
    newDiv.id = 'logbox';
    gridUrl = 'http://kmfd.github.io/index.html?tv1=' + window.current[0] + '&tv2=' + window.current[1] + '&tv3=' + window.current[2] + '&tv4=' + window.current[3]
    newDiv.innerHTML = '<ul> <li>' + window.current[0] + '</br>' + window.current[1] + '</br>' + window.current[2] + '</br>' + window.current[3] + '</li> </ul>' + '<ul> <li>' + 'url to recall the current grid:</br><a href="' + gridUrl + '">' + gridUrl + '</a>'

    document.getElementById("area").appendChild(newDiv);
    window.scrollTo(0, document.body.scrollHeight);

    // Your CSS as text
    var styles = `
    body {
        overflow-y: scroll;
    }
`

    var styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)

  };


  Mousetrap.bind(['4', 'l'], function() {
    next('1')
  });
  Mousetrap.bind(['5', ';'], function() {
    next('2')
  });
  Mousetrap.bind(['1', ','], function() {
    next('3')
  });
  Mousetrap.bind(['2', '.'], function() {
    next('4')
  });

  Mousetrap.bind(['alt+4', '0+4', 'alt+l'], function() {
    skip('1')
  });
  Mousetrap.bind(['alt+5', '0+5', 'alt+;'], function() {
    skip('2')
  });
  Mousetrap.bind(['alt+1', '0+1', 'alt+,'], function() {
    skip('3')
  });
  Mousetrap.bind(['alt+2', '0+2', 'alt+.'], function() {
    skip('4')
  });

  Mousetrap.bind(['+'], function() {
    document.getElementById("files").click()
  });

  Mousetrap.bind(['-'], function() {
    shuffle(window.urlList)
  });

  Mousetrap.bind(['*'], function() {
    document.getElementById("loopnext").click()
  });
