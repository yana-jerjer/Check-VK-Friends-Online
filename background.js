var access;
console.log("Entered");
checkAgreementState();

function checkAgreementState() {
	chrome.storage.local.get("agreementKey", function(agreement) {
		if (chrome.runtime.lastError) {
			console.log("Error retrieving index: " + chrome.runtime.lastError);
			return;
		}
		if(agreement["agreementKey"] != true) {
			console.log("Найти ключ");
			openRules();
		}
		else if (agreement["agreementKey"] === true) {
			console.log("Найден ключ ");
			getToken();
		}
	});

}

function openRules(agreement) {
	console.log("Open Rules");
	var returnStatement = false;
	var request = new XMLHttpRequest();
	request.open("GET", "http://localhost:8080/api/agreement", true);
	request.onreadystatechange = function(answer) {
		if(request.readyState == 4 && request.status == 200){
			console.log("Получен текст");
			var rules = confirm(request.responseText.replace(/,(?=\S)/gi, "\n").replace(/\n+/gi,"\n").replace(/,$/,""));
			if (rules === true) {
				console.log("Подтверждено");
				var agreement = {};
    			agreement["agreementKey"] = true;
    			chrome.storage.local.set(agreement);
    			getToken();
			}
			else {
				console.log("Отклонено");
				var acceptance = confirm("Для запуска расширения необходимо принять условия соглашения. Вы уверены, что хотите выйти?");
				if (acceptance == false) openRules(); 
				else {
					var agreement = {};
					agreement["agreementKey"] == false;
					chrome.storage.local.set(agreement);
				}
			}			
		}
	};
	request.send();
}

function checkVK(){
	var linkMainPage = "https://vk.com/im?peers";
	var request = new XMLHttpRequest();
	request.open("GET", linkMainPage, true);
		request.onreadystatechange = function(answer) {
			if(request.readyState == 4 && request.status == 200){
				if (~request.responseText.indexOf("<title>Вход | ВКонтакте</title>"))
				alert("Войдите в учетную запись ВКонтакте");
			else {
				alert("Вошли в учетную запись ВКонтакте");
				getFriendOnline();
			}
			} 
		};  
		request.send();
}

function getFriendOnline(){
	var friendList = formRequest("friends.getOnline","");
	console.log(friendList);
	var friendSTR = "";
	var friends = JSON.parse(friendList).response;
	if (friends != undefined) {friendSTR = friends[0];
		for( var i = 1; i < friends.length; i++)
			friendSTR += "," + friends[i];
	var regExp = /({\"id\":\d+?,)|(\"first_name\":)|(\"last_name\":)|({\"response\":\[)/gi;
	var result = "FRIENDS ONLINE: " + "\n" + "\n" + formRequest("users.get", "user_ids=" + friendSTR).replace(regExp, "").replace(/\"},\"/gi, '\n').replace(/\",\"/gi," ").replace(/\"|}|]/gi, "");
	alert (result);
	}
	
}

//---------------------------------------------------------------------------------------------
//Определение токена для работы с VK api
//---------------------------------------------------------------------------------------------
//получение accessToken
function getToken(){
	console.log("GetToken");
	if (access != undefined){
		checkVK();
		console.log(access);
	}
	if (access === undefined) {
		chrome.storage.local.get("vkToken", function(items) {
			if (chrome.runtime.lastError) {
				console.log("Error retrieving index: " + chrome.runtime.lastError);
				return;
			}
			var ids = items["vkToken"];
			if (ids === undefined) {
				linkRequest();
			}
			else {
				access = ids;
				getToken();
			}
		});
	} 
	else return access;
}
//Сохранение значения accessToken
function store(key, value, id){
    var st = {};
    st[key] = value;
    chrome.storage.local.set(st);
    showToken();
    chrome.tabs.remove(id);
    getToken();        
}

function linkRequest() {
	var vkAppId = '6999714',
	vkAppScopes = 'friends,wall,offline',
	vkAppUrl  = 'https://oauth.vk.com/authorize?client_id=' + vkAppId + '&scope=' + vkAppScopes + '&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&display=page&response_type=token';
	chrome.tabs.create({url:vkAppUrl, selected: true});
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
		if(tab.url.includes('https://oauth.vk.com/') == true && changeInfo.status == 'loading')
			getUrlParameterValue(changeInfo.url, tabId);
	});
	
}  
//выделение части access_TOKEN из всей ссылки
function getUrlParameterValue(url, id) {
	var urlParameters  = url.substr(url.indexOf("#") + 1), access_token, expires_in;
	parameters = urlParameters.split("&");
	for (var i = 0; i < parameters.length; i++) {
		if(parameters[i].includes('access_token=')) {
			access_token = parameters[i].substr(parameters[i].indexOf("access_token=") + 13);
			console.log(access_token);
			console.log("Токен получен");
			store('vkToken', access_token, id);
		}
		else if(parameters[i].includes('expires_in')){
			expires_in = parameters[i].substr(parameters[i].indexOf('expires_in=') + 11);
		}
	}
}

//Формирование запросов VK api
//-------------------------------------------------------------------------------------------------------------------
//получение и установка значений
function setValue(value) { exchange = value; } 
function getValue() { return exchange; }
//запрос к API методам
function formRequest(method, params) {
		var link = 'https://api.vk.com/method/' + method + '?' + params + '&access_token=' + access + '&v=5.52'; 
		var request = new XMLHttpRequest();
		request.open("GET", link, false);
		request.onreadystatechange = function(answer) {
			if(request.readyState == 4 && request.status == 200) {  
				setValue(request.response);
			}  
		};
		request.send();
		result = getValue();
		return result; 
}

function showToken(){
	chrome.storage.local.get("vkToken", function(items) {
			if (chrome.runtime.lastError) {
				console.log("Error retrieving index: " + chrome.runtime.lastError);
				return;
			}
			var ids = items["vkToken"];
			console.log(items["vkToken"]);
		});
}
