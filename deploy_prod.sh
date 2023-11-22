# npm version patch
# version=`node -e 'console.log(require("./package.json").version)'`
# echo "version $version"

# if [ "$version" != "" ]; then
#     git tag -a "v$version" -m "`git log -1 --format=%s`"
#     echo "Created a new tag, v$version"
#     git push --tags
#     npm publish
# fi

node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --configuration production --output-path=dist --base-href ./
cd dist

aws s3 sync --cache-control max-age=172800 . s3://panel.tiledesk.com/v3/dashboard/
aws cloudfront create-invalidation --distribution-id E2D4FS8NGUODM4 --paths "/*"
echo new version deployed on s3://panel.tiledesk.com/v3/dashboard/
echo available on https://panel.tiledesk.com/v3/dashboard/index.html



