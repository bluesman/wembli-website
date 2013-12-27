#main site
lessc less/style.less > public/css/style.css

#admin
#lessc less/admin/style.less > public/admin/css/style.css

#directories
lessc less/directory/default/1/style.less > public/css/directory-default-1-style.css
echo "compiled less...";
