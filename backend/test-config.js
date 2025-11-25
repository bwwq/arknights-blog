import fs from 'fs';
import path from 'path';

// Test reading config.json
const configPath = path.resolve(process.cwd(), '../config.json');

console.log('Current directory:', process.cwd());
console.log('Config path:', configPath);
console.log('File exists:', fs.existsSync(configPath));

if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Config content:', config);
    console.log('GitHub username:', config.githubUsername);
} else {
    console.log('Config file not found!');
}
