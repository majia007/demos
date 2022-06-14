// 缩写
const qs: typeof document.querySelector = (e) => document.querySelector(e);
const qsa: typeof document.querySelectorAll = (e) => document.querySelectorAll(e);
const dgi: typeof document.getElementById = (e) => document.getElementById(e);
// 判断
function isCheck(input: HTMLInputElement) {
	return ['radio', 'checkbox'].includes(input.type);
}
// 获取输入框的值
function getValue(input: HTMLInputElement): number {
	if (isCheck(input)) return +input.checked;
	return input.value.match(/[^\d.]/) && +(eval(input.value)) || +input.value || 0;
}
// 格式化数字
function showValue(num: number, rate: number = 1): number {
	return (Math.round(num * 100 * rate)) / 100;
}
// 打开新窗口
function openNewWindow(width = 450, height = 880) {
	window.open(location.href, '_blank', `width=${width},height=${height},left=${window.screenLeft + 32},top=${window.screenTop + 32}`);
}
// 绑定 input 相关数值操作
(function () {
	function handleFocus(e) {
		if (e.target instanceof HTMLInputElement) e.target.select();
	}
	function handleInput(e) {
		if ((e.target instanceof HTMLInputElement)) {
			const input = e.target;
			if (!input.id) return;
			if (isCheck(input)) {
				if (input.type === 'radio') {
					input.name && localStorage.setItem(input.name, input.id);
				} else {
					localStorage.setItem(input.id, input.checked ? 'true' : 'false');
				}
			} else {
				localStorage.setItem(input.id, input.value);
			}

		}
		window['计算']?.();
	}
	function handleWheel(e) {
		if ((e.target instanceof HTMLInputElement)) {
			const input = e.target;
			if (input.value.match(/\w \w/)) return;
			const offset = (e.deltaY < 0 ? 1 : -1);
			input.value = String(Math.round(100 * (getValue(input) + offset * (+input.dataset.step || 1))) / 100);
			input.value = String(Math.min(Math.max(+input.value, +(input.dataset.min || input.min) || 0), +(input.dataset.max || input.max) || 9e9));
			handleInput(e);
		}
	}
	function handleKeydown(e: KeyboardEvent) {
		if ((e.target instanceof HTMLInputElement)) {
			const input = e.target;
			if (input.value.match(/\w \w/)) return;
			const offset = e.code === 'ArrowUp' ? 1 : e.code === 'ArrowDown' ? -1 : 0;
			if (!offset) return;
			e.preventDefault();
			input.value = String(Math.round(100 * (getValue(input) + offset * (+input.dataset.step || 1))) / 100);
			input.value = String(Math.min(Math.max(+input.value, +(input.dataset.min || input.min) || 0), +(input.dataset.max || input.max) || 999999));
			handleInput(e);
		}
	}
	document.addEventListener('focusin', handleFocus);
	document.addEventListener('input', handleInput);
	document.addEventListener('wheel', handleWheel);
	document.addEventListener('keydown', handleKeydown);
})();
function bindValue(input: HTMLInputElement) {
	const id = input.id;
	if (!id) return;
	if (isCheck(input)) {
		if (input.type === 'radio') {
			if (input.name && (localStorage.getItem(input.name) !== null)) {
				input.checked = localStorage.getItem(input.name) === input.id;
			}
		} else {
			if (localStorage.getItem(id) !== null) {
				input.checked = localStorage.getItem(id) === 'true';
			}
		}
	} else {
		input.value = localStorage.getItem(id) || input.dataset.default || '0';
	}
}
// 初始化绑定
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('input').forEach(bindValue);
	window['计算']?.();
});
