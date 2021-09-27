const 右键菜单 = (function() {
	var menu_id = 0;
	const win = $(window);
	function _hide(e) {if (e.which == 1 && this.is(':visible') && !$(e.target).hasClass('c-右键菜单') && !$(e.target).parents(`.c-右键菜单`).length) this.hide()}
	function _show(e) {this.hide().width(); this.css({left: `${e.pageX}px`, top: `${e.pageY}px`}).show(); return false;} 
	function _removeMenu(_menu, _menu_key) {_menu.remove(); this.off(_menu_key); win.off(_menu_key);}
	const _addMenu = (box, buttons) => {
		if (!(box = $(box))[0]) return;
		const _menu_key = `.c-right-menu-${menu_id++}`;
		const _menu = $(`<div></div>`).addClass(`c-右键菜单`).append(...buttons.map(opt => $(`<a href="${opt.href || "javascript:void(0)"}">${opt.text}</a>`).on(opt.event || `click`, opt.func))).contextmenu(e => {e.preventDefault(); return false});
		$(document.body).append(_menu.hide());
		box.on(`contextmenu${_menu_key}`, _show.bind(_menu));
		win.on(`mousedown${_menu_key}`, _hide.bind(_menu));
		return {off: _removeMenu.bind(box, _menu, _menu_key)};
	};
	return {init: _addMenu};
})();