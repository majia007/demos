import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('./');
const rootDir = path.resolve('./');

const links = [];
!(function build(files, dir) {
	files.forEach(file => {
		if (file.startsWith('.')) return;
		const filePath = path.resolve(dir, file);
		if (fs.statSync(filePath).isDirectory()) {
			build(fs.readdirSync(filePath), filePath);
		} else if (file.endsWith('.html')) {
			const htmlPath = path.relative(rootDir, filePath);
			links.push(`<p><a href="${htmlPath}">${htmlPath.replace(/index.html$/, '')}</a><p>`);
		}
	});
})(files, rootDir);

fs.writeFileSync('index.md', `
${links.join('\n')}
`, {encoding: 'utf8'});

console.log(new Date());
