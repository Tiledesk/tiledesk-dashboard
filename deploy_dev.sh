# CURR_VER=$(< current_version.txt)
# NEW_VER=$(($CURR_VER + 1))
# ng build --prod --base-href /$NEW_VER/
# cd dist
# sed 's/base href="/base href="\./' index.html > index2.html
# rm index.html
# mv index2.html index.html
# aws s3 sync . s3://tiledesk-dashboard/dashboard/dev/0/$NEW_VER/
# cd ..
# echo $NEW_VER > current_version.txt
# echo new version deployed on s3://tiledesk-dashboard/dashboard/dev/0/$NEW_VER/
# echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-dashboard/dashboard/dev/0/$NEW_VER/index.html




# npm version prerelease --preid=beta
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
# aws s3 sync . s3://tiledesk-dashboard/dashboard/dev/$version/
# echo new version deployed on s3://tiledesk-dashboard/dashboard/dev/$version/
# echo available on https://support.tiledesk.com/dashboard/dev/$version/index.html
aws s3 sync . s3://tiledesk-dashboard/dashboard/dev/2.0.0-beta.30/
echo new version deployed on s3://tiledesk-dashboard/dashboard/dev/2.0.0-beta.30/
echo available on https://support.tiledesk.com/dashboard/dev/2.0.0-beta.30/index.html