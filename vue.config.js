module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  publicPath: '/',
  pluginOptions: {
    electronBuilder: {
      // List native deps here if they don't work
      externals: [],
      // If you are using Yarn Workspaces, you may have multiple node_modules folders
      // List them all here so that VCP Electron Builder can find them
      nodeModulesPath: ['../../node_modules', './node_modules'],
      builderOptions: {
        publish: [
          {
            provider: 'github',
            owner: 'mpwanyi256',
            private: false,
          },
        ],

      },
      preload: 'src/preload.js',
    },
  },
};

/*
.htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /smartPOS
    RewriteRule ^smartPOS/index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /smartPOS/index.html [L]
</IfModule>
*/
