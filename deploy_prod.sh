# npm version patch
# version=`node -e 'console.log(require("./package.json").version)'`
# echo "version $version"

# if [ "$version" != "" ]; then
#     git tag -a "v$version" -m "`git log -1 --format=%s`"
#     echo "Created a new tag, v$version"
#     git push --tags
#     npm publish
# fi

ng build --prod --base-href ./
cd dist
# aws s3 sync . s3://tiledesk-dashboard/dashboard/
# aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*"
# echo new version deployed on s3://tiledesk-dashboard/dashboard/
# echo available on https://support.tiledesk.com/dashboard/index.html


####### tiledesk V2
aws s3 sync . s3://tiledesk-console/v2/dashboard/
echo new version deployed on s3://tiledesk-console/v2/dashboard/
echo available on https://console.tiledesk.com/v2/dashboard/index.html