const fs = require('fs');
const https = require('https');
const path = require('path');

const screens = [
  { name: 'Home', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1OTE1OTQwMGRhMGQwMzMyZmE3MzU5MTlkYjNiEgsSBxCWv9LkwxMYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTQyNjc0NDcwMDkwOTIxMjY1&filename=&opi=89354086' },
  { name: 'Explore_Events', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1OTE1OTFlZWU3MTQwOTI1YzJmNjQ2MjQ2YmQzEgsSBxCWv9LkwxMYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTQyNjc0NDcwMDkwOTIxMjY1&filename=&opi=89354086' },
  { name: 'Organizer_Dashboard', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1OTE1OTEyYTcxMmQwMjA3OWRjZGE5MDYwM2FmEgsSBxCWv9LkwxMYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTQyNjc0NDcwMDkwOTIxMjY1&filename=&opi=89354086' },
  { name: 'Login', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1OTE1OTExMWFlZWMwMWVlNjg5NTBmMTY1ZThjEgsSBxCWv9LkwxMYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTQyNjc0NDcwMDkwOTIxMjY1&filename=&opi=89354086' },
  { name: 'My_Tickets', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1OTE1Yjc5NGNmMmUwMzMyZmE3MzU5MTlkYjNiEgsSBxCWv9LkwxMYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTQyNjc0NDcwMDkwOTIxMjY1&filename=&opi=89354086' },
  { name: 'Fast_Checkin', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1OTE1YmUxN2E0OTkwNmRjM2Q2MThmMjBlN2M1EgsSBxCWv9LkwxMYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTQyNjc0NDcwMDkwOTIxMjY1&filename=&opi=89354086' },
  { name: 'Student_Dashboard', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1OTE1YzMyZTg4NWIwMWI0ZGYwNmFlMWM0NGNiEgsSBxCWv9LkwxMYAZIBIwoKcHJvamVjdF9pZBIVQhM1MTQyNjc0NDcwMDkwOTIxMjY1&filename=&opi=89354086' }
];

const dir = path.join(__dirname, 'stitch_screens');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const s of screens) {
    console.log(`Downloading ${s.name}...`);
    await download(s.url, path.join(dir, s.name + '.html'));
  }
  console.log('Done!');
}
run();
