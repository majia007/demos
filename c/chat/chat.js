const cChat = (()=>{
	function showMsg(showbox, msg){
		showbox.append(`<p>${msg}</p>`);
		if ("" + showbox[0].dataset.autoscroll == "true") showbox.stop().animate({scrollTop: showbox[0].scrollHeight}, 500);
	}
	function cleanChatContent(showbox) {
		showbox.html("");
	}
	function onMessage(showbox, e) {
		if (typeof e.data == "string") {
			var data = JSON.parse(e.data);
			if (data.type === 1) {
				showMsg(showbox, `[${时间格式化(data.time, 1)}] ${data.userName}[${data.userId}]: ${data.msg}`);
			} else if (data.type === 2) {
				
			}
		} else {
			var reader = new FileReader();
			reader.readAsDataURL(new Blob([e.data]));
			reader.onload = () => receivePic(reader.result);
		}
	}
	function onOpen(showbox, editbox, e) {
		e.target.binaryType = "arraybuffer";
		showMsg(showbox, "<strong>[系统] Connect success");
		editbox[0].focus();
	}
	function onError(showbox, e) {
		clog(e);
		showMsg(showbox, "<strong>[系统] Error.</strong>");
	}
	function onClose(showbox, e){
		clog(e);
		showMsg(showbox, "<strong>[系统] Close.</strong>");
	}
	function openWebsocket(webSocket, url, showbox, editbox){
		if (webSocket && webSocket.readyState == 1) {
			showMsg(showbox, "<strong>[系统] 已连接</strong>");
			return;
		}
		try {
			webSocket = new WebSocket(url);
		} catch (e) {
			clog(e);
			showMsg(showbox, "<strong>[系统] Error url.</strong>");
			return;
		}
		webSocket.onopen = onOpen.bind(webSocket, showbox, editbox);
		webSocket.onerror = onError.bind(webSocket, showbox);
		webSocket.onclose = onClose.bind(webSocket, showbox);
		webSocket.onmessage = onMessage.bind(webSocket, showbox);
		return webSocket;
	}

	function closeWebsocket(webSocket, showbox){
		if (webSocket && webSocket.readyState == 1) {
			webSocket.close();
		} else {
			showMsg(showbox, "<strong>[系统] Closed.</strong>");
		}
	}
	function send(webSocket, showbox, editbox, pic){
		if (!webSocket || webSocket.readyState != 1) {
			showMsg(showbox, "<strong>[系统] Not online.</strong>");
			return;
		}
		if (editbox.html() == "") return;
		webSocket.send(editbox.html());
		showMsg(showbox, `[${时间格式化(new Date(), 1)}] <strong>${showbox.data("name")}</strong>: ${editbox.html()}`);
		cleanInput(editbox, pic);
	}
	function addPic(editbox, pic) {
		pic[0].onchange = () => {
			let picfile = pic[0].files[0];
			if (!picfile || picfile.type.indexOf("image") != 0) {
				cAlert("请选择图片！", 0, {type: 1});
				return false;
			}
			let reader = new FileReader();
			reader.readAsDataURL(picfile);
			reader.onload = e => {editbox.append(`<img src="${reader.result}">`); editbox[0].focus();};
		}
		pic[0].click();
	}
	function sendPic(webSocket, showbox, pic) {
		pic[0].onchange = function() {
			let picfile = pic[0].files[0];
			if (!picfile || picfile.type.indexOf("image") != 0) {
				cAlert("请选择图片！");
				return false;
			}
			let blobreader = new FileReader();
			blobreader.readAsArrayBuffer(picfile);
			blobreader.onload = e => webSocket.send(blobreader.result);
			let urlreader = new FileReader();
			urlreader.readAsDataURL(picfile);
			urlreader.onload = e => showMsg(showbox, `[${时间格式化(new Date(), 1)}] ${showbox.data("name")}: <img src="${urlreader.result}">`);
		}
		pic[0].click();
	}
	function receivePic(data) {
		showMsg(showbox,  `[${时间格式化(new Date(), 1)}] ${showbox.data("name")}: <img src="${data}">`);
	}
	function cleanInput(editbox, pic) {
		pic[0].value = "";
		editbox.html("");
	}

	function _init(title, url, opt = {}, _width) {
		let box = cWin.open({title: title, width: _width || undefined, drag: true, closeButton: true, yesWord: "发送", noWord: "清空", noFirst: true, content: `
			<!--div class="chat-control c-button-box">
				<input class="input" name="url" placeholder="输入url" value="ws://127.0.0.1:8080/chat">
				<a class="button empty" name="close">断开</a>
				<input class="input" name="nick" placeholder="输入昵称">
				<a class="button default" name="open">连接</a>
			</div-->
			<div class="chat-content" data-autoscroll="true" name="show-box"></div>
			<div class="edit-console c-button-box">
				<input class="hidden" type="file" name="pic">
				<a class="button default" name="addPic">表情</a>
				<a class="button default" name="sendPic">图片</a>
				<a class="button" name="autoscroll">自动滚动</a>
				<a class="button default" name="cleanChatContent">清屏</a>
			</div>
			<div class="edit-content" contenteditable="true"></div>`
		}).done(box => {
			// let urlinput = box.find(`input[name=url]`);
			// let closeBtn = box.find(`a[name=close]`);
			// let nickinput = box.find(`input[name=nick]`);
			// let openBtn = box.find(`a[name=open]`);
			let cleanChatContent = box.find(`a[name=cleanChatContent]`);
			let showBox = box.find(`div[name=show-box]`);
			let picBtn = box.find(`input[name=pic]`);
			let addPicBtn = box.find(`a[name=addPic]`);
			let sendPicBtn = box.find(`a[name=sendPic]`);
			let autoscroll = box.find(`a[name=autoscroll]`);
			let editBox = box.find(`.edit-content`);
			let _webSocket;
			let _send = () => {send(_webSocket, showBox, editBox, picBtn); return false};
			绑定回车(editBox, _send);
			cleanChatContent.click(() => {cleanInput(showBox, picBtn)})
			addPicBtn.click(() => addPic(editBox, picBtn))
			sendPicBtn.click(() => sendPic(_webSocket, showBox, picBtn))
			autoscroll.click(e => {
				showBox[0].dataset.autoscroll = showBox[0].dataset.autoscroll == "true" ? "false" : "true";
				autoscroll.toggleClass("disable");
			});
			box.onclose(() => closeWebsocket(_webSocket, showBox)).unbindNo().setYes(_send).setNo(() => cleanInput(editBox, picBtn));
			showBox.data("name", opt.name);
			_webSocket = openWebsocket(_webSocket, `${url}?${$.param(opt)}`, showBox, editBox);
		});
		return box;
	}
	return {open: _init};
})();