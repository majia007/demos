import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('./').filter(item => !item.match(/buildIndex|index.html/));
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
			links.push(`<p><a href="${htmlPath}">${htmlPath}</a>><p>`);
		}
	});
})(files, rootDir);

fs.writeFileSync('index.html', `
<html lang="zh_CN">
<head>
<title>demo list</title>
<meta charset="UTF-8">
</head>
<body>
${links.join('\n')}
</body>
</html>    
`, {encoding: 'utf8'});

console.log(new Date());
