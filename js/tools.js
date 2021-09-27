$(function() {
	// 调整窗口大小后重新绘制图表，防止错位
	$(window).resize(redrawEcharts);
});
$.fn.extend({
	startLoading: function() {this.prepend('<div class="loading-line"><div></div><div></div><div></div><div></div><div></div></div>');},
	endLoading: function() {this.find(".loading-line").remove();}
});
function xzpost(url, param, noTip) {
	if (noTip) {
		return $.post(url, param);
	} else {
		return $.post(url, param).done(function(data) {
			if (!data.success && data.msg) cAlert(data.msg);
		}).fail(function(e) {
			cAlert("网络异常：" + e.status);
		});
	}
}
function redrawEcharts() {
	var _areas = $(DrawAreaHolder).filter(":visible");
	for (var j = 0; j < _areas.length; j++) {
		var _ele = _areas[j];
		var i = DrawAreaHolder.indexOf(_ele);
		var _echartsArea = echarts.init(_ele);
		EchartsHolder[i] = _echartsArea;
		OptionHolder[i].animation = false;
		_echartsArea.setOption(OptionHolder[i]);
	}
}
var DrawAreaHolder = [];
var EchartsHolder = [];
var OptionHolder = [];
/**
 * opt {缩放: false, 显示所有X轴标签: false, x轴标签格式: xAxis.axisLabel.formatter, 横向: false, 缩放: false, label: false, showLegend: false}
 */
