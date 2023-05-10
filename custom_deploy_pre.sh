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
node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --c=pre --output-path=dist --base-href ./
cd dist

####### tiledesk
aws s3 sync --cache-control max-age=172800 . s3://tiledesk-dashboard-pre/dashboard/new-onboarding/2.4.25-no9/
aws s3 sync . s3://tiledesk-dashboard-pre/dashboard/new-onboarding/2.4.25-no9/
aws cloudfront create-invalidation --distribution-id E13L8CUUKUWAJF --paths "/*"
echo new version deployed on s3://tiledesk-dashboard-pre/dashboard/new-onboarding/2.4.25-no9/
echo available on https://support-pre.tiledesk.com/dashboard/new-onboarding/2.4.25-no9/index.html