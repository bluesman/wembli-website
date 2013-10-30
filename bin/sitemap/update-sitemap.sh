#!/bin/bash

cd /wembli/website/bin/sitemap/;
wget -mk --spider -r -l2 http://www.wembli.com/ -o /wembli/website/bin/sitemap/urlinfolist.txt;
cat /wembli/website/bin/sitemap/urlinfolist.txt | tr ' ' '\012' | grep "^http" | egrep -vi "[?]|[.](jpg|png|js|css)$" | sort -u > /wembli/website/bin/sitemap/urllist.txt;
rm /wembli/website/bin/sitemap/urlinfolist.txt;
python sitemap_gen.py --config=config.xml;
rm /wembli/website/bin/sitemap/urllist.txt