function 绘制柱状图(selector, x轴, data, opt) {
	opt = opt || {};
	var i = DrawAreaHolder.indexOf(selector[0]);
	if (i == -1) {
		i = DrawAreaHolder.push(selector[0]) - 1;
		var 图像区域 = echarts.init(selector[0]);
		EchartsHolder[i] = 图像区域;
	} else {
		var 图像区域 = EchartsHolder[i];
	}
	var _xAxis = {
		type: 'category',
		axisLabel: {},
		boundaryGap: true,
		data: x轴,
	};
	if (opt.显示所有X轴标签) _xAxis.axisLabel.interval = 0;
	if (opt.x轴标签格式) _xAxis.axisLabel.formatter = opt.x轴标签格式;
	var _yAxis = {
		axisTick: {length: 0},
		axisLine: {show: false},
		axisLabel: {margin: 16},
		minInterval: 1,
		min: 0,
		splitLine :{lineStyle:{type: "dotted"}}
	};
	var xAxis =  _xAxis;
	var yAxis = _yAxis;
	if (opt.横向) {
		xAxis = _yAxis;
		yAxis = _xAxis;
	}
	var option = {
		title: {show: false},
		grid: {top: 35, left: 60, right: 60, bottom: 40, containLabel: true},
		backgroundColor: "#ffffff",
		animation: true,
		tooltip: {trigger: 'axis', axisPointer: {type: 'shadow', lineStyle: {opacity: 0.3}}},
		legend: {data: [], bottom: 20},
		// dataZoom : {type: "inside"},
		xAxis: xAxis,
		yAxis: yAxis,
		color: ["#0099cc", "#cdebf5"],
		series: []
	};
	if (opt.缩放) option.dataZoom = {type: "inside"};
	data.forEach(function(_data, i) {
		var _serie = {
			name: _data.name,
			type: 'bar',
			label: {normal: {position: "top", formatter: "{c} 次"}},
			barMaxWidth: "66px",
			data: _data.value
		}
		if (opt.label) {
			_serie.label.normal.show = true;
			_serie.label.normal.position = "top";
			_serie.label.normal.textStyle = {color: opt.labelColor || "#999999"};
		}
		option.series.push(_serie);
		if (opt.showLegend) {
			option.grid.bottom = 60;
			option.legend.data.push({name: _data.name, icon: "rect"});
		}
	});
	OptionHolder[i] = option;
	图像区域.setOption(option);
}
function 绘制折线图(selector, x轴, data, opt) {
	var 图像区域;
	var index = DrawAreaHolder.indexOf(selector[0]);
	if (index == -1) {
		index = DrawAreaHolder.push(selector[0]) - 1;
		图像区域 = echarts.init(selector[0]);
		EchartsHolder[index] = 图像区域;
	} else {
		图像区域 = EchartsHolder[index];
	}
	var color = ["#0099cc"];
	var showLegend = false;
	if (data.length == 2) {
		color = ["#ccc", "#0099cc"];
		showLegend = true;
	}
	var option = {
		title: {show: false},
		grid: {top: 35, bottom: 30, left: 60, containLabel: true},
		backgroundColor: "#ffffff",
		animation: true,
		tooltip: {trigger: 'axis', axisPointer: {type: 'line', lineStyle: {opacity: 0}}},
		legend: {data: [], bottom: 20},
		xAxis: {
			type: 'category',
			boundaryGap: true,
			data: x轴,
			axisTick: {alignWithLabel: true, interval: 0}
		},
		yAxis: {
			axisTick: {length: 0},
			axisLine: {show: false},
			axisLabel: {margin: 16},
			splitLine :{lineStyle:{type: "dotted"}}
		},
		color: color,
		series: []
	};
	if (x轴 == null) {
		option.series = [{
				name: opt && opt.name || "",
				type: 'line',
				smooth: true,
				showSymbol: true,
				showAllSymbol: true,
				symbol: 'circle',
				symbolSize: 6,
				itemStyle: {normal: {color: "#0099cc"}},
				lineStyle: {normal: {width: 3}},
				areaStyle: {normal: {opacity: 0.2}},
				data: data
		}];
		option.xAxis = {type: "value", name: opt && opt.name || "", splitLine: {show: false}};
		option.yAxis.axisLine.show = true;
		option.yAxis.name = opt && opt.y轴名 || "",
		option.tooltip.axisPointer.lineStyle.opacity = 0.5;
		if (opt && opt.tooltipFormat) option.tooltip.formatter = opt.tooltipFormat;
		if (opt && opt.dataZoom) {
			option.grid.bottom = 60;
			option.dataZoom = [{
				type: "inside",
				minSpan : 25,
				start: 25,
				end: 75
			}, {
				type: "slider",
				bottom: 20
			}];
		}
	} else {
		data.forEach(function(_data, i) {
			var _serie = {
					name: _data.name,
					type: 'line',
					smooth: true,
					showSymbol: true,
					showAllSymbol: true,
					symbol: 'circle',
					symbolSize: 10,
					itemStyle: {normal: {color: color[i]}},
					lineStyle: {normal: {width: 3}},
					areaStyle: {normal: {opacity: 0.2}},
					data: _data.value
			}
			option.series.push(_serie);
			if (showLegend) {
				option.grid.bottom = 60;
				option.legend.data.push({name: _data.name, icon: "rect"});
			}
		});
	}
	OptionHolder[index] = option;
	图像区域.setOption(option);
}
function 绘制本地缓存数据明细表(selector, keys, data, index, rows, sort) {
	var _data = eval(data);
	if (_data == undefined) return;
	_data = JSON.parse(_data);
	if (typeof sort == "function") _data.sort(sort);
	var showData = _data.slice(index*rows, index*rows+rows);
	绘制表格(selector, keys, showData, rows);
	var 分页 = selector.parents(".表格").find(".分页");
	if (分页.length != 0) {
		分页.html(生成分页((index+1),(Math.ceil(_data.length/rows))));
		分页.find(".分页按钮").not(".disable").click(function(e) {
			var jump = +$(this).data("jump");
			绘制本地缓存数据明细表(selector, keys, data, (jump-1), rows, sort);
		});
	}
}
function 查询并绘制数据明细表(selector, url, param, keys, index, pageSize, opt){
	if (typeof opt != "boolean") opt = opt || {};
	else opt = {count: opt};
	param.start = index*pageSize;
	param.row = pageSize;
	var loadingArea = selector.parents("table");
	loadingArea.startLoading();
	return xzpost(url, param).done(function(result) {
		if (result.success) {
			var list = result.value;
			if (opt.sort) list.sort(opt.sort);
			绘制表格(selector, keys, list, opt.rows == undefined ? pageSize : opt.rows);
			var 分页 = selector.parents(".表格").find(".分页");
			if (+pageSize > 0 && 分页.length > 0) {
				var _countBlock = "";
				if (opt.count) _countBlock = "<span class='总计'>总计：<span style='color: #319CFF;'>" + result.dataCount + "</span> 条</span>";
				分页.html(_countBlock + 生成分页((index+1),(Math.ceil(result.dataCount/pageSize))));
				分页.find(".分页按钮").not(".disable").click(function(e) {
					var jump = +$(this).data("jump");
					查询并绘制数据明细表(selector, url, param, keys, (jump-1), pageSize, opt);
				});
			}
		}
	}).always(function(){
		loadingArea.endLoading();
	});
}
function 绘制表格(selector, keys, data, rows) {
	var _data = data || [].slice(0);
	var _tbody = "";
	if (!(+rows > 0)) rows = _data.length;
	for (var i = 0; i < rows; i++) {
		_tbody += "<tr>";
		if (_data.length == 0 && i == 0) {
			_tbody += "<td colspan='" + keys.length + "' style='text-align: center; color: #aaa;'>暂无数据</td></tr>";
			selector.html(_tbody);
			return;
		}
		for (var j=0; j<keys.length; j++) {
			if (_data[i] != undefined) {
				if (typeof keys[j] == "string") {
					if (_data[i][keys[j]] == null) {
						_tbody += "<td>---</td>";
					} else {
						_tbody += "<td>" + _data[i][keys[j]] + "</td>";
					}
				} else if (typeof keys[j] == "object") {
					_tbody += "<td>" + keys[j].deal(_data[i][keys[j].key], _data[i], _data) + "</td>";
				} else {
					_tbody += "<td></td>";
				}
			} else {
				_tbody += "<td></td>";
			}
		}
		_tbody += "</tr>";
	}
	selector.html(_tbody);
}
function 生成分页(index, max) {
	var l1 = "<a class='分页按钮' data-jump='" + 1 + "'><<</a>";
	var l2 = "<a class='分页按钮' data-jump='" + (index - 1) + "'><</a>";
	var r1 = "<a class='分页按钮' data-jump='" + (index + 1) + "'>></a>";
	var r2 = "<a class='分页按钮' data-jump='" + max + "'>>></a>";
	var main = "";
	if (index == 1) {
		l1 = "<a class='分页按钮 disable' data-jump='" + 1 + "'><<</a>";
		l2 = "<a class='分页按钮 disable' data-jump='" + (index - 1) + "'><</a>";
	}
	if (max == 0 || index == max) {
		r1 = "<a class='分页按钮 disable' data-jump='" + (index + 1) + "'>></a>";
		r2 = "<a class='分页按钮 disable' data-jump='" + max + "'>>></a>";
	}
	var length = 0;
	for(var i = index - 2; i <= max; i++) {
		if( i > 0 && i <=max) {
			if (index == i) {
				main += "<a class='分页按钮 active' data-jump='" + i + "'>" + i + "</a>";
			} else {
				main += "<a class='分页按钮' data-jump='" + i + "'>" + i + "</a>";
			}
			length++;
		}
		if (length == 5) break;
	}
	return l1+l2+main+r1+r2;
}
function 补位(num, add,length) {
	if (!add) add = "0";
	if (!length) length = 2;
	for (var i=0; i<(length-(""+num).length); i++) {
		num = add + num;
	}
	return num;
}
function 日期格式化(date, split, 不带时分秒) {
	date = new Date(date);
	if (!split) split="/";
	if (不带时分秒) return date.getFullYear() + split + 补位(date.getMonth()+1) + split + 补位(date.getDate());
	return date.getFullYear() + split + (date.getMonth()+1) + split + date.getDate() + " 00:00:00";
}
function 时间格式化(date, 日) {
	date = new Date(date);
	if (日 == true) return 补位(date.getHours()) + ":" + 补位(date.getMinutes()) + ":" + 补位(date.getSeconds());
	return date.getFullYear() + "-" + 补位(date.getMonth()+1) + "-" + 补位(date.getDate()) + " " + 补位(date.getHours()) + ":" + 补位(date.getMinutes()) + ":" + 补位(date.getSeconds());
}
function 时长格式化(time) {
	var _time = ""
	if (time >= 3600) _time += Math.floor(time/3600) + ":";
	if (time >= 60) _time += Math.floor(time%3600/60) + "'";
	return _time + time%60 + "''";
}
function 格式化为百分数(n, noArrow) {
	if ("" + n == "Infinity") {
		if (noArrow) return "∞%";
		return "<i class='icon icon-升高'></i><span style='color:#cc1a23'> ∞%</span>"
	}
	n = Math.round(n)/100;
	if (noArrow) {
		return n + " %";
	} else {
		if (n > 0) {
			return "<i class='icon icon-升高'></i><span style='color:#cc1a23'> " + n + "%</span>";
		} else if (n < 0) {
			return "<i class='icon icon-降低'></i><span style='color:#117b66'> " + Math.abs(n) + "%</span>";
		} else {
			return "<i class='icon icon-不变'></i><span style='color:#646464'> 0.00%</span>";
		};
	}
}
var cAlert, removeAlertBox;
(function(){
	var isShow = false;
	var _cAlert = function(msg, time, opt) {
		opt = opt || {};
		if (!opt.多例 && isShow) return;
		if (!opt.多例) isShow = true;
		if (typeof time != "number") time = 3000;
		var _box = $("<div class='c-alert-box'><div class='c-alert-content'>" + msg + "</div></div>");
		$("body").append(_box);
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
	var _removeAlertBox = function(selector, 多例) {
		selector.removeClass("show");
		setTimeout(function() {selector.remove(); if (!多例) isShow = false;}, 500);
	}
	cAlert = _cAlert;
	removeAlertBox = _removeAlertBox;
})();
var windowChangeTimeoutId;
function 切换窗口显示(selector, seconds) {
	seconds = seconds || 0.5;
	window.clearTimeout(windowChangeTimeoutId);
	selector.show();
	redrawEcharts();
	setTimeout(function() {
		selector.css({"z-index": 2, "transform":"translateX(0vw)", "transition": "transform " + seconds + "s"})
		.siblings("section").css({"z-index": 1, "transform": "translateX(-100vw)", "transition": "transform " + seconds + "s"});
	});
	windowChangeTimeoutId = setTimeout(function() {selector.siblings("section").hide();}, seconds + 66);
}
function xzPromptBox(ele) {
	ele = $(ele);
	var msg = ele.data("context");
	if (typeof msg == "string")  try {msg = JSON.parse(msg.replace(/'/g, '"')); } catch (e) {return;}
	if (!Array.isArray(msg)) return;
	var context = "";
	msg.forEach(function(val, i) {
		var _key = val.match(/^.*?[：:]/);
		var _value = val.replace(_key, "");
		context += (_key==null?"":"<span class='xzPromptBox-tag'>"+_key[0]+"</span>") + _value;
		if (i + 1 < msg.length) context += "<br>";
	})
	var _box = $("<div class='xzPromptBox'>" + context + "<div>");
	var _position = ele.offset();
	_box.css({left: (_position.left + ele.width() + 16) + "px", top: (_position.top  - 6) + "px"});
	$("body").append(_box);
	ele.on("mousewheel", function(e){return false;});
	ele.mouseout(function() {
		_box.remove();
		ele.off("mouseout");
		ele.off("mousewheel");
	});
}
function getOptions(list) {
	var s="";
	$.each(list, function(key, val) {if (val != undefined && key != undefined) s+="<option value='"+key+"'>"+val+"</option>";});
	return s;
}
/** 
 * @author CJw
 * box = xzConfirm.int(selector:css选择器, opt:{title: 标题, content: 内容, drag: 是否可拖曳, yesWord, yesFunc, noWord, noFunc, width: number px宽度}) <br>
 * box: {close: 关闭窗口, setYes: 确定按钮事件, setNo: 取消按钮事件, unbindYes: 解绑确定按钮点击事件, unbindNo: 解绑取消按钮点击事件, find: 查找内容, drag: 可拖曳, fix: 禁止拖曳}
*/
var xzConfirm = (function() {
	var allWindows = [];
	var _body;
	var _document;
	var _shadow = $('<div class="c-confirm-shadow"></div>');
	function init(selector, opt) {
		_body = _body || $("body");
		_document = _document || $(document);
		var $selector = $(selector);
		opt = opt || ($selector.selector ? {} : (selector || {}));
		selector = $selector.selector ? $selector : _body;
		// 构造
		if (opt.shadow) selector.append(_shadow);
		var _box = $('<div class="c-confirm-box"></div>');
		var _titleBox = $('<div class="c-confirm-title">' + (opt.title || '&nbsp;') + '</div>');
		if (opt.closeButton) {
			var _closeButton = $('<a class="c-confirm-close"></a>');
			_closeButton.click(_close);
			_titleBox.append(_closeButton);
		}
		var _contentBox = $('<div class="c-confirm-content"><div class="loading-line"><div></div><div></div><div></div><div></div><div></div></div></div>');
		var _consoleBox = $('<div class="c-confirm-console"></div>');
		if (opt.ltr) _consoleBox.css("justify-content", "flex-start");
		var _yes = $('<a class="button default">' + (opt.yesWord || '确定') + '</a>').click(opt.yesFunc ? function() {opt.yesFunc(_console)} : '');
		var _no = $('<a class="button empty">' + (opt.noWord || '取消') + '</a>').click(opt.noFunc ? function() {opt.noFunc(_console)} : _close);
		if (!opt.hideYes) _consoleBox.append(_yes);
		if (!opt.hideNo) _consoleBox.append(_no);
		_box.append(_titleBox, _contentBox, _consoleBox);
		if (opt.width) _box.css({width: opt.width + "px", left: "calc(50% - " + opt.width/2 + "px)"});
		selector.append(_box);
		// 延时填充
		var _dd = (opt.url ? (opt.method == "post" ? $.post(opt.url) : $.get(opt.url)) : $.Deferred().resolve()).always(function(a, b, c) {
			_contentBox.html(b == "success" ? (a.value || a.msg || a || opt.content) : (b == "error" ? c : opt.content || " "));
			if (_box.height() > _document.innerHeight() / 2) _box.css("top", "1em");
		});
		// 事件
		var canDrag = false;
		function _drag() {
			if (canDrag) return false;
			canDrag = true;
			var press = false;
			var originX = 0;
			var originY = 0;
			var pressX = 0;
			var pressY = 0;
			function mouserdown(e) {if (press) return false; press = true; pressX = e.clientX; pressY = e.clientY; _body.on({mousemove: mousemove, mouseup: mouseup}); return false;}
			function mousemove(e) {if (press) _box.css("transform", "translate(" + (originX + e.clientX - pressX) + "px, " + (originY + e.clientY - pressY) + "px)");}
			function mouseup(e) {press = false; originX += e.clientX - pressX; originY += e.clientY - pressY; _body.off({mousemove: mousemove, mouseup: mouseup}); return false;}
			_titleBox.mousedown(mouserdown);
		}
		function _fix() {canDrag = false; _titleBox.off("mousedown")}
		if (opt.drag) _drag();
		function _close() {
			_box.remove();
			_shadow.remove();
			allWindows.splice(allWindows.indexOf(_console), 1);
		}
		var _console = {
			// box: _box,
			content: _contentBox,
			close: _close,
			setYes: function(func) {_yes.click(func)},
			setNo: function(func) {_no.click(func)},
			unbindYes: function(func) {_yes.off("click", func)},
			unbindNo: function(func) {_no.off("click", func)},
			hide: function() {_box.hide()},
			show: function() {_box.css("display", "")},
			find: function(select) {return _contentBox.find(select);},
			drag: _drag,
			fix: _fix,
			done: function(func) {_dd.always(function() {func(_console)})}
		};
		allWindows.push(_console);
		return _console;
	}
	function closeALL() {allWindows.forEach(function(_win) {_win.close()})}
	var _console = {
		init: init,
		closeAll: closeALL,
		all: allWindows
	};
	return _console;
})();
var xzWorker = function(code, opt) {
	if (!code) throw new SyntaxError("code is null");
	opt = opt || {};
	var _preCode = "function deal(func) {addEventListener('message', function(e) {postMessage(func(e.data))})}\n";
	var _worker = new Worker(URL.createObjectURL(new Blob([_preCode + code])));
	var _onmessage = function(func) {_worker.addEventListener('message', function(e) {func(e.data)})}
	var _onerror = function(func) {_worker.addEventListener('error', function(e) {func(e.message)})}
	var _postMessage = function(msg) {_worker.postMessage(msg || "");}
	if (opt.data) _onmessage(opt.data);
	if (opt.error) _onerror(opt.error); else _onerror(function(e) {console.log(e)});
	if (opt.post) _postMessage(opt.post);
	var _console = {
		data: _onmessage,
		error: _onerror,
		post: _postMessage
	}
	return _console;
};