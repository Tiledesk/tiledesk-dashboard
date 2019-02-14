CURR_VER=$(< current_version.txt)
NEW_VER=$(($CURR_VER + 1))
ng build --env=pre --prod --base-href /dashboard/
cd dist
sed 's/base href="/base href="\./' index.html > index2.html
rm index.html
mv index2.html index.html
aws s3 sync . s3://tiledesk-dashboard-pre/dashboard/
cd ..
echo $NEW_VER > current_version.txt
echo new version deployed on s3://tiledesk-dashboard-pre/dashboard/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-dashboard-pre/dashboard/index.html
