// C's tools
const clog = console.log.bind(console);
let cdebug = e => {};
const chen = {
	set debug(val) {if (val) cdebug = clog; else cdebug = e => {}; this._debug = val;},
	get debug() {return this._debug;}
};
const 循环 = (n, func) => {while (n--) func(n)};
const 画圆 = (context, x, y, r, color) => {
	 context.beginPath();
     context.arc(x, y, r, 0, Math.PI * 2, true);
     context.closePath();
     context.fillStyle = color;
     context.fill();
}
const 补位 = (num, add = 0, length = 2) => {
	for (let i = 0; i < (length - ("" + num).length); i++) {
		num = add + "" + num;
	}
	return num;
}
const 时间格式化 = (date, noDay) => {
	date = new Date(date);
	if (noDay) return 补位(date.getHours()) + ":" + 补位(date.getMinutes()) + ":" + 补位(date.getSeconds());
	return date.getFullYear() + "-" + 补位(date.getMonth()+1) + "-" + 补位(date.getDate()) + " " + 补位(date.getHours()) + ":" + 补位(date.getMinutes()) + ":" + 补位(date.getSeconds());
}
const exVal = (a, b) => [b, a];
const cDrag = (() => {
	const holder = [];
	const _win = $(window);
	function _drag(selector, _box) {
		selector = $(selector)[0];
		if (!selector || holder.indexOf(selector) > -1) return false;
		holder.push(selector);
		selector = $(selector);
		_box = _box || selector.parent();
		let press = false;
		let originX = _box.offset().left;
		let originY = _box.offset().top;
		let pressX = 0;
		let pressY = 0;
		function mousedown(e) {e.preventDefault(); if (press) return; press = true; pressX = e.clientX; pressY = e.clientY; _win.on({mousemove: mousemove, mouseup: mouseup});}
		function mousemove(e) {e.preventDefault(); if (press) _box.css({left: (originX + e.clientX - pressX), top: (originY + e.clientY - pressY)});}
		function mouseup(e) {press = false; originX += e.clientX - pressX; originY += e.clientY - pressY; _win.off({mousemove: mousemove, mouseup: mouseup});}
		selector.mousedown(mousedown);
	}
	function _fix(selector) {
		selector = $(selector)[0];
		if (!selector || holder.indexOf(selector) > -1) return false;
		holder.splice(holder.indexOf(selector), 1);
		selector = $(selector);
		selector.off("mousedown");
	}
	return {drag: _drag, fix: _fix};
})();
const cWin = (() => {
	const allWindows = [];
	const _win = $(window);
	let zIndex = 1010;
	let _document;
	let _body;
	function init(selector, opt) {
		_document = _document || $(document);
		_body = _body || $("body");
		let $selector = $(selector);
		opt = opt || ($selector.selector ? {} : (selector || {}));
		selector = $selector.selector ? $selector : _body;
		// 构造
		let _shadow = $('<div class="c-window-shadow"></div>');
		if (opt.shadow) selector.append(_shadow);
		let _box = $(`<div class="c-window-box" style="z-index: ${++zIndex};"></div>`);
		let _titleBox = $(`<div class="c-window-title">${opt.title}&nbsp;</div>`);
		if (opt.closeButton) _titleBox.append($('<a class="c-window-close"></a>').click(_close));
		let _contentBox = $('<div class="c-window-content"><div class="loading-line"><div></div><div></div><div></div><div></div><div></div></div></div>');
		let _consoleBox = $('<div class="c-window-console"></div>');
		if (opt.ltr) _consoleBox.css("justify-content", "flex-start");
		let _yes = $('<a class="button default">' + (opt.yesWord || '确定') + '</a>').click(opt.yesFunc ? function() {opt.yesFunc.bind(_console)(_console)} : '');
		let _no = $('<a class="button empty">' + (opt.noWord || '取消') + '</a>').click(opt.noFunc ? function() {opt.noFunc.bind(_console)(_console)} : _close);
		if (!opt.hideYes) _consoleBox.append(_yes);
		if (!opt.hideNo) {if (opt.noFirst) _consoleBox.prepend(_no); else _consoleBox.append(_no);}
		_box.append(_titleBox, _contentBox, _consoleBox);
		if (opt.width) _box.css({width: opt.width + "px", left: "calc(50% - " + opt.width/2 + "px)"});
		selector.append(_box);
		// 延时填充
		let _dd = (opt.url ? (opt.method == "post" ? $.post(opt.url) : $.get(opt.url)) : $.Deferred().resolve()).always(function(a, b, c) {
			_contentBox.html(b == "success" ? (a.value || a.msg || a || opt.content) : (b == "error" ? c : opt.content || " "));
			let top = `calc(50% - ${_box.height() / 2}px)`;
			let left = `calc(50% - ${_box.width() / 2}px)`;
			_box.css({top: top, left: left});
			if (_box.offset().top < 0) _box.css("top", "1em");
		});
		// 事件
		let _dragHolder;
		function _drag() {_dragHolder = cDrag.drag(_titleBox, _box); return _console;}
		function _fix() {if (_dragHolder) _dragHolder.fix(); return _console;}
		function _close() {
			_box.trigger("cfunc.onclose").remove();
			_shadow.remove();
			allWindows.splice(allWindows.indexOf(_console), 1);
		}
		if (opt.drag) _drag();
		_box.mousedown(e => _box.css("z-index", ++zIndex));
		
		var _console = {
			box: _box,
			content: _contentBox,
			close: _close,
			onclose: func => {_box.on("cfunc.onclose", func); return _console;},
			setYes: func => {_yes.click(func); return _console;},
			setNo: func => {_no.click(func); return _console;},
			unbindYes: func => {if (func) _yes.off("click", func); else _yes.off("click"); return _console;},
			unbindNo: func => {if (func) _no.off("click", func); else _no.off("click"); return _console;},
			hide: () => {_box.hide(); return _console;},
			show: () => {_box.css("display", ""); return _console;},
			find: select => _contentBox.find(select),
			drag: _drag,
			fix: _fix,
			done: func => _dd.always(() => {func(_console)})
		};
		allWindows.push(_console);
		return _console;
	}
	function closeALL() {allWindows.forEach(function(_win) {_win.close()})}
	const _console = {
		open: init,
		closeAll: closeALL,
		all: allWindows
	};
	return _console;
})();
const cAlert = (() => {
	let isShow = false;
	let _body;
	function _cAlert(msg, time, opt = {}) {
		_body = _body || $("body");
		if (time != undefined && typeof time != "number") (opt = time) && (time = 3000);
		if (!opt.多例 && isShow) return;
		if (!opt.多例) isShow = true;
		if (time <= 0) time = 3000;
		var _box = $("<div class='c-alert-box'><div class='c-alert-content'>" + msg + "</div></div>");
		_body.append(_box);
		_box.click(function() {_removeAlertBox(_box, opt.多例);});
		setTimeout(function() {_removeAlertBox(_box, opt.多例);}, time);
		switch (opt.type) {
		case 1:
			_box.addClass("sliderin").addClass("top");
			break;
		case 2:
			_box.addClass("sliderin").addClass("bottom");
			break;
		default:
			break
		}
		setTimeout(function() {_box.addClass("show");}, 30);
		return _box;
	}
	function _removeAlertBox(selector, 多例) {
		selector.removeClass("show");
		setTimeout(function() {selector.remove(); if (!多例) isShow = false;}, 500);
	}
	return _cAlert;
})();
const 绑定回车 = (selector, func) => selector.keydown(e => {if (e.which == 13 && !e.ctrlKey && !e.shiftKey && !e.altKey) {func(); return false;}});