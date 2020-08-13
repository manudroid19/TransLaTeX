var url = new URL(window.location.href);
var file = url.searchParams.get("file");
history.pushState(null, '', '.');

var translatex= angular.module("translatex",['ngSanitize'],function($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
});

translatex.controller("controlador", function($scope, $http){
	$scope.init = function(){
		$scope.hide_visor=true
		$scope.hide_xml_down=true
		$scope.hide_xml_up=true
		$scope.hide_apply=true

	}
	$scope.filename=file
	while ($scope.filename.substring($scope.filename.length -1)=='_') {
	  $scope.filename=$scope.filename.replace(/_$/,"");
	}
	$scope.escanear = function() {
    filesize=parseInt(getCookie('filesize'))
    estimated_time=-4.966e-02+2.486e-04*filesize
		$http.get("https://latex.manueldeprada.com/api/preprocesar?file="+file).then(function(response){
			$scope.texto_visor= response.data;
      $scope.hide_visor=false
  		$scope.hide_xml_down=false
  		$scope.hide_xml_up=true
      $("#overlay").hide();
		},
    (err) => {
      alert("Error processing TeX file");
      console.log("rejected with", err);
    });
    $("#overlay").show();
		$scope.hide_scan=true
    seconds = estimated_time;
    i=0
    function myTimer() {
        document.getElementById("loader").ldBar.set(100*i/seconds)
        if(i>=seconds){
          clearInterval(myVar);
        }
        i++
    }

    var myVar = setInterval(myTimer, 1000);

	}
	$scope.downloadXML = function() {
		document.getElementById('downloader').src = "https://latex.manueldeprada.com/api/downloadTex?file="+file;
		//$scope.hide_apply=false
	}
	$scope.uploadXML = function() {
		var f = document.getElementById('file-u').files[0],
        r = new FileReader();

    r.onloadend = function(e) {
      var data = e.target.result;
			var urll="https://latex.manueldeprada.com/api/uploadXML?file="+file;
      var fd = new FormData();
      var blob = new Blob([data], { type: "text/xml"});
      fd.append('file', blob);
      $http.post(urll, fd, {
          headers: {
            'Content-Type': undefined,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          transformRequest: angular.identity,
        }).then(function(response){
          $scope.hide_apply=false
        },
        (err) => {
          alert("Error processing uploaded translation");
          console.log("rejected with", err);
        });
    }
		r.readAsText(f);
	}
	$scope.applyTranslation = function() {
		document.getElementById('downloader').src = "https://latex.manueldeprada.com/api/downloadTex?file="+file;
	}
})

move = function() {
	if(document.getElementsByTagName("mark")[0] != null){
		document.getElementsByTagName("mark")[0].scrollIntoView({ behavior: 'smooth'})
		observer.disconnect();
	}
}

const targetNode = document.getElementById('texto_visor');
const config = { childList: true };
const observer = new MutationObserver(move);
observer.observe(targetNode, config);

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
