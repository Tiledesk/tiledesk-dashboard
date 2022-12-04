# npm version patch
# version=`node -e 'console.log(require("./package.json").version)'`
# echo "version $version"

# if [ "$version" != "" ]; then
#     git tag -a "v$version" -m "`git log -1 --format=%s`"
#     echo "Created a new tag, v$version"
#     git push --tags
#     npm publish
# fi

# ng build --prod --base-href ./
node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --configuration production --output-path=dist --base-href ./
cd dist
# aws s3 sync . s3://tiledesk-dashboard/dashboard/
# aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*"
# echo new version deployed on s3://tiledesk-dashboard/dashboard/
# echo available on https://support.tiledesk.com/dashboard/index.html


####### tiledesk V2
# aws s3 sync --cache-control max-age=172800 . s3://tiledesk-console/v2/dashboard/
# ## aws s3 sync ./index.html s3://tiledesk-console/v2/dashboard/ --exclude='*' --include='/index.html'
# ## aws s3 sync ./index.html s3://tiledesk-console/v2/dashboard/ --cache-control max-age=0
# echo new version deployed on s3://tiledesk-console/v2/dashboard/
# echo available on https://console.tiledesk.com/v2/dashboard/index.html

####### tiledesk V3 MQTT
aws s3 sync --cache-control max-age=172800 . s3://tiledesk-console/v3/dashboard/
## aws s3 sync ./index.html s3://tiledesk-console/v2/dashboard/ --exclude='*' --include='/index.html'
## aws s3 sync ./index.html s3://tiledesk-console/v2/dashboard/ --cache-control max-age=0
echo new version deployed on s3://tiledesk-console/v3/dashboard/
echo available on https://console.tiledesk.com/v3/dashboard/index.html

####### tiledesk V2 under latest
# aws s3 sync . s3://tiledesk-console/v2/dashboard/A14
# echo new version deployed on s3://tiledesk-console/v2/dashboard/A14
# echo available on https://console.tiledesk.com/v2/dashboard/A14/index.html

# ----------------
# aws s3 sync --cache-control max-age=172800 . s3://tiledesk-console/v2/dashboard/push-t4
# # aws s3 sync ./index.html s3://tiledesk-console/v2/dashboard/ --cache-control max-age=0
# echo new version deployed on s3://tiledesk-console/v2/dashboard/push-t4
# echo available on https://console.tiledesk.com/v2/dashboard/push-t4/index.html


####### tiledesk V2 in version subfolder 
# aws s3 sync . s3://tiledesk-console/v2/dashboard/2.2.40-frgnd-test/
# echo new version deployed on s3://tiledesk-console/v2/dashboard/2.2.40-frgnd-test
# echo available on https://console.tiledesk.com/v2/dashboard/2.2.40-frgnd-test/index.html