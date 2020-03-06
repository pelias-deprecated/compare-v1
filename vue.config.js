module.exports = {
  publicPath: process.env.SPA_MODE === 'true'
    ? '/'
    : '',
};
