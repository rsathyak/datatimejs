const rimraf = require('rimraf');
const fs = require('fs');

let data = require('../../data/meta/latest');
const links = require('../../data/meta/links');

let [OUTPUT_DIR] = process.argv.slice(2);


rimraf.sync(OUTPUT_DIR);
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

Object.assign(data.links, links);


const writeTzToFile = (str, filename) => {
  let arr = str.split('|');
  let file = filename || arr[0];
  file = file.replace(/\//g, '_');
  let path = `${OUTPUT_DIR}/${file}_${data.version}.json`;
  let output = [arr[2], arr[3], arr[4]].join('|');

  fs.writeFileSync(
    path,
    `{ "data" : "${output}" }`
  );
};

data.zones.forEach(string => writeTzToFile(string));

data.links.forEach(link => {
  let [from, to] = link.split('|');
  let string = data.zones.find(zone => {
    let [timezone] = zone.split('|');
    return timezone === from;
  });
  writeTzToFile(string, to);
});

fs.writeFileSync(`${OUTPUT_DIR}/version.json`, `{ "version" :"${data.version}" }`);
