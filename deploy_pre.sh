# CURR_VER=$(< current_version.txt)
# NEW_VER=$(($CURR_VER + 1))
# ng build --c=pre --prod --base-href /dashboard/
# cd dist
# sed 's/base href="/base href="\./' index.html > index2.html
# rm index.html
# mv index2.html index.html
# aws s3 sync . s3://tiledesk-dashboard-pre/dashboard/
# cd ..
# echo $NEW_VER > current_version.txt
# echo new version deployed on s3://tiledesk-dashboard-pre/dashboard/
# echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-dashboard-pre/dashboard/index.html


# ng build  --prod --c=pre --base-href ./ commento questo dopo errore FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --configuration production --c=pre --output-path=dist --base-href ./
cd dist

####### tiledesk
aws s3 sync --cache-control max-age=172800 . s3://tiledesk-dashboard-pre/dashboard/
# aws s3 sync ./index.html s3://tiledesk-dashboard-pre/dashboard/ --exclude='*' --include='/index.html'
aws s3 sync . s3://tiledesk-dashboard-pre/dashboard/
aws cloudfront create-invalidation --distribution-id E13L8CUUKUWAJF --paths "/*"
echo new version deployed on s3://tiledesk-dashboard-pre/dashboard/
echo available on https://support-pre.tiledesk.com/dashboard/index.html



####### tiledesk in version subfolder with cache control
# aws s3 sync --cache-control max-age=172800 . s3://tiledesk-dashboard-pre/stripe_6/dashboard/
# # aws s3 sync ./index.html s3://tiledesk-dashboard-pre/dashboard/ --exclude='*' --include='/index.html'
# # aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*"
# echo new version deployed on s3://tiledesk-dashboard-pre/stripe_6/dashboard/
# echo available on https://support-pre.tiledesk.com/stripe_6/dashboard/index.html


####### tiledesk in version subfolder 
# aws s3 sync . s3://tiledesk-dashboard-pre/2.2.43.2/dashboard/
# echo new version deployed on s3://tiledesk-dashboard-pre/2.2.43.2/dashboard/
# echo available on https://support-pre.tiledesk.com/2.2.43.2/dashboard/index.html

####### tiledesk MQTT in pre da aggiungere in deploy_pre.sh
# aws s3 sync . s3://tiledesk-dashboard-pre/native-mqtt/dashboard/
# aws s3 sync . s3://tiledesk-dashboard-pre/native-mqtt/dashboard/2.2.10-beta.1
# echo new version deployed on s3://tiledesk-dashboard-pre/native-mqtt/dashboard/
# echo available on http://tiledesk-dashboard-pre.s3-eu-west-1.amazonaws.com/native-mqtt/dashboard/2.2.10-beta.1/index.html
# echo available on http://tiledesk-dashboard-pre.s3-eu-west-1.amazonaws.com/native-mqtt/dashboard/index.html


####### demo1
# aws s3 sync . s3://pypestream-dashboard/dashboard/
# aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*"