function setupLazyObserver() {
  var lazyloadImages;    
  if ("IntersectionObserver" in window) {
    lazyloadImages = document.querySelectorAll(".lazy");
    var imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var image = entry.target;
          image.classList.remove("lazy");
          imageObserver.unobserve(image);
        }
      });
    });

    lazyloadImages.forEach(function(image) {
      imageObserver.observe(image);
    });
  } else {  
    var lazyloadThrottleTimeout;
    lazyloadImages = document.querySelectorAll(".lazy");
    
    function lazyload () {
      console.log("doing IE-style check");
      if(lazyloadThrottleTimeout) {
        clearTimeout(lazyloadThrottleTimeout);
      }    

      lazyloadThrottleTimeout = setTimeout(function() {
        var scrollTop = window.pageYOffset;
        lazyloadImages.forEach(function(img) {
            if(img.offsetTop < (window.innerHeight + scrollTop)) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
            }
        });
        if(lazyloadImages.length == 0) { 
          console.log("no images found, disabling compat lazy loader");
          document.removeEventListener("scroll", lazyload);
          window.removeEventListener("resize", lazyload);
          window.removeEventListener("orientationChange", lazyload);
        }
      }, 20);
    }

    document.addEventListener("scroll", lazyload);
    window.addEventListener("resize", lazyload);
    window.addEventListener("orientationChange", lazyload);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  setupLazyObserver();
})

function formatText(str) {
  var replace = {
    "<i>Fliiiight</i>": /\bfliiiight\b/gi,
    "<i>Podiiiium</i>": /\bpodiiiium\b/gi,
    "<i>Viiiiva</i>": /\bviiiiva\b/gi,
    "<i>4iiii</i>": /\b4iiii\b/gi,
  };

  for(var key in replace) {
    const rgx = replace[key];
    str = str.replace(rgx, key);
  }
  return str;
}

function setupExplainers(explainerSrcFile, rootElement) {
  var successQuery = function(json) {

    // alright, let's add the explainers to .explainers
    json.forEach(function(explainer, index)  {
      var div = document.createElement('div');
      div.className = "explain-content " + (index & 1 ? 'right' : 'left');

      var textContent = '<div class="explain-content-title">' + explainer.title + '</div>' +
                        '<div class="explain-content-text">' + formatText(explainer.text) + '</div>';

      var imageBase = "./explainers-images/REPLACEME.JPG";
      var imageSpecific = imageBase.replace('REPLACEME.JPG', explainer.image);
      var imageStyle = explainer.imageStyle || "cover";

      div.innerHTML =['<div class="explain-content-text-cell">', 
                          '<div class="vgap" ></div>',
                          '<div class="explain-content-text-cell-content">',
                              textContent,
                              '<div class="vgap" ></div>',
                              '<div class="explain-content-text-cell-ctas"></div>',
                          '</div>',
                          '<div class="vgap" ></div>',
                      '</div>',
                      '<span role="img" aria-label="' + explainer.imageAlt + '" class="explain-content-image-cell lazy" style="background-image: url(\'' + imageSpecific + '\'); background-size: ' + imageStyle + ';"></span>'].join('\n');
      

      if(explainer.ctas) {
          var linkDiv = div.querySelector('.explain-content-text-cell-ctas');
          explainer.ctas.forEach(function(cta) {

              var isOnSiteLink = cta.url[0] === '/';

              var a = document.createElement('a');
              a.href = cta.url;
              a.innerHTML = formatText(cta.text);
              a.target = cta.url[0] === '/' ? "_self" : "_blank";
              a.onclick = isOnSiteLink ? function() {engagePlexi();} : function(){};
              a.className = "explain-content-cta-link";
              linkDiv.appendChild(a);
          })
      }

      rootElement.appendChild(div);
      setupLazyObserver();
    })
  }
  var failQuery = function(args) {
    console.log("failed to download", args);
  }

  /*var ajaxParams = { 
    dataType:"json",
    url: explainerSrcFile,
    cache:false,
    success:successQuery,
    error:failQuery
  };

  jQuery.ajax(ajaxParams);*/
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", successQuery);
  oReq.open("GET", explainerSrcFile);
  oReq.send();

};
