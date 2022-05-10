module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  publicPath: '/',
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
