class Ball {
	static get 拉伸类型_投影() {return 1}
	static get 拉伸类型_放射() {return 2}
	constructor(id, nx = 1, ny = 1, vx = 0, vy = 0, ax = 0, ay = 0, r = 1, attr = {}, p = 1, d = 2) {
		this.id = id;
		this.nx = nx;
		this.ny = ny;
		this.vx = vx;
		this.vy = vy;
		this.ax = ax;
		this.ay = ay;
		this.r = r;
		this.attr = attr;
		this.p = p;
		this.d = d;
		this.bumped = [];
	}
	setbox(width, height) {
		this.boxwidth = width;
		this.boxheight = height;
		return this;
	}
	inbox(border = [1,2,3,4], calR = true) {
		if (!Array.isArray(border)) border = [border];
		if (border.includes(1) && (this.ny < 0 || (calR && this.ny < this.r))) return false;
		if (border.includes(2) && (this.nx > this.boxwidth || (calR && this.nx > this.boxwidth - this.r))) return false;
		if (border.includes(3) && (this.ny > this.boxheight || (calR && this.ny > this.boxheight - this.r))) return false;
		if (border.includes(4) && (this.nx < 0 || (calR && this.nx < this.r))) return false;
		return true;
	}
	onball(x, y) {
		if (Math.abs(this.nx - x) > this.r || Math.abs(this.ny - y) > this.r) return false;
		if ((this.nx - x) * (this.nx - x) + (this.ny - y) * (this.ny - y) > this.r * this.r) return false;
		return true;
	}
	lockball() {this.lock = true;}
	bindmove(holder, _clickx, _clicky, drawtype = Ball.拉伸类型_投影) {
		this.lock = true;
		this.vx = this.vy = 0;
		this._originx = this.nx;
		this._originy = this.ny;
		this._offsetx = this.nx - _clickx;
		this._offsety = this.ny - _clicky;
		let _oldx = this.nx;
		let _oldy = this.ny;
		let _timer = 0;
		this._movefunc = this._movefunc || (e => {
			window.clearInterval(_timer);
			this.nx = e.pageX + this._offsetx;
			this.ny = e.pageY + this._offsety;
			cdebug(`移动后 nx: ${this.nx}, ny: ${this.ny}`);
			switch (drawtype) {
			case Ball.拉伸类型_放射:
				if (!this.inbox()) {
					let p = new PP(this.nx - this._originx, this.ny - this._originy)
					if (!this.inbox(1)) this.nx = this._originx - (this._originy) / Math.tan(p.a);
					if (!this.inbox(2)) this.ny = this._originy + (this.boxwidth - this._originx) * Math.tan(p.a);
					if (!this.inbox(3)) this.nx = this._originx + (this.boxheight - this._originy) / Math.tan(p.a);
					if (!this.inbox(4)) this.ny = this._originy - (this._originx) * Math.tan(p.a);
				}
				cdebug(`计算后 nx: ${this.nx}, ny: ${this.ny}`);
			case Ball.拉伸类型_投影:
				if (!this.inbox(1)) this.ny = this.r;
				if (!this.inbox(2)) this.nx = this.boxwidth - this.r;
				if (!this.inbox(3)) this.ny = this.boxheight - this.r;
				if (!this.inbox(4)) this.nx = this.r;
				cdebug(`计算后 nx: ${this.nx}, ny: ${this.ny}`);
				break;
			}
			this.vx = this.nx - _oldx;
			this.vy = this.ny - _oldy;
			_oldx = this.nx;
			_oldy = this.ny;
			_timer = window.setInterval(() => {if (this.lock) this.vx = this.vy = 0;}, 500);
		});
		holder.mousemove(this._movefunc);
	}
	unbindmove(holder) {
		cdebug(this);
		this.lock = false;
		holder.off("mousemove", this._movefunc);
	}
	toString() {return Object.keys(this).map(val => `${val}: ${this[val]}`).join(", ")	}
	move(loss = 0, bumpwall = true, width = this.boxwidth, height = this.boxheight) {
		if (this.lock) return;
		let oldnx = this.nx;
		let oldny = this.ny;
		this.nx += this.vx + 0.5 * this.ax;
		this.ny += this.vy + 0.5 * this.ay;
		if (bumpwall) {
			let onx, ony;
			if (this.nx <= this.r) {
				this.nx = this.r;
				this.vx = (loss - 1) * this.vx;
				onx = this.ax <= 0;
			}
			if (this.nx + this.r >= width) {
				this.nx = width - this.r;
				this.vx = (loss - 1) * this.vx;
				onx = this.ax >= 0;
			}
			if (this.ny <= this.r) {
				this.ny = this.r;
				this.vy = (loss - 1) * this.vy;
				ony = this.ay <= 0;
			}
			if (this.ny + this.r >= height) {
				this.ny = height - this.r;
				this.vy = (loss - 1) * this.vy;
				ony = this.ay >= 0;
			}
			if (!onx) this.vx += this.ax;
			else if (this.ax != 0 && this.vx > -this.ax / 2) this.vx = 0;
			else this.nx = this.nx - (this.nx - oldnx) * (1 - loss) * (1 - loss); // 末端距离补偿
			if (!ony) this.vy += this.ay;
			else if (this.ay != 0 && this.vy > -this.ay / 2) this.vy = 0;
			else this.ny = this.ny - (this.ny - oldny) * (1 - loss) * (1 - loss);
			if (Math.abs(this.vx) < 0.01) {
				this.vx = 0;
				this.stopx = onx;
			}
			if (Math.abs(this.vy) < 0.01) {
				this.vy = 0;
				this.stopy = ony;
			}
			this.bumped.length = 0;
		}
	}
	static bump(b1, b2, loss = 0) {
		var distance = Math.sqrt(Math.pow(b1.nx - b2.nx, 2) + Math.pow(b1.ny - b2.ny, 2)) - b1.r - b2.r;
		if (distance > 0) return;
		if (b1.bumped.includes(b2.id) || b1.id == b2.id) return;
		b1.bumped.push(b2.id);
		b2.bumped.push(b1.id);

		let ia = Math.atan((b2.ny - b1.ny) / (b2.nx - b1.nx)) + ((b2.nx - b1.nx) < 0 ? Math.PI : 0) || 0;
		let p1 = new PP(b1.vx, b1.vy);
		let p2 = new PP(b2.vx, b2.vy);
		let v1r = p1.p * Math.cos(p1.a - ia);
		let v2r = p2.p * Math.cos(p2.a - ia);
		if (v2r > v1r) return;

		let _v1r, _v2r;
		let v1t = p1.p * Math.sin(p1.a - ia);
		let v2t = p2.p * Math.sin(p2.a - ia);
		let m1 = Math.pow(b1.r, b1.d) * b1.p;
		let m2 = Math.pow(b2.r, b2.d) * b2.p;
		if (m1 == 0 || m2 == 0) m1 = m2 = 1;
		if (b1.stopx && b1.stopy || b1.lock) m1 = m2 * 9e99;
		else if (b2.stopx && b2.stopy || b2.lock) m2 = m1 * 9e99;

		cdebug(`碰撞前b1 ${b1.toString()}`);
		cdebug(`碰撞前b2 ${b2.toString()}`);
		cdebug(`ia = ${ia / Math.PI * 180}`);
		let bump_wall;
		if (!b1.stopx != !b1.stopy || !b2.stopx != !b2.stopy) {
			bump_wall = true;
			let exz, exb;
			exz = exb = 0;
			if (b1.stopy && ((b1.ny == b1.r && ia > 0 && ia < Math.PI) || (b1.ny != b1.r && (ia < 0 || ia > Math.PI)))) {
			} else if (b2.stopy && ((b2.ny == b2.r && (ia < 0 || ia > Math.PI)) || (b2.ny != b2.r && ia < Math.PI && ia > 0))) {
				exb = 1;
			} else if (b1.stopx && ((b1.nx == b1.r && Math.abs(ia) < 0.5 * Math.PI) || (b1.nx != b1.r && ia < 1.5 * Math.PI && ia > 0.5 * Math.PI))) {
				exz = 1;
			} else if (b2.stopx && ((b2.nx == b2.r && ia < 1.5 * Math.PI && ia > 0.5 * Math.PI) || (b2.nx != b2.r && Math.abs(ia) < 0.5 * Math.PI))) {
				exz = exb = 1;
			} else bump_wall = false;
			if (bump_wall) {
				if (exb) { // b2贴边静止
					[b1, b2] = exVal(b1, b2);
					[m1, m2] = exVal(m1, m2);
					[v1r, v2r] = exVal(v1r, v2r);
					[v1t, v2t] = exVal(v1t, v2t);
				}
				if (exz) ia = Math.PI / 2 - ia; // xy轴翻转
				let _b1vx = exz ? b1.vy : b1.vx;
				_v2r = (v2r * (Math.cos(ia) * Math.cos(ia) * m2 - m1) + 2 * m1 * _b1vx * Math.cos(ia)) / (Math.cos(ia) * Math.cos(ia) * m2 + m1);
				let _vx = (2 * m2 * Math.cos(ia) * v2r - m2 * Math.cos(ia) * Math.cos(ia) * _b1vx + m1 * _b1vx) / (m2 * Math.cos(ia) * Math.cos(ia) + m1);
				if (exz) b1.vy = _vx; else b1.vx = _vx;
			}
		}
		if (!bump_wall) {
			_v1r = ((m1 - m2) * v1r + 2 * m2 * v2r) / (m1 + m2);
			_v2r = ((m2 - m1) * v2r + 2 * m1 * v1r) / (m1 + m2);
		}
		cdebug(`碰撞后 _v1r: ${_v1r}, _v2r: ${_v2r}`);
		if (_v1r) b1.vx = Math.round((_v1r * Math.cos(ia) - v1t * Math.sin(ia)) * (1 - loss) * 1e9) / 1e9;
		if (_v1r) b1.vy = Math.round((_v1r * Math.sin(ia) + v1t * Math.cos(ia)) * (1 - loss) * 1e9) / 1e9;
		if (_v2r) b2.vx = Math.round((_v2r * Math.cos(ia) - v2t * Math.sin(ia)) * (1 - loss) * 1e9) / 1e9;
		if (_v2r) b2.vy = Math.round((_v2r * Math.sin(ia) + v2t * Math.cos(ia)) * (1 - loss) * 1e9) / 1e9;
		cdebug(`碰撞后 b1.vx: ${b1.vx}, b1.vy: ${b1.vy}`);
		cdebug(`碰撞后 b2.vx: ${b2.vx}, b2.vy: ${b2.vy}`);

		if (Math.abs(b1.vx) < 0.01) b1.vx = 0;
		if (Math.abs(b1.vy) < 0.01) b1.vy = 0;
		if (Math.abs(b2.vx) < 0.01) b2.vx = 0;
		if (Math.abs(b2.vy) < 0.01) b2.vy = 0;
		if (b1.vx != 0) b1.stopx = false;
		if (b1.vy != 0) b1.stopy = false;
		if (b2.vx != 0) b2.stopx = false;
		if (b2.vy != 0) b2.stopy = false;
		cdebug(b1.toString());
		cdebug(b2.toString());
	}
}
/** 极坐标 */
class PP {
	static get TYPE_XY() {return 1}
	static get TYPE_PP() {return 2}
	get x() {return this._x;}
	get y() {return this._y;}
	get p() {return this._p;}
	get a() {return this._a;}
	set x(val) {
		this._x = val;
		this._p = Math.sqrt(this._x * this._x + this._y * this._y);
		this._a = Math.atan(this._y / this._x) + (this._x < 0 ? Math.PI : 0) || 0;
	}
	set y(val) {
		this._y = val;
		this._p = Math.sqrt(this._x * this._x + this._y * this._y);
		this._a = Math.atan(this._y / this._x) + (this._x < 0 ? Math.PI : 0) || 0;
	}
	set p(val) {
		this._p = val;
		this._x = Math.cos(this._a) * this._p;
		this._y = Math.sin(this._a) * this._p;
	}
	set a(val) {
		this._a = val;
		this._x = Math.cos(this._a) * this._p;
		this._y = Math.sin(this._a) * this._p;
	}
	constructor(a, b, type = PP.TYPE_XY) {
		switch (type) {
		case PP.TYPE_XY:
			this._x = a;
			this._y = b;
			this._p = Math.sqrt(a * a + b * b);
			this._a = Math.atan(b / a) + (a < 0 ? Math.PI : 0) || 0;
			break;
		case PP.TYPE_PP:
			this._p = a;
			this._a = b;
			this._x = Math.cos(b) * a;
			this._y = Math.sin(b) * a;			break;
		default:
			break;
		}
	}
}