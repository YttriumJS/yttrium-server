// Used in jquerating POST/PUT request bodies
module.exports = req => new Promise((resolve, reject) => {
  let body = [];
  req.on('error', reject)
    .on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(body);
    });
});
