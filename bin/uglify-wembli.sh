@import url('/css/bootstrap-modal.css');

@import url('/css/plugins/pikaday.css');

@import url('/css/plugins/jquery.multiselect.css');

@import url('/css/plugins/jquery.multiselect.filter.css');

@import url('/css/plugins/jquery.slidepanel.css');
/* GET FONT-AWESOME:
  cd /wembli/Font-Awesome/
  git pull;
  cp /wembli/Font-Awesome/build/assets/font-awesome/less/* /wembli/website/public/less/font-awesome/

  GET TWITTER BOOTSTRAP:
  cd /wembli/bootstrap/
  git pull
  cp -R /wembli/bootstrap/less/* /wembli/website/less/bootstrap/
*/
/* @import url('/css/plugins/jquery-ui-1.8.16.custom.css'); */
/*!
 * Bootstrap v2.3.1
 *
 * Copyright 2012 Twitter, Inc
 * Licensed under the Apache License v2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Designed and built with all the love in the world @twitter by @mdo and @fat.
 */
.clearfix {
  *zoom: 1;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
  line-height: 0;
}
.clearfix:after {
  clear: both;
}
.hide-text {
  font: 0/0 a;
  color: transparent;
  text-shadow: none;
  background-color: transparent;
  border: 0;
}
.input-block-level {
  display: block;
  width: 100%;
  min-height: 28px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
nav,
section {
  display: block;
}
audio,
canvas,
video {
  display: inline-block;
  *display: inline;
  *zoom: 1;
}
audio:not([controls]) {
  display: none;
}
html {
  font-size: 100%;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}
a:focus {
  outline: thin dotted #333;
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}
a:hover,
a:active {
  outline: 0;
}
sub,
sup {
  position: relative;
  font-size: 75%;
  line-height: 0;
  vertical-align: baseline;
}
sup {
  top: -0.5em;
}
sub {
  bottom: -0.25em;
}
img {
  /* Responsive images (ensure images don't scale beyond their parents) */

  max-width: 100%;
  /* Part 1: Set a maxium relative to the parent */

  width: auto\9;
  /* IE7-8 need help adjusting responsive images */

  height: auto;
  /* Part 2: Scale the height according to the width, otherwise you get stretching */

  vertical-align: middle;
  border: 0;
  -ms-interpolation-mode: bicubic;
}
#map_canvas img,
.google-maps img {
  max-width: none;
}
button,
input,
select,
textarea {
  margin: 0;
  font-size: 100%;
  vertical-align: middle;
}
button,
input {
  *overflow: visible;
  line-height: normal;
}
button::-moz-focus-inner,
input::-moz-focus-inner {
  padding: 0;
  border: 0;
}
button,
html input[type="button"],
input[type="reset"],
input[type="submit"] {
  -webkit-appearance: button;
  cursor: pointer;
}
label,
select,
button,
input[type="button"],
input[type="reset"],
input[type="submit"],
input[type="radio"],
input[type="checkbox"] {
  cursor: pointer;
}
input[type="search"] {
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  -webkit-appearance: textfield;
}
input[type="search"]::-webkit-search-decoration,
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
textarea {
  overflow: auto;
  vertical-align: top;
}
@media print {
  * {
    text-shadow: none !important;
    color: #000 !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  a,
  a:visited {
    text-decoration: underline;
  }
  a[href]:after {
    content: " (" attr(href) ")";
  }
  abbr[title]:after {
    content: " (" attr(title) ")";
  }
  .ir a:after,
  a[href^="javascript:"]:after,
  a[href^="#"]:after {
    content: "";
  }
  pre,
  blockquote {
    border: 1px solid #999;
    page-break-inside: avoid;
  }
  thead {
    display: table-header-group;
  }
  tr,
  img {
    page-break-inside: avoid;
  }
  img {
    max-width: 100% !important;
  }
  @page  {
    margin: 0.5cm;
  }
  p,
  h2,
  h3 {
    orphans: 3;
    widows: 3;
  }
  h2,
  h3 {
    page-break-after: avoid;
  }
}
body {
  margin: 0;
  font-family: Calibri, Arial, "Helvetica Neue", Helvetica, sans-serif;
  font-size: 16px;
  line-height: 18px;
  color: #666666;
  background-color: #ffffff;
}
a {
  color: #4380b8;
  text-decoration: none;
}
a:hover,
a:focus {
  color: #426799;
  text-decoration: underline;
}
.img-rounded {
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
}
.img-polaroid {
  padding: 4px;
  background-color: #fff;
  border: 1px solid #ccc;
  border: 1px solid rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  -moz-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.img-circle {
  -webkit-border-radius: 500px;
  -moz-border-radius: 500px;
  border-radius: 500px;
}
.row {
  margin-left: -20px;
  *zoom: 1;
}
.row:before,
.row:after {
  display: table;
  content: "";
  line-height: 0;
}
.row:after {
  clear: both;
}
.row:before,
.row:after {
  display: table;
  content: "";
  line-height: 0;
}
.row:after {
  clear: both;
}
[class*="span"] {
  float: left;
  min-height: 1px;
  margin-left: 20px;
}
.container,
.navbar-static-top .container,
.navbar-fixed-top .container,
.navbar-fixed-bottom .container {
  width: 940px;
}
.span12 {
  width: 940px;
}
.span11 {
  width: 860px;
}
.span10 {
  width: 780px;
}
.span9 {
  width: 700px;
}
.span8 {
  width: 620px;
}
.span7 {
  width: 540px;
}
.span6 {
  width: 460px;
}
.span5 {
  width: 380px;
}
.span4 {
  width: 300px;
}
.span3 {
  width: 220px;
}
.span2 {
  width: 140px;
}
.span1 {
  width: 60px;
}
.offset12 {
  margin-left: 980px;
}
.offset11 {
  margin-left: 900px;
}
.offset10 {
  margin-left: 820px;
}
.offset9 {
  margin-left: 740px;
}
.offset8 {
  margin-left: 660px;
}
.offset7 {
  margin-left: 580px;
}
.offset6 {
  margin-left: 500px;
}
.offset5 {
  margin-left: 420px;
}
.offset4 {
  margin-left: 340px;
}
.offset3 {
  margin-left: 260px;
}
.offset2 {
  margin-left: 180px;
}
.offset1 {
  margin-left: 100px;
}
.row-fluid {
  width: 100%;
  *zoom: 1;
}
.row-fluid:before,
.row-fluid:after {
  display: table;
  content: "";
  line-height: 0;
}
.row-fluid:after {
  clear: both;
}
.row-fluid:before,
.row-fluid:after {
  display: table;
  content: "";
  line-height: 0;
}
.row-fluid:after {
  clear: both;
}
.row-fluid [class*="span"] {
  display: block;
  width: 100%;
  min-height: 28px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  float: left;
  margin-left: 2.127659574468085%;
  *margin-left: 2.074468085106383%;
}
.row-fluid [class*="span"]:first-child {
  margin-left: 0;
}
.row-fluid .controls-row [class*="span"] + [class*="span"] {
  margin-left: 2.127659574468085%;
}
.row-fluid .span12 {
  width: 100%;
  *width: 99.94680851063829%;
}
.row-fluid .span11 {
  width: 91.48936170212765%;
  *width: 91.43617021276594%;
}
.row-fluid .span10 {
  width: 82.97872340425532%;
  *width: 82.92553191489361%;
}
.row-fluid .span9 {
  width: 74.46808510638297%;
  *width: 74.41489361702126%;
}
.row-fluid .span8 {
  width: 65.95744680851064%;
  *width: 65.90425531914893%;
}
.row-fluid .span7 {
  width: 57.44680851063829%;
  *width: 57.39361702127659%;
}
.row-fluid .span6 {
  width: 48.93617021276595%;
  *width: 48.88297872340425%;
}
.row-fluid .span5 {
  width: 40.42553191489362%;
  *width: 40.37234042553192%;
}
.row-fluid .span4 {
  width: 31.914893617021278%;
  *width: 31.861702127659576%;
}
.row-fluid .span3 {
  width: 23.404255319148934%;
  *width: 23.351063829787233%;
}
.row-fluid .span2 {
  width: 14.893617021276595%;
  *width: 14.840425531914894%;
}
.row-fluid .span1 {
  width: 6.382978723404255%;
  *width: 6.329787234042553%;
}
.row-fluid .offset12 {
  margin-left: 104.25531914893617%;
  *margin-left: 104.14893617021275%;
}
.row-fluid .offset12:first-child {
  margin-left: 102.12765957446808%;
  *margin-left: 102.02127659574467%;
}
.row-fluid .offset11 {
  margin-left: 95.74468085106382%;
  *margin-left: 95.6382978723404%;
}
.row-fluid .offset11:first-child {
  margin-left: 93.61702127659574%;
  *margin-left: 93.51063829787232%;
}
.row-fluid .offset10 {
  margin-left: 87.23404255319149%;
  *margin-left: 87.12765957446807%;
}
.row-fluid .offset10:first-child {
  margin-left: 85.1063829787234%;
  *margin-left: 84.99999999999999%;
}
.row-fluid .offset9 {
  margin-left: 78.72340425531914%;
  *margin-left: 78.61702127659572%;
}
.row-fluid .offset9:first-child {
  margin-left: 76.59574468085106%;
  *margin-left: 76.48936170212764%;
}
.row-fluid .offset8 {
  margin-left: 70.2127659574468%;
  *margin-left: 70.10638297872339%;
}
.row-fluid .offset8:first-child {
  margin-left: 68.08510638297872%;
  *margin-left: 67.9787234042553%;
}
.row-fluid .offset7 {
  margin-left: 61.70212765957446%;
  *margin-left: 61.59574468085106%;
}
.row-fluid .offset7:first-child {
  margin-left: 59.574468085106375%;
  *margin-left: 59.46808510638297%;
}
.row-fluid .offset6 {
  margin-left: 53.191489361702125%;
  *margin-left: 53.085106382978715%;
}
.row-fluid .offset6:first-child {
  margin-left: 51.063829787234035%;
  *margin-left: 50.95744680851063%;
}
.row-fluid .offset5 {
  margin-left: 44.68085106382979%;
  *margin-left: 44.57446808510638%;
}
.row-fluid .offset5:first-child {
  margin-left: 42.5531914893617%;
  *margin-left: 42.4468085106383%;
}
.row-fluid .offset4 {
  margin-left: 36.170212765957444%;
  *margin-left: 36.06382978723405%;
}
.row-fluid .offset4:first-child {
  margin-left: 34.04255319148936%;
  *margin-left: 33.93617021276596%;
}
.row-fluid .offset3 {
  margin-left: 27.659574468085104%;
  *margin-left: 27.5531914893617%;
}
.row-fluid .offset3:first-child {
  margin-left: 25.53191489361702%;
  *margin-left: 25.425531914893618%;
}
.row-fluid .offset2 {
  margin-left: 19.148936170212764%;
  *margin-left: 19.04255319148936%;
}
.row-fluid .offset2:first-child {
  margin-left: 17.02127659574468%;
  *margin-left: 16.914893617021278%;
}
.row-fluid .offset1 {
  margin-left: 10.638297872340425%;
  *margin-left: 10.53191489361702%;
}
.row-fluid .offset1:first-child {
  margin-left: 8.51063829787234%;
  *margin-left: 8.404255319148938%;
}
[class*="span"].hide,
.row-fluid [class*="span"].hide {
  display: none;
}
[class*="span"].pull-right,
.row-fluid [class*="span"].pull-right {
  float: right;
}
.container {
  margin-right: auto;
  margin-left: auto;
  *zoom: 1;
}
.container:before,
.container:after {
  display: table;
  content: "";
  line-height: 0;
}
.container:after {
  clear: both;
}
.container:before,
.container:after {
  display: table;
  content: "";
  line-height: 0;
}
.container:after {
  clear: both;
}
.container-fluid {
  padding-right: 20px;
  padding-left: 20px;
  *zoom: 1;
}
.container-fluid:before,
.container-fluid:after {
  display: table;
  content: "";
  line-height: 0;
}
.container-fluid:after {
  clear: both;
}
.container-fluid:before,
.container-fluid:after {
  display: table;
  content: "";
  line-height: 0;
}
.container-fluid:after {
  clear: both;
}
p {
  margin: 0 0 9px;
}
.lead {
  margin-bottom: 18px;
  font-size: 24px;
  font-weight: 200;
  line-height: 27px;
}
small {
  font-size: 85%;
}
strong {
  font-weight: bold;
}
em {
  font-style: italic;
}
cite {
  font-style: normal;
}
.muted {
  color: #cccccc;
}
a.muted:hover,
a.muted:focus {
  color: #b3b3b3;
}
.text-warning {
  color: #c09853;
}
a.text-warning:hover,
a.text-warning:focus {
  color: #a47e3c;
}
.text-error {
  color: #b94a48;
}
a.text-error:hover,
a.text-error:focus {
  color: #953b39;
}
.text-info {
  color: #3a87ad;
}
a.text-info:hover,
a.text-info:focus {
  color: #2d6987;
}
.text-success {
  color: #468847;
}
a.text-success:hover,
a.text-success:focus {
  color: #356635;
}
.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 9px 0;
  font-family: inherit;
  font-weight: bold;
  line-height: 18px;
  color: inherit;
  text-rendering: optimizelegibility;
}
h1 small,
h2 small,
h3 small,
h4 small,
h5 small,
h6 small {
  font-weight: normal;
  line-height: 1;
  color: #cccccc;
}
h1,
h2,
h3 {
  line-height: 36px;
}
h1 {
  font-size: 44px;
}
h2 {
  font-size: 36px;
}
h3 {
  font-size: 28px;
}
h4 {
  font-size: 20px;
}
h5 {
  font-size: 16px;
}
h6 {
  font-size: 13.6px;
}
h1 small {
  font-size: 28px;
}
h2 small {
  font-size: 20px;
}
h3 small {
  font-size: 16px;
}
h4 small {
  font-size: 16px;
}
.page-header {
  padding-bottom: 8px;
  margin: 18px 0 27px;
  border-bottom: 1px solid #ffffff;
}
ul,
ol {
  padding: 0;
  margin: 0 0 9px 25px;
}
ul ul,
ul ol,
ol ol,
ol ul {
  margin-bottom: 0;
}
li {
  line-height: 18px;
}
ul.unstyled,
ol.unstyled {
  margin-left: 0;
  list-style: none;
}
ul.inline,
ol.inline {
  margin-left: 0;
  list-style: none;
}
ul.inline > li,
ol.inline > li {
  display: inline-block;
  *display: inline;
  /* IE7 inline-block hack */

  *zoom: 1;
  padding-left: 5px;
  padding-right: 5px;
}
dl {
  margin-bottom: 18px;
}
dt,
dd {
  line-height: 18px;
}
dt {
  font-weight: bold;
}
dd {
  margin-left: 9px;
}
.dl-horizontal {
  *zoom: 1;
}
.dl-horizontal:before,
.dl-horizontal:after {
  display: table;
  content: "";
  line-height: 0;
}
.dl-horizontal:after {
  clear: both;
}
.dl-horizontal:before,
.dl-horizontal:after {
  display: table;
  content: "";
  line-height: 0;
}
.dl-horizontal:after {
  clear: both;
}
.dl-horizontal dt {
  float: left;
  width: 160px;
  clear: left;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dl-horizontal dd {
  margin-left: 180px;
}
hr {
  margin: 18px 0;
  border: 0;
  border-top: 1px solid #ffffff;
  border-bottom: 1px solid #ffffff;
}
abbr[title],
abbr[data-original-title] {
  cursor: help;
  border-bottom: 1px dotted #cccccc;
}
abbr.initialism {
  font-size: 90%;
  text-transform: uppercase;
}
blockquote {
  padding: 0 0 0 15px;
  margin: 0 0 18px;
  border-left: 5px solid #ffffff;
}
blockquote p {
  margin-bottom: 0;
  font-size: 20px;
  font-weight: 300;
  line-height: 1.25;
}
blockquote small {
  display: block;
  line-height: 18px;
  color: #cccccc;
}
blockquote small:before {
  content: '\2014 \00A0';
}
blockquote.pull-right {
  float: right;
  padding-right: 15px;
  padding-left: 0;
  border-right: 5px solid #ffffff;
  border-left: 0;
}
blockquote.pull-right p,
blockquote.pull-right small {
  text-align: right;
}
blockquote.pull-right small:before {
  content: '';
}
blockquote.pull-right small:after {
  content: '\00A0 \2014';
}
q:before,
q:after,
blockquote:before,
blockquote:after {
  content: "";
}
address {
  display: block;
  margin-bottom: 18px;
  font-style: normal;
  line-height: 18px;
}
code,
pre {
  padding: 0 3px 2px;
  font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  font-size: 14px;
  color: #666666;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}
code {
  padding: 2px 4px;
  color: #d14;
  background-color: #f7f7f9;
  border: 1px solid #e1e1e8;
  white-space: nowrap;
}
pre {
  display: block;
  padding: 8.5px;
  margin: 0 0 9px;
  font-size: 15px;
  line-height: 18px;
  word-break: break-all;
  word-wrap: break-word;
  white-space: pre;
  white-space: pre-wrap;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border: 1px solid rgba(0, 0, 0, 0.15);
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
pre.prettyprint {
  margin-bottom: 18px;
}
pre code {
  padding: 0;
  color: inherit;
  white-space: pre;
  white-space: pre-wrap;
  background-color: transparent;
  border: 0;
}
.pre-scrollable {
  max-height: 340px;
  overflow-y: scroll;
}
form {
  margin: 0 0 18px;
}
fieldset {
  padding: 0;
  margin: 0;
  border: 0;
}
legend {
  display: block;
  width: 100%;
  padding: 0;
  margin-bottom: 18px;
  font-size: 24px;
  line-height: 36px;
  color: #666666;
  border: 0;
  border-bottom: 1px solid #e5e5e5;
}
legend small {
  font-size: 13.5px;
  color: #cccccc;
}
label,
input,
button,
select,
textarea {
  font-size: 16px;
  font-weight: normal;
  line-height: 18px;
}
input,
button,
select,
textarea {
  font-family: Calibri, Arial, "Helvetica Neue", Helvetica, sans-serif;
}
label {
  display: block;
  margin-bottom: 5px;
}
select,
textarea,
input[type="text"],
input[type="password"],
input[type="datetime"],
input[type="datetime-local"],
input[type="date"],
input[type="month"],
input[type="time"],
input[type="week"],
input[type="number"],
input[type="email"],
input[type="url"],
input[type="search"],
input[type="tel"],
input[type="color"],
.uneditable-input {
  display: inline-block;
  height: 18px;
  padding: 4px 6px;
  margin-bottom: 9px;
  font-size: 16px;
  line-height: 18px;
  color: #999999;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  vertical-align: middle;
}
input,
textarea,
.uneditable-input {
  width: 206px;
}
textarea {
  height: auto;
}
textarea,
input[type="text"],
input[type="password"],
input[type="datetime"],
input[type="datetime-local"],
input[type="date"],
input[type="month"],
input[type="time"],
input[type="week"],
input[type="number"],
input[type="email"],
input[type="url"],
input[type="search"],
input[type="tel"],
input[type="color"],
.uneditable-input {
  background-color: #ffffff;
  border: 1px solid #cccccc;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -webkit-transition: border linear .2s, box-shadow linear .2s;
  -moz-transition: border linear .2s, box-shadow linear .2s;
  -o-transition: border linear .2s, box-shadow linear .2s;
  transition: border linear .2s, box-shadow linear .2s;
}
textarea:focus,
input[type="text"]:focus,
input[type="password"]:focus,
input[type="datetime"]:focus,
input[type="datetime-local"]:focus,
input[type="date"]:focus,
input[type="month"]:focus,
input[type="time"]:focus,
input[type="week"]:focus,
input[type="number"]:focus,
input[type="email"]:focus,
input[type="url"]:focus,
input[type="search"]:focus,
input[type="tel"]:focus,
input[type="color"]:focus,
.uneditable-input:focus {
  border-color: rgba(82, 168, 236, 0.8);
  outline: 0;
  outline: thin dotted \9;
  /* IE6-9 */

  -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(82,168,236,.6);
  -moz-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(82,168,236,.6);
  box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(82,168,236,.6);
}
input[type="radio"],
input[type="checkbox"] {
  margin: 4px 0 0;
  *margin-top: 0;
  /* IE7 */

  margin-top: 1px \9;
  /* IE8-9 */

  line-height: normal;
}
input[type="file"],
input[type="image"],
input[type="submit"],
input[type="reset"],
input[type="button"],
input[type="radio"],
input[type="checkbox"] {
  width: auto;
}
select,
input[type="file"] {
  height: 28px;
  /* In IE7, the height of the select element cannot be changed by height, only font-size */

  *margin-top: 4px;
  /* For IE7, add top margin to align select with labels */

  line-height: 28px;
}
select {
  width: 220px;
  border: 1px solid #cccccc;
  background-color: #ffffff;
}
select[multiple],
select[size] {
  height: auto;
}
select:focus,
input[type="file"]:focus,
input[type="radio"]:focus,
input[type="checkbox"]:focus {
  outline: thin dotted #333;
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}
.uneditable-input,
.uneditable-textarea {
  color: #cccccc;
  background-color: #fcfcfc;
  border-color: #cccccc;
  -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.025);
  -moz-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.025);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.025);
  cursor: not-allowed;
}
.uneditable-input {
  overflow: hidden;
  white-space: nowrap;
}
.uneditable-textarea {
  width: auto;
  height: auto;
}
input:-moz-placeholder,
textarea:-moz-placeholder {
  color: #cccccc;
}
input:-ms-input-placeholder,
textarea:-ms-input-placeholder {
  color: #cccccc;
}
input::-webkit-input-placeholder,
textarea::-webkit-input-placeholder {
  color: #cccccc;
}
.radio,
.checkbox {
  min-height: 18px;
  padding-left: 20px;
}
.radio input[type="radio"],
.checkbox input[type="checkbox"] {
  float: left;
  margin-left: -20px;
}
.controls > .radio:first-child,
.controls > .checkbox:first-child {
  padding-top: 5px;
}
.radio.inline,
.checkbox.inline {
  display: inline-block;
  padding-top: 5px;
  margin-bottom: 0;
  vertical-align: middle;
}
.radio.inline + .radio.inline,
.checkbox.inline + .checkbox.inline {
  margin-left: 10px;
}
.input-mini {
  width: 60px;
}
.input-small {
  width: 90px;
}
.input-medium {
  width: 150px;
}
.input-large {
  width: 210px;
}
.input-xlarge {
  width: 270px;
}
.input-xxlarge {
  width: 530px;
}
input[class*="span"],
select[class*="span"],
textarea[class*="span"],
.uneditable-input[class*="span"],
.row-fluid input[class*="span"],
.row-fluid select[class*="span"],
.row-fluid textarea[class*="span"],
.row-fluid .uneditable-input[class*="span"] {
  float: none;
  margin-left: 0;
}
.input-append input[class*="span"],
.input-append .uneditable-input[class*="span"],
.input-prepend input[class*="span"],
.input-prepend .uneditable-input[class*="span"],
.row-fluid input[class*="span"],
.row-fluid select[class*="span"],
.row-fluid textarea[class*="span"],
.row-fluid .uneditable-input[class*="span"],
.row-fluid .input-prepend [class*="span"],
.row-fluid .input-append [class*="span"] {
  display: inline-block;
}
input,
textarea,
.uneditable-input {
  margin-left: 0;
}
.controls-row [class*="span"] + [class*="span"] {
  margin-left: 20px;
}
input.span12,
textarea.span12,
.uneditable-input.span12 {
  width: 926px;
}
input.span11,
textarea.span11,
.uneditable-input.span11 {
  width: 846px;
}
input.span10,
textarea.span10,
.uneditable-input.span10 {
  width: 766px;
}
input.span9,
textarea.span9,
.uneditable-input.span9 {
  width: 686px;
}
input.span8,
textarea.span8,
.uneditable-input.span8 {
  width: 606px;
}
input.span7,
textarea.span7,
.uneditable-input.span7 {
  width: 526px;
}
input.span6,
textarea.span6,
.uneditable-input.span6 {
  width: 446px;
}
input.span5,
textarea.span5,
.uneditable-input.span5 {
  width: 366px;
}
input.span4,
textarea.span4,
.uneditable-input.span4 {
  width: 286px;
}
input.span3,
textarea.span3,
.uneditable-input.span3 {
  width: 206px;
}
input.span2,
textarea.span2,
.uneditable-input.span2 {
  width: 126px;
}
input.span1,
textarea.span1,
.uneditable-input.span1 {
  width: 46px;
}
.controls-row {
  *zoom: 1;
}
.controls-row:before,
.controls-row:after {
  display: table;
  content: "";
  line-height: 0;
}
.controls-row:after {
  clear: both;
}
.controls-row:before,
.controls-row:after {
  display: table;
  content: "";
  line-height: 0;
}
.controls-row:after {
  clear: both;
}
.controls-row [class*="span"],
.row-fluid .controls-row [class*="span"] {
  float: left;
}
.controls-row .checkbox[class*="span"],
.controls-row .radio[class*="span"] {
  padding-top: 5px;
}
input[disabled],
select[disabled],
textarea[disabled],
input[readonly],
select[readonly],
textarea[readonly] {
  cursor: not-allowed;
  background-color: #ffffff;
}
input[type="radio"][disabled],
input[type="checkbox"][disabled],
input[type="radio"][readonly],
input[type="checkbox"][readonly] {
  background-color: transparent;
}
.control-group.warning .control-label,
.control-group.warning .help-block,
.control-group.warning .help-inline {
  color: #c09853;
}
.control-group.warning .checkbox,
.control-group.warning .radio,
.control-group.warning input,
.control-group.warning select,
.control-group.warning textarea {
  color: #c09853;
}
.control-group.warning input,
.control-group.warning select,
.control-group.warning textarea {
  border-color: #c09853;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}
.control-group.warning input:focus,
.control-group.warning select:focus,
.control-group.warning textarea:focus {
  border-color: #a47e3c;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #dbc59e;
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #dbc59e;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #dbc59e;
}
.control-group.warning .input-prepend .add-on,
.control-group.warning .input-append .add-on {
  color: #c09853;
  background-color: #fcf8e3;
  border-color: #c09853;
}
.control-group.warning > label,
.control-group.warning .help-block,
.control-group.warning .help-inline {
  color: #c09853;
}
.control-group.warning .checkbox,
.control-group.warning .radio,
.control-group.warning input,
.control-group.warning select,
.control-group.warning textarea {
  color: #c09853;
  border-color: #c09853;
}
.control-group.warning .checkbox:focus,
.control-group.warning .radio:focus,
.control-group.warning input:focus,
.control-group.warning select:focus,
.control-group.warning textarea:focus {
  color: #342813;
  border-color: #cc5200;
  -webkit-box-shadow: 0 0 6px #ffa466;
  -moz-box-shadow: 0 0 6px #ffa466;
  box-shadow: 0 0 6px #ffa466;
}
.control-group.warning .input-prepend .add-on,
.control-group.warning .input-append .add-on {
  color: #c09853;
  background-color: #fcf8e3;
  border-color: #c09853;
}
.control-group.error .control-label,
.control-group.error .help-block,
.control-group.error .help-inline {
  color: #b94a48;
}
.control-group.error .checkbox,
.control-group.error .radio,
.control-group.error input,
.control-group.error select,
.control-group.error textarea {
  color: #b94a48;
}
.control-group.error input,
.control-group.error select,
.control-group.error textarea {
  border-color: #b94a48;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}
.control-group.error input:focus,
.control-group.error select:focus,
.control-group.error textarea:focus {
  border-color: #953b39;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #d59392;
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #d59392;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #d59392;
}
.control-group.error .input-prepend .add-on,
.control-group.error .input-append .add-on {
  color: #b94a48;
  background-color: #f2dede;
  border-color: #b94a48;
}
.control-group.error > label,
.control-group.error .help-block,
.control-group.error .help-inline {
  color: #b94a48;
}
.control-group.error .checkbox,
.control-group.error .radio,
.control-group.error input,
.control-group.error select,
.control-group.error textarea {
  color: #b94a48;
  border-color: #b94a48;
}
.control-group.error .checkbox:focus,
.control-group.error .radio:focus,
.control-group.error input:focus,
.control-group.error select:focus,
.control-group.error textarea:focus {
  color: #260f0f;
  border-color: #cc5200;
  -webkit-box-shadow: 0 0 6px #ffa466;
  -moz-box-shadow: 0 0 6px #ffa466;
  box-shadow: 0 0 6px #ffa466;
}
.control-group.error .input-prepend .add-on,
.control-group.error .input-append .add-on {
  color: #b94a48;
  background-color: #f2dede;
  border-color: #b94a48;
}
.control-group.success .control-label,
.control-group.success .help-block,
.control-group.success .help-inline {
  color: #468847;
}
.control-group.success .checkbox,
.control-group.success .radio,
.control-group.success input,
.control-group.success select,
.control-group.success textarea {
  color: #468847;
}
.control-group.success input,
.control-group.success select,
.control-group.success textarea {
  border-color: #468847;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}
.control-group.success input:focus,
.control-group.success select:focus,
.control-group.success textarea:focus {
  border-color: #356635;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #7aba7b;
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #7aba7b;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #7aba7b;
}
.control-group.success .input-prepend .add-on,
.control-group.success .input-append .add-on {
  color: #468847;
  background-color: #dff0d8;
  border-color: #468847;
}
.control-group.success > label,
.control-group.success .help-block,
.control-group.success .help-inline {
  color: #468847;
}
.control-group.success .checkbox,
.control-group.success .radio,
.control-group.success input,
.control-group.success select,
.control-group.success textarea {
  color: #468847;
  border-color: #468847;
}
.control-group.success .checkbox:focus,
.control-group.success .radio:focus,
.control-group.success input:focus,
.control-group.success select:focus,
.control-group.success textarea:focus {
  color: #010101;
  border-color: #cc5200;
  -webkit-box-shadow: 0 0 6px #ffa466;
  -moz-box-shadow: 0 0 6px #ffa466;
  box-shadow: 0 0 6px #ffa466;
}
.control-group.success .input-prepend .add-on,
.control-group.success .input-append .add-on {
  color: #468847;
  background-color: #dff0d8;
  border-color: #468847;
}
.control-group.info .control-label,
.control-group.info .help-block,
.control-group.info .help-inline {
  color: #3a87ad;
}
.control-group.info .checkbox,
.control-group.info .radio,
.control-group.info input,
.control-group.info select,
.control-group.info textarea {
  color: #3a87ad;
}
.control-group.info input,
.control-group.info select,
.control-group.info textarea {
  border-color: #3a87ad;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}
.control-group.info input:focus,
.control-group.info select:focus,
.control-group.info textarea:focus {
  border-color: #2d6987;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #7ab5d3;
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #7ab5d3;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #7ab5d3;
}
.control-group.info .input-prepend .add-on,
.control-group.info .input-append .add-on {
  color: #3a87ad;
  background-color: #d9edf7;
  border-color: #3a87ad;
}
.control-group.info > label,
.control-group.info .help-block,
.control-group.info .help-inline {
  color: #3a87ad;
}
.control-group.info .checkbox,
.control-group.info .radio,
.control-group.info input,
.control-group.info select,
.control-group.info textarea {
  color: #3a87ad;
  border-color: #3a87ad;
}
.control-group.info .checkbox:focus,
.control-group.info .radio:focus,
.control-group.info input:focus,
.control-group.info select:focus,
.control-group.info textarea:focus {
  color: #071014;
  border-color: #cc5200;
  -webkit-box-shadow: 0 0 6px #ffa466;
  -moz-box-shadow: 0 0 6px #ffa466;
  box-shadow: 0 0 6px #ffa466;
}
.control-group.info .input-prepend .add-on,
.control-group.info .input-append .add-on {
  color: #3a87ad;
  background-color: #d9edf7;
  border-color: #3a87ad;
}
input:focus:invalid,
textarea:focus:invalid,
select:focus:invalid {
  color: #b94a48;
  border-color: #ee5f5b;
}
input:focus:invalid:focus,
textarea:focus:invalid:focus,
select:focus:invalid:focus {
  border-color: #e9322d;
  -webkit-box-shadow: 0 0 6px #f8b9b7;
  -moz-box-shadow: 0 0 6px #f8b9b7;
  box-shadow: 0 0 6px #f8b9b7;
}
.form-actions {
  padding: 17px 20px 18px;
  margin-top: 18px;
  margin-bottom: 18px;
  background-color: #f5f5f5;
  border-top: 1px solid #e5e5e5;
  *zoom: 1;
}
.form-actions:before,
.form-actions:after {
  display: table;
  content: "";
  line-height: 0;
}
.form-actions:after {
  clear: both;
}
.form-actions:before,
.form-actions:after {
  display: table;
  content: "";
  line-height: 0;
}
.form-actions:after {
  clear: both;
}
.help-block,
.help-inline {
  color: #8c8c8c;
}
.help-block {
  display: block;
  margin-bottom: 9px;
}
.help-inline {
  display: inline-block;
  *display: inline;
  /* IE7 inline-block hack */

  *zoom: 1;
  vertical-align: middle;
  padding-left: 5px;
}
.input-append,
.input-prepend {
  display: inline-block;
  margin-bottom: 9px;
  vertical-align: middle;
  font-size: 0;
  white-space: nowrap;
}
.input-append input,
.input-prepend input,
.input-append select,
.input-prepend select,
.input-append .uneditable-input,
.input-prepend .uneditable-input,
.input-append .dropdown-menu,
.input-prepend .dropdown-menu,
.input-append .popover,
.input-prepend .popover {
  font-size: 16px;
}
.input-append input,
.input-prepend input,
.input-append select,
.input-prepend select,
.input-append .uneditable-input,
.input-prepend .uneditable-input {
  position: relative;
  margin-bottom: 0;
  *margin-left: 0;
  vertical-align: top;
  -webkit-border-radius: 0 4px 4px 0;
  -moz-border-radius: 0 4px 4px 0;
  border-radius: 0 4px 4px 0;
}
.input-append input:focus,
.input-prepend input:focus,
.input-append select:focus,
.input-prepend select:focus,
.input-append .uneditable-input:focus,
.input-prepend .uneditable-input:focus {
  z-index: 2;
}
.input-append .add-on,
.input-prepend .add-on {
  display: inline-block;
  width: auto;
  height: 18px;
  min-width: 16px;
  padding: 4px 5px;
  font-size: 16px;
  font-weight: normal;
  line-height: 18px;
  text-align: center;
  text-shadow: 0 1px 0 #ffffff;
  background-color: #ffffff;
  border: 1px solid #ccc;
}
.input-append .add-on,
.input-prepend .add-on,
.input-append .btn,
.input-prepend .btn,
.input-append .btn-group > .dropdown-toggle,
.input-prepend .btn-group > .dropdown-toggle {
  vertical-align: top;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.input-append .active,
.input-prepend .active {
  background-color: #a9dba9;
  border-color: #46a546;
}
.input-prepend .add-on,
.input-prepend .btn {
  margin-right: -1px;
}
.input-prepend .add-on:first-child,
.input-prepend .btn:first-child {
  -webkit-border-radius: 4px 0 0 4px;
  -moz-border-radius: 4px 0 0 4px;
  border-radius: 4px 0 0 4px;
}
.input-append input,
.input-append select,
.input-append .uneditable-input {
  -webkit-border-radius: 4px 0 0 4px;
  -moz-border-radius: 4px 0 0 4px;
  border-radius: 4px 0 0 4px;
}
.input-append input + .btn-group .btn:last-child,
.input-append select + .btn-group .btn:last-child,
.input-append .uneditable-input + .btn-group .btn:last-child {
  -webkit-border-radius: 0 4px 4px 0;
  -moz-border-radius: 0 4px 4px 0;
  border-radius: 0 4px 4px 0;
}
.input-append .add-on,
.input-append .btn,
.input-append .btn-group {
  margin-left: -1px;
}
.input-append .add-on:last-child,
.input-append .btn:last-child,
.input-append .btn-group:last-child > .dropdown-toggle {
  -webkit-border-radius: 0 4px 4px 0;
  -moz-border-radius: 0 4px 4px 0;
  border-radius: 0 4px 4px 0;
}
.input-prepend.input-append input,
.input-prepend.input-append select,
.input-prepend.input-append .uneditable-input {
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.input-prepend.input-append input + .btn-group .btn,
.input-prepend.input-append select + .btn-group .btn,
.input-prepend.input-append .uneditable-input + .btn-group .btn {
  -webkit-border-radius: 0 4px 4px 0;
  -moz-border-radius: 0 4px 4px 0;
  border-radius: 0 4px 4px 0;
}
.input-prepend.input-append .add-on:first-child,
.input-prepend.input-append .btn:first-child {
  margin-right: -1px;
  -webkit-border-radius: 4px 0 0 4px;
  -moz-border-radius: 4px 0 0 4px;
  border-radius: 4px 0 0 4px;
}
.input-prepend.input-append .add-on:last-child,
.input-prepend.input-append .btn:last-child {
  margin-left: -1px;
  -webkit-border-radius: 0 4px 4px 0;
  -moz-border-radius: 0 4px 4px 0;
  border-radius: 0 4px 4px 0;
}
.input-prepend.input-append .btn-group:first-child {
  margin-left: 0;
}
input.search-query {
  padding-right: 14px;
  padding-right: 4px \9;
  padding-left: 14px;
  padding-left: 4px \9;
  /* IE7-8 doesn't have border-radius, so don't indent the padding */

  margin-bottom: 0;
  -webkit-border-radius: 15px;
  -moz-border-radius: 15px;
  border-radius: 15px;
}
/* Allow for input prepend/append in search forms */
.form-search .input-append .search-query,
.form-search .input-prepend .search-query {
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.form-search .input-append .search-query {
  -webkit-border-radius: 14px 0 0 14px;
  -moz-border-radius: 14px 0 0 14px;
  border-radius: 14px 0 0 14px;
}
.form-search .input-append .btn {
  -webkit-border-radius: 0 14px 14px 0;
  -moz-border-radius: 0 14px 14px 0;
  border-radius: 0 14px 14px 0;
}
.form-search .input-prepend .search-query {
  -webkit-border-radius: 0 14px 14px 0;
  -moz-border-radius: 0 14px 14px 0;
  border-radius: 0 14px 14px 0;
}
.form-search .input-prepend .btn {
  -webkit-border-radius: 14px 0 0 14px;
  -moz-border-radius: 14px 0 0 14px;
  border-radius: 14px 0 0 14px;
}
.form-search input,
.form-inline input,
.form-horizontal input,
.form-search textarea,
.form-inline textarea,
.form-horizontal textarea,
.form-search select,
.form-inline select,
.form-horizontal select,
.form-search .help-inline,
.form-inline .help-inline,
.form-horizontal .help-inline,
.form-search .uneditable-input,
.form-inline .uneditable-input,
.form-horizontal .uneditable-input,
.form-search .input-prepend,
.form-inline .input-prepend,
.form-horizontal .input-prepend,
.form-search .input-append,
.form-inline .input-append,
.form-horizontal .input-append {
  display: inline-block;
  *display: inline;
  /* IE7 inline-block hack */

  *zoom: 1;
  margin-bottom: 0;
  vertical-align: middle;
}
.form-search .hide,
.form-inline .hide,
.form-horizontal .hide {
  display: none;
}
.form-search label,
.form-inline label,
.form-search .btn-group,
.form-inline .btn-group {
  display: inline-block;
}
.form-search .input-append,
.form-inline .input-append,
.form-search .input-prepend,
.form-inline .input-prepend {
  margin-bottom: 0;
}
.form-search .radio,
.form-search .checkbox,
.form-inline .radio,
.form-inline .checkbox {
  padding-left: 0;
  margin-bottom: 0;
  vertical-align: middle;
}
.form-search .radio input[type="radio"],
.form-search .checkbox input[type="checkbox"],
.form-inline .radio input[type="radio"],
.form-inline .checkbox input[type="checkbox"] {
  float: left;
  margin-right: 3px;
  margin-left: 0;
}
.control-group {
  margin-bottom: 9px;
}
legend + .control-group {
  margin-top: 18px;
  -webkit-margin-top-collapse: separate;
}
.form-horizontal .control-group {
  margin-bottom: 18px;
  *zoom: 1;
}
.form-horizontal .control-group:before,
.form-horizontal .control-group:after {
  display: table;
  content: "";
  line-height: 0;
}
.form-horizontal .control-group:after {
  clear: both;
}
.form-horizontal .control-group:before,
.form-horizontal .control-group:after {
  display: table;
  content: "";
  line-height: 0;
}
.form-horizontal .control-group:after {
  clear: both;
}
.form-horizontal .control-label {
  float: left;
  width: 160px;
  padding-top: 5px;
  text-align: right;
}
.form-horizontal .controls {
  *display: inline-block;
  *padding-left: 20px;
  margin-left: 180px;
  *margin-left: 0;
}
.form-horizontal .controls:first-child {
  *padding-left: 180px;
}
.form-horizontal .help-block {
  margin-bottom: 0;
}
.form-horizontal input + .help-block,
.form-horizontal select + .help-block,
.form-horizontal textarea + .help-block,
.form-horizontal .uneditable-input + .help-block,
.form-horizontal .input-prepend + .help-block,
.form-horizontal .input-append + .help-block {
  margin-top: 9px;
}
.form-horizontal .form-actions {
  padding-left: 180px;
}
table {
  max-width: 100%;
  background-color: transparent;
  border-collapse: collapse;
  border-spacing: 0;
}
.table {
  width: 100%;
  margin-bottom: 18px;
}
.table th,
.table td {
  padding: 8px;
  line-height: 18px;
  text-align: left;
  vertical-align: top;
  border-top: 1px solid #dddddd;
}
.table th {
  font-weight: bold;
}
.table thead th {
  vertical-align: bottom;
}
.table caption + thead tr:first-child th,
.table caption + thead tr:first-child td,
.table colgroup + thead tr:first-child th,
.table colgroup + thead tr:first-child td,
.table thead:first-child tr:first-child th,
.table thead:first-child tr:first-child td {
  border-top: 0;
}
.table tbody + tbody {
  border-top: 2px solid #dddddd;
}
.table .table {
  background-color: #ffffff;
}
.table-condensed th,
.table-condensed td {
  padding: 4px 5px;
}
.table-bordered {
  border: 1px solid #dddddd;
  border-collapse: separate;
  *border-collapse: collapse;
  border-left: 0;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
.table-bordered th,
.table-bordered td {
  border-left: 1px solid #dddddd;
}
.table-bordered caption + thead tr:first-child th,
.table-bordered caption + tbody tr:first-child th,
.table-bordered caption + tbody tr:first-child td,
.table-bordered colgroup + thead tr:first-child th,
.table-bordered colgroup + tbody tr:first-child th,
.table-bordered colgroup + tbody tr:first-child td,
.table-bordered thead:first-child tr:first-child th,
.table-bordered tbody:first-child tr:first-child th,
.table-bordered tbody:first-child tr:first-child td {
  border-top: 0;
}
.table-bordered thead:first-child tr:first-child > th:first-child,
.table-bordered tbody:first-child tr:first-child > td:first-child,
.table-bordered tbody:first-child tr:first-child > th:first-child {
  -webkit-border-top-left-radius: 4px;
  -moz-border-radius-topleft: 4px;
  border-top-left-radius: 4px;
}
.table-bordered thead:first-child tr:first-child > th:last-child,
.table-bordered tbody:first-child tr:first-child > td:last-child,
.table-bordered tbody:first-child tr:first-child > th:last-child {
  -webkit-border-top-right-radius: 4px;
  -moz-border-radius-topright: 4px;
  border-top-right-radius: 4px;
}
.table-bordered thead:last-child tr:last-child > th:first-child,
.table-bordered tbody:last-child tr:last-child > td:first-child,
.table-bordered tbody:last-child tr:last-child > th:first-child,
.table-bordered tfoot:last-child tr:last-child > td:first-child,
.table-bordered tfoot:last-child tr:last-child > th:first-child {
  -webkit-border-bottom-left-radius: 4px;
  -moz-border-radius-bottomleft: 4px;
  border-bottom-left-radius: 4px;
}
.table-bordered thead:last-child tr:last-child > th:last-child,
.table-bordered tbody:last-child tr:last-child > td:last-child,
.table-bordered tbody:last-child tr:last-child > th:last-child,
.table-bordered tfoot:last-child tr:last-child > td:last-child,
.table-bordered tfoot:last-child tr:last-child > th:last-child {
  -webkit-border-bottom-right-radius: 4px;
  -moz-border-radius-bottomright: 4px;
  border-bottom-right-radius: 4px;
}
.table-bordered tfoot + tbody:last-child tr:last-child td:first-child {
  -webkit-border-bottom-left-radius: 0;
  -moz-border-radius-bottomleft: 0;
  border-bottom-left-radius: 0;
}
.table-bordered tfoot + tbody:last-child tr:last-child td:last-child {
  -webkit-border-bottom-right-radius: 0;
  -moz-border-radius-bottomright: 0;
  border-bottom-right-radius: 0;
}
.table-bordered caption + thead tr:first-child th:first-child,
.table-bordered caption + tbody tr:first-child td:first-child,
.table-bordered colgroup + thead tr:first-child th:first-child,
.table-bordered colgroup + tbody tr:first-child td:first-child {
  -webkit-border-top-left-radius: 4px;
  -moz-border-radius-topleft: 4px;
  border-top-left-radius: 4px;
}
.table-bordered caption + thead tr:first-child th:last-child,
.table-bordered caption + tbody tr:first-child td:last-child,
.table-bordered colgroup + thead tr:first-child th:last-child,
.table-bordered colgroup + tbody tr:first-child td:last-child {
  -webkit-border-top-right-radius: 4px;
  -moz-border-radius-topright: 4px;
  border-top-right-radius: 4px;
}
.table-striped tbody > tr:nth-child(odd) > td,
.table-striped tbody > tr:nth-child(odd) > th {
  background-color: #f9f9f9;
}
.table-hover tbody tr:hover > td,
.table-hover tbody tr:hover > th {
  background-color: #f5f5f5;
}
table td[class*="span"],
table th[class*="span"],
.row-fluid table td[class*="span"],
.row-fluid table th[class*="span"] {
  display: table-cell;
  float: none;
  margin-left: 0;
}
.table td.span1,
.table th.span1 {
  float: none;
  width: 44px;
  margin-left: 0;
}
.table td.span2,
.table th.span2 {
  float: none;
  width: 124px;
  margin-left: 0;
}
.table td.span3,
.table th.span3 {
  float: none;
  width: 204px;
  margin-left: 0;
}
.table td.span4,
.table th.span4 {
  float: none;
  width: 284px;
  margin-left: 0;
}
.table td.span5,
.table th.span5 {
  float: none;
  width: 364px;
  margin-left: 0;
}
.table td.span6,
.table th.span6 {
  float: none;
  width: 444px;
  margin-left: 0;
}
.table td.span7,
.table th.span7 {
  float: none;
  width: 524px;
  margin-left: 0;
}
.table td.span8,
.table th.span8 {
  float: none;
  width: 604px;
  margin-left: 0;
}
.table td.span9,
.table th.span9 {
  float: none;
  width: 684px;
  margin-left: 0;
}
.table td.span10,
.table th.span10 {
  float: none;
  width: 764px;
  margin-left: 0;
}
.table td.span11,
.table th.span11 {
  float: none;
  width: 844px;
  margin-left: 0;
}
.table td.span12,
.table th.span12 {
  float: none;
  width: 924px;
  margin-left: 0;
}
.table tbody tr.success > td {
  background-color: #dff0d8;
}
.table tbody tr.error > td {
  background-color: #f2dede;
}
.table tbody tr.warning > td {
  background-color: #fcf8e3;
}
.table tbody tr.info > td {
  background-color: #d9edf7;
}
.table-hover tbody tr.success:hover > td {
  background-color: #d0e9c6;
}
.table-hover tbody tr.error:hover > td {
  background-color: #ebcccc;
}
.table-hover tbody tr.warning:hover > td {
  background-color: #faf2cc;
}
.table-hover tbody tr.info:hover > td {
  background-color: #c4e3f3;
}
[class^="icon-"],
[class*=" icon-"] {
  display: inline-block;
  width: 14px;
  height: 14px;
  *margin-right: .3em;
  line-height: 14px;
  vertical-align: text-top;
  background-image: url("../img/glyphicons-halflings.png");
  background-position: 14px 14px;
  background-repeat: no-repeat;
  margin-top: 1px;
}
/* White icons with optional class, or on hover/focus/active states of certain elements */
.icon-white,
.nav-pills > .active > a > [class^="icon-"],
.nav-pills > .active > a > [class*=" icon-"],
.nav-list > .active > a > [class^="icon-"],
.nav-list > .active > a > [class*=" icon-"],
.navbar-inverse .nav > .active > a > [class^="icon-"],
.navbar-inverse .nav > .active > a > [class*=" icon-"],
.dropdown-menu > li > a:hover > [class^="icon-"],
.dropdown-menu > li > a:focus > [class^="icon-"],
.dropdown-menu > li > a:hover > [class*=" icon-"],
.dropdown-menu > li > a:focus > [class*=" icon-"],
.dropdown-menu > .active > a > [class^="icon-"],
.dropdown-menu > .active > a > [class*=" icon-"],
.dropdown-submenu:hover > a > [class^="icon-"],
.dropdown-submenu:focus > a > [class^="icon-"],
.dropdown-submenu:hover > a > [class*=" icon-"],
.dropdown-submenu:focus > a > [class*=" icon-"] {
  background-image: url("../img/glyphicons-halflings-white.png");
}
.icon-glass {
  background-position: 0      0;
}
.icon-music {
  background-position: -24px 0;
}
.icon-search {
  background-position: -48px 0;
}
.icon-envelope {
  background-position: -72px 0;
}
.icon-heart {
  background-position: -96px 0;
}
.icon-star {
  background-position: -120px 0;
}
.icon-star-empty {
  background-position: -144px 0;
}
.icon-user {
  background-position: -168px 0;
}
.icon-film {
  background-position: -192px 0;
}
.icon-th-large {
  background-position: -216px 0;
}
.icon-th {
  background-position: -240px 0;
}
.icon-th-list {
  background-position: -264px 0;
}
.icon-ok {
  background-position: -288px 0;
}
.icon-remove {
  background-position: -312px 0;
}
.icon-zoom-in {
  background-position: -336px 0;
}
.icon-zoom-out {
  background-position: -360px 0;
}
.icon-off {
  background-position: -384px 0;
}
.icon-signal {
  background-position: -408px 0;
}
.icon-cog {
  background-position: -432px 0;
}
.icon-trash {
  background-position: -456px 0;
}
.icon-home {
  background-position: 0 -24px;
}
.icon-file {
  background-position: -24px -24px;
}
.icon-time {
  background-position: -48px -24px;
}
.icon-road {
  background-position: -72px -24px;
}
.icon-download-alt {
  background-position: -96px -24px;
}
.icon-download {
  background-position: -120px -24px;
}
.icon-upload {
  background-position: -144px -24px;
}
.icon-inbox {
  background-position: -168px -24px;
}
.icon-play-circle {
  background-position: -192px -24px;
}
.icon-repeat {
  background-position: -216px -24px;
}
.icon-refresh {
  background-position: -240px -24px;
}
.icon-list-alt {
  background-position: -264px -24px;
}
.icon-lock {
  background-position: -287px -24px;
}
.icon-flag {
  background-position: -312px -24px;
}
.icon-headphones {
  background-position: -336px -24px;
}
.icon-volume-off {
  background-position: -360px -24px;
}
.icon-volume-down {
  background-position: -384px -24px;
}
.icon-volume-up {
  background-position: -408px -24px;
}
.icon-qrcode {
  background-position: -432px -24px;
}
.icon-barcode {
  background-position: -456px -24px;
}
.icon-tag {
  background-position: 0 -48px;
}
.icon-tags {
  background-position: -25px -48px;
}
.icon-book {
  background-position: -48px -48px;
}
.icon-bookmark {
  background-position: -72px -48px;
}
.icon-print {
  background-position: -96px -48px;
}
.icon-camera {
  background-position: -120px -48px;
}
.icon-font {
  background-position: -144px -48px;
}
.icon-bold {
  background-position: -167px -48px;
}
.icon-italic {
  background-position: -192px -48px;
}
.icon-text-height {
  background-position: -216px -48px;
}
.icon-text-width {
  background-position: -240px -48px;
}
.icon-align-left {
  background-position: -264px -48px;
}
.icon-align-center {
  background-position: -288px -48px;
}
.icon-align-right {
  background-position: -312px -48px;
}
.icon-align-justify {
  background-position: -336px -48px;
}
.icon-list {
  background-position: -360px -48px;
}
.icon-indent-left {
  background-position: -384px -48px;
}
.icon-indent-right {
  background-position: -408px -48px;
}
.icon-facetime-video {
  background-position: -432px -48px;
}
.icon-picture {
  background-position: -456px -48px;
}
.icon-pencil {
  background-position: 0 -72px;
}
.icon-map-marker {
  background-position: -24px -72px;
}
.icon-adjust {
  background-position: -48px -72px;
}
.icon-tint {
  background-position: -72px -72px;
}
.icon-edit {
  background-position: -96px -72px;
}
.icon-share {
  background-position: -120px -72px;
}
.icon-check {
  background-position: -144px -72px;
}
.icon-move {
  background-position: -168px -72px;
}
.icon-step-backward {
  background-position: -192px -72px;
}
.icon-fast-backward {
  background-position: -216px -72px;
}
.icon-backward {
  background-position: -240px -72px;
}
.icon-play {
  background-position: -264px -72px;
}
.icon-pause {
  background-position: -288px -72px;
}
.icon-stop {
  background-position: -312px -72px;
}
.icon-forward {
  background-position: -336px -72px;
}
.icon-fast-forward {
  background-position: -360px -72px;
}
.icon-step-forward {
  background-position: -384px -72px;
}
.icon-eject {
  background-position: -408px -72px;
}
.icon-chevron-left {
  background-position: -432px -72px;
}
.icon-chevron-right {
  background-position: -456px -72px;
}
.icon-plus-sign {
  background-position: 0 -96px;
}
.icon-minus-sign {
  background-position: -24px -96px;
}
.icon-remove-sign {
  background-position: -48px -96px;
}
.icon-ok-sign {
  background-position: -72px -96px;
}
.icon-question-sign {
  background-position: -96px -96px;
}
.icon-info-sign {
  background-position: -120px -96px;
}
.icon-screenshot {
  background-position: -144px -96px;
}
.icon-remove-circle {
  background-position: -168px -96px;
}
.icon-ok-circle {
  background-position: -192px -96px;
}
.icon-ban-circle {
  background-position: -216px -96px;
}
.icon-arrow-left {
  background-position: -240px -96px;
}
.icon-arrow-right {
  background-position: -264px -96px;
}
.icon-arrow-up {
  background-position: -289px -96px;
}
.icon-arrow-down {
  background-position: -312px -96px;
}
.icon-share-alt {
  background-position: -336px -96px;
}
.icon-resize-full {
  background-position: -360px -96px;
}
.icon-resize-small {
  background-position: -384px -96px;
}
.icon-plus {
  background-position: -408px -96px;
}
.icon-minus {
  background-position: -433px -96px;
}
.icon-asterisk {
  background-position: -456px -96px;
}
.icon-exclamation-sign {
  background-position: 0 -120px;
}
.icon-gift {
  background-position: -24px -120px;
}
.icon-leaf {
  background-position: -48px -120px;
}
.icon-fire {
  background-position: -72px -120px;
}
.icon-eye-open {
  background-position: -96px -120px;
}
.icon-eye-close {
  background-position: -120px -120px;
}
.icon-warning-sign {
  background-position: -144px -120px;
}
.icon-plane {
  background-position: -168px -120px;
}
.icon-calendar {
  background-position: -192px -120px;
}
.icon-random {
  background-position: -216px -120px;
  width: 16px;
}
.icon-comment {
  background-position: -240px -120px;
}
.icon-magnet {
  background-position: -264px -120px;
}
.icon-chevron-up {
  background-position: -288px -120px;
}
.icon-chevron-down {
  background-position: -313px -119px;
}
.icon-retweet {
  background-position: -336px -120px;
}
.icon-shopping-cart {
  background-position: -360px -120px;
}
.icon-folder-close {
  background-position: -384px -120px;
  width: 16px;
}
.icon-folder-open {
  background-position: -408px -120px;
  width: 16px;
}
.icon-resize-vertical {
  background-position: -432px -119px;
}
.icon-resize-horizontal {
  background-position: -456px -118px;
}
.icon-hdd {
  background-position: 0 -144px;
}
.icon-bullhorn {
  background-position: -24px -144px;
}
.icon-bell {
  background-position: -48px -144px;
}
.icon-certificate {
  background-position: -72px -144px;
}
.icon-thumbs-up {
  background-position: -96px -144px;
}
.icon-thumbs-down {
  background-position: -120px -144px;
}
.icon-hand-right {
  background-position: -144px -144px;
}
.icon-hand-left {
  background-position: -168px -144px;
}
.icon-hand-up {
  background-position: -192px -144px;
}
.icon-hand-down {
  background-position: -216px -144px;
}
.icon-circle-arrow-right {
  background-position: -240px -144px;
}
.icon-circle-arrow-left {
  background-position: -264px -144px;
}
.icon-circle-arrow-up {
  background-position: -288px -144px;
}
.icon-circle-arrow-down {
  background-position: -312px -144px;
}
.icon-globe {
  background-position: -336px -144px;
}
.icon-wrench {
  background-position: -360px -144px;
}
.icon-tasks {
  background-position: -384px -144px;
}
.icon-filter {
  background-position: -408px -144px;
}
.icon-briefcase {
  background-position: -432px -144px;
}
.icon-fullscreen {
  background-position: -456px -144px;
}
.dropup,
.dropdown {
  position: relative;
}
.dropdown-toggle {
  *margin-bottom: -3px;
}
.dropdown-toggle:active,
.open .dropdown-toggle {
  outline: 0;
}
.caret {
  display: inline-block;
  width: 0;
  height: 0;
  vertical-align: top;
  border-top: 4px solid #000000;
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
  content: "";
}
.dropdown .caret {
  margin-top: 8px;
  margin-left: 2px;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  float: left;
  min-width: 160px;
  padding: 5px 0;
  margin: 2px 0 0;
  list-style: none;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border: 1px solid rgba(0, 0, 0, 0.2);
  *border-right-width: 2px;
  *border-bottom-width: 2px;
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  -moz-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  -webkit-background-clip: padding-box;
  -moz-background-clip: padding;
  background-clip: padding-box;
}
.dropdown-menu.pull-right {
  right: 0;
  left: auto;
}
.dropdown-menu .divider {
  *width: 100%;
  height: 1px;
  margin: 8px 1px;
  *margin: -5px 0 5px;
  overflow: hidden;
  background-color: #e5e5e5;
  border-bottom: 1px solid #ffffff;
}
.dropdown-menu > li > a {
  display: block;
  padding: 3px 20px;
  clear: both;
  font-weight: normal;
  line-height: 18px;
  color: #666666;
  white-space: nowrap;
}
.dropdown-menu > li > a:hover,
.dropdown-menu > li > a:focus,
.dropdown-submenu:hover > a,
.dropdown-submenu:focus > a {
  text-decoration: none;
  color: #ffffff;
  background-color: #407bb1;
  background-image: -moz-linear-gradient(top, #4380b8, #3c73a5);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#4380b8), to(#3c73a5));
  background-image: -webkit-linear-gradient(top, #4380b8, #3c73a5);
  background-image: -o-linear-gradient(top, #4380b8, #3c73a5);
  background-image: linear-gradient(to bottom, #4380b8, #3c73a5);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff4380b8', endColorstr='#ff3c73a5', GradientType=0);
}
.dropdown-menu > .active > a,
.dropdown-menu > .active > a:hover,
.dropdown-menu > .active > a:focus {
  color: #ffffff;
  text-decoration: none;
  outline: 0;
  background-color: #407bb1;
  background-image: -moz-linear-gradient(top, #4380b8, #3c73a5);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#4380b8), to(#3c73a5));
  background-image: -webkit-linear-gradient(top, #4380b8, #3c73a5);
  background-image: -o-linear-gradient(top, #4380b8, #3c73a5);
  background-image: linear-gradient(to bottom, #4380b8, #3c73a5);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff4380b8', endColorstr='#ff3c73a5', GradientType=0);
}
.dropdown-menu > .disabled > a,
.dropdown-menu > .disabled > a:hover,
.dropdown-menu > .disabled > a:focus {
  color: #cccccc;
}
.dropdown-menu > .disabled > a:hover,
.dropdown-menu > .disabled > a:focus {
  text-decoration: none;
  background-color: transparent;
  background-image: none;
  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
  cursor: default;
}
.open {
  *z-index: 1000;
}
.open > .dropdown-menu {
  display: block;
}
.pull-right > .dropdown-menu {
  right: 0;
  left: auto;
}
.dropup .caret,
.navbar-fixed-bottom .dropdown .caret {
  border-top: 0;
  border-bottom: 4px solid #000000;
  content: "";
}
.dropup .dropdown-menu,
.navbar-fixed-bottom .dropdown .dropdown-menu {
  top: auto;
  bottom: 100%;
  margin-bottom: 1px;
}
.dropdown-submenu {
  position: relative;
}
.dropdown-submenu > .dropdown-menu {
  top: 0;
  left: 100%;
  margin-top: -6px;
  margin-left: -1px;
  -webkit-border-radius: 0 6px 6px 6px;
  -moz-border-radius: 0 6px 6px 6px;
  border-radius: 0 6px 6px 6px;
}
.dropdown-submenu:hover > .dropdown-menu {
  display: block;
}
.dropup .dropdown-submenu > .dropdown-menu {
  top: auto;
  bottom: 0;
  margin-top: 0;
  margin-bottom: -2px;
  -webkit-border-radius: 5px 5px 5px 0;
  -moz-border-radius: 5px 5px 5px 0;
  border-radius: 5px 5px 5px 0;
}
.dropdown-submenu > a:after {
  display: block;
  content: " ";
  float: right;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px 0 5px 5px;
  border-left-color: #cccccc;
  margin-top: 5px;
  margin-right: -10px;
}
.dropdown-submenu:hover > a:after {
  border-left-color: #ffffff;
}
.dropdown-submenu.pull-left {
  float: none;
}
.dropdown-submenu.pull-left > .dropdown-menu {
  left: -100%;
  margin-left: 10px;
  -webkit-border-radius: 6px 0 6px 6px;
  -moz-border-radius: 6px 0 6px 6px;
  border-radius: 6px 0 6px 6px;
}
.dropdown .dropdown-menu .nav-header {
  padding-left: 20px;
  padding-right: 20px;
}
.typeahead {
  z-index: 1051;
  margin-top: 2px;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
.well {
  min-height: 20px;
  padding: 19px;
  margin-bottom: 20px;
  background-color: #f5f5f5;
  border: 1px solid #e3e3e3;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
}
.well blockquote {
  border-color: #ddd;
  border-color: rgba(0, 0, 0, 0.15);
}
.well-large {
  padding: 24px;
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
}
.well-small {
  padding: 9px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}
.fade {
  opacity: 0;
  -webkit-transition: opacity 0.15s linear;
  -moz-transition: opacity 0.15s linear;
  -o-transition: opacity 0.15s linear;
  transition: opacity 0.15s linear;
}
.fade.in {
  opacity: 1;
}
.collapse {
  position: relative;
  height: 0;
  overflow: hidden;
  -webkit-transition: height 0.35s ease;
  -moz-transition: height 0.35s ease;
  -o-transition: height 0.35s ease;
  transition: height 0.35s ease;
}
.collapse.in {
  height: auto;
}
.close {
  float: right;
  font-size: 20px;
  font-weight: bold;
  line-height: 18px;
  color: #000000;
  text-shadow: 0 1px 0 #ffffff;
  opacity: 0.2;
  filter: alpha(opacity=20);
}
.close:hover,
.close:focus {
  color: #000000;
  text-decoration: none;
  cursor: pointer;
  opacity: 0.4;
  filter: alpha(opacity=40);
}
button.close {
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
  -webkit-appearance: none;
}
.btn {
  display: inline-block;
  *display: inline;
  /* IE7 inline-block hack */

  *zoom: 1;
  padding: 4px 12px;
  margin-bottom: 0;
  font-size: 16px;
  line-height: 18px;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  color: #666666;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75);
  background-color: #f5f5f5;
  background-image: -moz-linear-gradient(top, #ffffff, #e6e6e6);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffffff), to(#e6e6e6));
  background-image: -webkit-linear-gradient(top, #ffffff, #e6e6e6);
  background-image: -o-linear-gradient(top, #ffffff, #e6e6e6);
  background-image: linear-gradient(to bottom, #ffffff, #e6e6e6);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffffff', endColorstr='#ffe6e6e6', GradientType=0);
  border-color: #e6e6e6 #e6e6e6 #bfbfbf;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #e6e6e6;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
  border: 1px solid #cccccc;
  *border: 0;
  border-bottom-color: #b3b3b3;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  *margin-left: .3em;
  -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);
  -moz-box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);
}
.btn:hover,
.btn:focus,
.btn:active,
.btn.active,
.btn.disabled,
.btn[disabled] {
  color: #666666;
  background-color: #e6e6e6;
  *background-color: #d9d9d9;
}
.btn:active,
.btn.active {
  background-color: #cccccc \9;
}
.btn:first-child {
  *margin-left: 0;
}
.btn:hover,
.btn:focus {
  color: #666666;
  text-decoration: none;
  background-position: 0 -15px;
  -webkit-transition: background-position 0.1s linear;
  -moz-transition: background-position 0.1s linear;
  -o-transition: background-position 0.1s linear;
  transition: background-position 0.1s linear;
}
.btn:focus {
  outline: thin dotted #333;
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}
.btn.active,
.btn:active {
  background-image: none;
  outline: 0;
  -webkit-box-shadow: inset 0 2px 4px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.05);
  -moz-box-shadow: inset 0 2px 4px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.05);
  box-shadow: inset 0 2px 4px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.05);
}
.btn.disabled,
.btn[disabled] {
  cursor: default;
  background-image: none;
  opacity: 0.65;
  filter: alpha(opacity=65);
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
}
.btn-large {
  padding: 11px 19px;
  font-size: 20px;
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
}
.btn-large [class^="icon-"],
.btn-large [class*=" icon-"] {
  margin-top: 4px;
}
.btn-small {
  padding: 2px 10px;
  font-size: 13.6px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}
.btn-small [class^="icon-"],
.btn-small [class*=" icon-"] {
  margin-top: 0;
}
.btn-mini [class^="icon-"],
.btn-mini [class*=" icon-"] {
  margin-top: -1px;
}
.btn-mini {
  padding: 0 6px;
  font-size: 12px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}
.btn-block {
  display: block;
  width: 100%;
  padding-left: 0;
  padding-right: 0;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
.btn-block + .btn-block {
  margin-top: 5px;
}
input[type="submit"].btn-block,
input[type="reset"].btn-block,
input[type="button"].btn-block {
  width: 100%;
}
.btn-primary.active,
.btn-warning.active,
.btn-danger.active,
.btn-success.active,
.btn-info.active,
.btn-inverse.active {
  color: rgba(255, 255, 255, 0.75);
}
.btn-primary {
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #4374b8;
  background-image: -moz-linear-gradient(top, #4380b8, #4363b8);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#4380b8), to(#4363b8));
  background-image: -webkit-linear-gradient(top, #4380b8, #4363b8);
  background-image: -o-linear-gradient(top, #4380b8, #4363b8);
  background-image: linear-gradient(to bottom, #4380b8, #4363b8);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff4380b8', endColorstr='#ff4363b8', GradientType=0);
  border-color: #4363b8 #4363b8 #2f4580;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #4363b8;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.btn-primary:hover,
.btn-primary:focus,
.btn-primary:active,
.btn-primary.active,
.btn-primary.disabled,
.btn-primary[disabled] {
  color: #ffffff;
  background-color: #4363b8;
  *background-color: #3c59a5;
}
.btn-primary:active,
.btn-primary.active {
  background-color: #354f93 \9;
}
.btn-warning {
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #ffd52e;
  background-image: -moz-linear-gradient(top, #ffdb4d, #ffcc00);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffdb4d), to(#ffcc00));
  background-image: -webkit-linear-gradient(top, #ffdb4d, #ffcc00);
  background-image: -o-linear-gradient(top, #ffdb4d, #ffcc00);
  background-image: linear-gradient(to bottom, #ffdb4d, #ffcc00);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffdb4d', endColorstr='#ffffcc00', GradientType=0);
  border-color: #ffcc00 #ffcc00 #b38f00;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #ffcc00;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.btn-warning:hover,
.btn-warning:focus,
.btn-warning:active,
.btn-warning.active,
.btn-warning.disabled,
.btn-warning[disabled] {
  color: #ffffff;
  background-color: #ffcc00;
  *background-color: #e6b800;
}
.btn-warning:active,
.btn-warning.active {
  background-color: #cca300 \9;
}
.btn-danger {
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #da4f49;
  background-image: -moz-linear-gradient(top, #ee5f5b, #bd362f);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ee5f5b), to(#bd362f));
  background-image: -webkit-linear-gradient(top, #ee5f5b, #bd362f);
  background-image: -o-linear-gradient(top, #ee5f5b, #bd362f);
  background-image: linear-gradient(to bottom, #ee5f5b, #bd362f);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffee5f5b', endColorstr='#ffbd362f', GradientType=0);
  border-color: #bd362f #bd362f #802420;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #bd362f;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.btn-danger:hover,
.btn-danger:focus,
.btn-danger:active,
.btn-danger.active,
.btn-danger.disabled,
.btn-danger[disabled] {
  color: #ffffff;
  background-color: #bd362f;
  *background-color: #a9302a;
}
.btn-danger:active,
.btn-danger.active {
  background-color: #942a25 \9;
}
.btn-success {
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #5bb75b;
  background-image: -moz-linear-gradient(top, #62c462, #51a351);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#62c462), to(#51a351));
  background-image: -webkit-linear-gradient(top, #62c462, #51a351);
  background-image: -o-linear-gradient(top, #62c462, #51a351);
  background-image: linear-gradient(to bottom, #62c462, #51a351);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff62c462', endColorstr='#ff51a351', GradientType=0);
  border-color: #51a351 #51a351 #387038;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #51a351;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.btn-success:hover,
.btn-success:focus,
.btn-success:active,
.btn-success.active,
.btn-success.disabled,
.btn-success[disabled] {
  color: #ffffff;
  background-color: #51a351;
  *background-color: #499249;
}
.btn-success:active,
.btn-success.active {
  background-color: #408140 \9;
}
.btn-info {
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #49afcd;
  background-image: -moz-linear-gradient(top, #5bc0de, #2f96b4);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#5bc0de), to(#2f96b4));
  background-image: -webkit-linear-gradient(top, #5bc0de, #2f96b4);
  background-image: -o-linear-gradient(top, #5bc0de, #2f96b4);
  background-image: linear-gradient(to bottom, #5bc0de, #2f96b4);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff5bc0de', endColorstr='#ff2f96b4', GradientType=0);
  border-color: #2f96b4 #2f96b4 #1f6377;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #2f96b4;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.btn-info:hover,
.btn-info:focus,
.btn-info:active,
.btn-info.active,
.btn-info.disabled,
.btn-info[disabled] {
  color: #ffffff;
  background-color: #2f96b4;
  *background-color: #2a85a0;
}
.btn-info:active,
.btn-info.active {
  background-color: #24748c \9;
}
.btn-inverse {
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #3d3d3d;
  background-image: -moz-linear-gradient(top, #444444, #333333);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#444444), to(#333333));
  background-image: -webkit-linear-gradient(top, #444444, #333333);
  background-image: -o-linear-gradient(top, #444444, #333333);
  background-image: linear-gradient(to bottom, #444444, #333333);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff444444', endColorstr='#ff333333', GradientType=0);
  border-color: #333333 #333333 #0d0d0d;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #333333;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.btn-inverse:hover,
.btn-inverse:focus,
.btn-inverse:active,
.btn-inverse.active,
.btn-inverse.disabled,
.btn-inverse[disabled] {
  color: #ffffff;
  background-color: #333333;
  *background-color: #262626;
}
.btn-inverse:active,
.btn-inverse.active {
  background-color: #1a1a1a \9;
}
button.btn,
input[type="submit"].btn {
  *padding-top: 3px;
  *padding-bottom: 3px;
}
button.btn::-moz-focus-inner,
input[type="submit"].btn::-moz-focus-inner {
  padding: 0;
  border: 0;
}
button.btn.btn-large,
input[type="submit"].btn.btn-large {
  *padding-top: 7px;
  *padding-bottom: 7px;
}
button.btn.btn-small,
input[type="submit"].btn.btn-small {
  *padding-top: 3px;
  *padding-bottom: 3px;
}
button.btn.btn-mini,
input[type="submit"].btn.btn-mini {
  *padding-top: 1px;
  *padding-bottom: 1px;
}
.btn-link,
.btn-link:active,
.btn-link[disabled] {
  background-color: transparent;
  background-image: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
}
.btn-link {
  border-color: transparent;
  cursor: pointer;
  color: #4380b8;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.btn-link:hover,
.btn-link:focus {
  color: #426799;
  text-decoration: underline;
  background-color: transparent;
}
.btn-link[disabled]:hover,
.btn-link[disabled]:focus {
  color: #666666;
  text-decoration: none;
}
.btn-group {
  position: relative;
  display: inline-block;
  *display: inline;
  /* IE7 inline-block hack */

  *zoom: 1;
  font-size: 0;
  vertical-align: middle;
  white-space: nowrap;
  *margin-left: .3em;
}
.btn-group:first-child {
  *margin-left: 0;
}
.btn-group + .btn-group {
  margin-left: 5px;
}
.btn-toolbar {
  font-size: 0;
  margin-top: 9px;
  margin-bottom: 9px;
}
.btn-toolbar > .btn + .btn,
.btn-toolbar > .btn-group + .btn,
.btn-toolbar > .btn + .btn-group {
  margin-left: 5px;
}
.btn-group > .btn {
  position: relative;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.btn-group > .btn + .btn {
  margin-left: -1px;
}
.btn-group > .btn,
.btn-group > .dropdown-menu,
.btn-group > .popover {
  font-size: 16px;
}
.btn-group > .btn-mini {
  font-size: 12px;
}
.btn-group > .btn-small {
  font-size: 13.6px;
}
.btn-group > .btn-large {
  font-size: 20px;
}
.btn-group > .btn:first-child {
  margin-left: 0;
  -webkit-border-top-left-radius: 4px;
  -moz-border-radius-topleft: 4px;
  border-top-left-radius: 4px;
  -webkit-border-bottom-left-radius: 4px;
  -moz-border-radius-bottomleft: 4px;
  border-bottom-left-radius: 4px;
}
.btn-group > .btn:last-child,
.btn-group > .dropdown-toggle {
  -webkit-border-top-right-radius: 4px;
  -moz-border-radius-topright: 4px;
  border-top-right-radius: 4px;
  -webkit-border-bottom-right-radius: 4px;
  -moz-border-radius-bottomright: 4px;
  border-bottom-right-radius: 4px;
}
.btn-group > .btn.large:first-child {
  margin-left: 0;
  -webkit-border-top-left-radius: 6px;
  -moz-border-radius-topleft: 6px;
  border-top-left-radius: 6px;
  -webkit-border-bottom-left-radius: 6px;
  -moz-border-radius-bottomleft: 6px;
  border-bottom-left-radius: 6px;
}
.btn-group > .btn.large:last-child,
.btn-group > .large.dropdown-toggle {
  -webkit-border-top-right-radius: 6px;
  -moz-border-radius-topright: 6px;
  border-top-right-radius: 6px;
  -webkit-border-bottom-right-radius: 6px;
  -moz-border-radius-bottomright: 6px;
  border-bottom-right-radius: 6px;
}
.btn-group > .btn:hover,
.btn-group > .btn:focus,
.btn-group > .btn:active,
.btn-group > .btn.active {
  z-index: 2;
}
.btn-group .dropdown-toggle:active,
.btn-group.open .dropdown-toggle {
  outline: 0;
}
.btn-group > .btn + .dropdown-toggle {
  padding-left: 8px;
  padding-right: 8px;
  -webkit-box-shadow: inset 1px 0 0 rgba(255,255,255,.125), inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);
  -moz-box-shadow: inset 1px 0 0 rgba(255,255,255,.125), inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);
  box-shadow: inset 1px 0 0 rgba(255,255,255,.125), inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);
  *padding-top: 5px;
  *padding-bottom: 5px;
}
.btn-group > .btn-mini + .dropdown-toggle {
  padding-left: 5px;
  padding-right: 5px;
  *padding-top: 2px;
  *padding-bottom: 2px;
}
.btn-group > .btn-small + .dropdown-toggle {
  *padding-top: 5px;
  *padding-bottom: 4px;
}
.btn-group > .btn-large + .dropdown-toggle {
  padding-left: 12px;
  padding-right: 12px;
  *padding-top: 7px;
  *padding-bottom: 7px;
}
.btn-group.open .dropdown-toggle {
  background-image: none;
  -webkit-box-shadow: inset 0 2px 4px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.05);
  -moz-box-shadow: inset 0 2px 4px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.05);
  box-shadow: inset 0 2px 4px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.05);
}
.btn-group.open .btn.dropdown-toggle {
  background-color: #e6e6e6;
}
.btn-group.open .btn-primary.dropdown-toggle {
  background-color: #4363b8;
}
.btn-group.open .btn-warning.dropdown-toggle {
  background-color: #ffcc00;
}
.btn-group.open .btn-danger.dropdown-toggle {
  background-color: #bd362f;
}
.btn-group.open .btn-success.dropdown-toggle {
  background-color: #51a351;
}
.btn-group.open .btn-info.dropdown-toggle {
  background-color: #2f96b4;
}
.btn-group.open .btn-inverse.dropdown-toggle {
  background-color: #333333;
}
.btn .caret {
  margin-top: 8px;
  margin-left: 0;
}
.btn-large .caret {
  margin-top: 6px;
}
.btn-large .caret {
  border-left-width: 5px;
  border-right-width: 5px;
  border-top-width: 5px;
}
.btn-mini .caret,
.btn-small .caret {
  margin-top: 8px;
}
.dropup .btn-large .caret {
  border-bottom-width: 5px;
}
.btn-primary .caret,
.btn-warning .caret,
.btn-danger .caret,
.btn-info .caret,
.btn-success .caret,
.btn-inverse .caret {
  border-top-color: #ffffff;
  border-bottom-color: #ffffff;
}
.btn-group-vertical {
  display: inline-block;
  *display: inline;
  /* IE7 inline-block hack */

  *zoom: 1;
}
.btn-group-vertical > .btn {
  display: block;
  float: none;
  max-width: 100%;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.btn-group-vertical > .btn + .btn {
  margin-left: 0;
  margin-top: -1px;
}
.btn-group-vertical > .btn:first-child {
  -webkit-border-radius: 4px 4px 0 0;
  -moz-border-radius: 4px 4px 0 0;
  border-radius: 4px 4px 0 0;
}
.btn-group-vertical > .btn:last-child {
  -webkit-border-radius: 0 0 4px 4px;
  -moz-border-radius: 0 0 4px 4px;
  border-radius: 0 0 4px 4px;
}
.btn-group-vertical > .btn-large:first-child {
  -webkit-border-radius: 6px 6px 0 0;
  -moz-border-radius: 6px 6px 0 0;
  border-radius: 6px 6px 0 0;
}
.btn-group-vertical > .btn-large:last-child {
  -webkit-border-radius: 0 0 6px 6px;
  -moz-border-radius: 0 0 6px 6px;
  border-radius: 0 0 6px 6px;
}
.alert {
  padding: 8px 35px 8px 14px;
  margin-bottom: 18px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  background-color: #fcf8e3;
  border: 1px solid #fbeed5;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
.alert,
.alert h4 {
  color: #c09853;
}
.alert h4 {
  margin: 0;
}
.alert .close {
  position: relative;
  top: -2px;
  right: -21px;
  line-height: 18px;
}
.alert-success {
  background-color: #dff0d8;
  border-color: #d6e9c6;
  color: #468847;
}
.alert-success h4 {
  color: #468847;
}
.alert-danger,
.alert-error {
  background-color: #f2dede;
  border-color: #eed3d7;
  color: #b94a48;
}
.alert-danger h4,
.alert-error h4 {
  color: #b94a48;
}
.alert-info {
  background-color: #d9edf7;
  border-color: #bce8f1;
  color: #3a87ad;
}
.alert-info h4 {
  color: #3a87ad;
}
.alert-block {
  padding-top: 14px;
  padding-bottom: 14px;
}
.alert-block > p,
.alert-block > ul {
  margin-bottom: 0;
}
.alert-block p + p {
  margin-top: 5px;
}
.nav {
  margin-left: 0;
  margin-bottom: 18px;
  list-style: none;
}
.nav > li > a {
  display: block;
}
.nav > li > a:hover,
.nav > li > a:focus {
  text-decoration: none;
  background-color: #ffffff;
}
.nav > li > a > img {
  max-width: none;
}
.nav > .pull-right {
  float: right;
}
.nav-header {
  display: block;
  padding: 3px 15px;
  font-size: 11px;
  font-weight: bold;
  line-height: 18px;
  color: #cccccc;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}
.nav li + .nav-header {
  margin-top: 9px;
}
.nav-list {
  padding-left: 15px;
  padding-right: 15px;
  margin-bottom: 0;
}
.nav-list > li > a,
.nav-list .nav-header {
  margin-left: -15px;
  margin-right: -15px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}
.nav-list > li > a {
  padding: 3px 15px;
}
.nav-list > .active > a,
.nav-list > .active > a:hover,
.nav-list > .active > a:focus {
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.2);
  background-color: #4380b8;
}
.nav-list [class^="icon-"],
.nav-list [class*=" icon-"] {
  margin-right: 2px;
}
.nav-list .divider {
  *width: 100%;
  height: 1px;
  margin: 8px 1px;
  *margin: -5px 0 5px;
  overflow: hidden;
  background-color: #e5e5e5;
  border-bottom: 1px solid #ffffff;
}
.nav-tabs,
.nav-pills {
  *zoom: 1;
}
.nav-tabs:before,
.nav-pills:before,
.nav-tabs:after,
.nav-pills:after {
  display: table;
  content: "";
  line-height: 0;
}
.nav-tabs:after,
.nav-pills:after {
  clear: both;
}
.nav-tabs:before,
.nav-pills:before,
.nav-tabs:after,
.nav-pills:after {
  display: table;
  content: "";
  line-height: 0;
}
.nav-tabs:after,
.nav-pills:after {
  clear: both;
}
.nav-tabs > li,
.nav-pills > li {
  float: left;
}
.nav-tabs > li > a,
.nav-pills > li > a {
  padding-right: 12px;
  padding-left: 12px;
  margin-right: 2px;
  line-height: 14px;
}
.nav-tabs {
  border-bottom: 1px solid #ddd;
}
.nav-tabs > li {
  margin-bottom: -1px;
}
.nav-tabs > li > a {
  padding-top: 8px;
  padding-bottom: 8px;
  line-height: 18px;
  border: 1px solid transparent;
  -webkit-border-radius: 4px 4px 0 0;
  -moz-border-radius: 4px 4px 0 0;
  border-radius: 4px 4px 0 0;
}
.nav-tabs > li > a:hover,
.nav-tabs > li > a:focus {
  border-color: #ffffff #ffffff #dddddd;
}
.nav-tabs > .active > a,
.nav-tabs > .active > a:hover,
.nav-tabs > .active > a:focus {
  color: #999999;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-bottom-color: transparent;
  cursor: default;
}
.nav-pills > li > a {
  padding-top: 8px;
  padding-bottom: 8px;
  margin-top: 2px;
  margin-bottom: 2px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
}
.nav-pills > .active > a,
.nav-pills > .active > a:hover,
.nav-pills > .active > a:focus {
  color: #ffffff;
  background-color: #4380b8;
}
.nav-stacked > li {
  float: none;
}
.nav-stacked > li > a {
  margin-right: 0;
}
.nav-tabs.nav-stacked {
  border-bottom: 0;
}
.nav-tabs.nav-stacked > li > a {
  border: 1px solid #ddd;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.nav-tabs.nav-stacked > li:first-child > a {
  -webkit-border-top-right-radius: 4px;
  -moz-border-radius-topright: 4px;
  border-top-right-radius: 4px;
  -webkit-border-top-left-radius: 4px;
  -moz-border-radius-topleft: 4px;
  border-top-left-radius: 4px;
}
.nav-tabs.nav-stacked > li:last-child > a {
  -webkit-border-bottom-right-radius: 4px;
  -moz-border-radius-bottomright: 4px;
  border-bottom-right-radius: 4px;
  -webkit-border-bottom-left-radius: 4px;
  -moz-border-radius-bottomleft: 4px;
  border-bottom-left-radius: 4px;
}
.nav-tabs.nav-stacked > li > a:hover,
.nav-tabs.nav-stacked > li > a:focus {
  border-color: #ddd;
  z-index: 2;
}
.nav-pills.nav-stacked > li > a {
  margin-bottom: 3px;
}
.nav-pills.nav-stacked > li:last-child > a {
  margin-bottom: 1px;
}
.nav-tabs .dropdown-menu {
  -webkit-border-radius: 0 0 6px 6px;
  -moz-border-radius: 0 0 6px 6px;
  border-radius: 0 0 6px 6px;
}
.nav-pills .dropdown-menu {
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
}
.nav .dropdown-toggle .caret {
  border-top-color: #4380b8;
  border-bottom-color: #4380b8;
  margin-top: 6px;
}
.nav .dropdown-toggle:hover .caret,
.nav .dropdown-toggle:focus .caret {
  border-top-color: #426799;
  border-bottom-color: #426799;
}
/* move down carets for tabs */
.nav-tabs .dropdown-toggle .caret {
  margin-top: 8px;
}
.nav .active .dropdown-toggle .caret {
  border-top-color: #fff;
  border-bottom-color: #fff;
}
.nav-tabs .active .dropdown-toggle .caret {
  border-top-color: #999999;
  border-bottom-color: #999999;
}
.nav > .dropdown.active > a:hover,
.nav > .dropdown.active > a:focus {
  cursor: pointer;
}
.nav-tabs .open .dropdown-toggle,
.nav-pills .open .dropdown-toggle,
.nav > li.dropdown.open.active > a:hover,
.nav > li.dropdown.open.active > a:focus {
  color: #ffffff;
  background-color: #cccccc;
  border-color: #cccccc;
}
.nav li.dropdown.open .caret,
.nav li.dropdown.open.active .caret,
.nav li.dropdown.open a:hover .caret,
.nav li.dropdown.open a:focus .caret {
  border-top-color: #ffffff;
  border-bottom-color: #ffffff;
  opacity: 1;
  filter: alpha(opacity=100);
}
.tabs-stacked .open > a:hover,
.tabs-stacked .open > a:focus {
  border-color: #cccccc;
}
.tabbable {
  *zoom: 1;
}
.tabbable:before,
.tabbable:after {
  display: table;
  content: "";
  line-height: 0;
}
.tabbable:after {
  clear: both;
}
.tabbable:before,
.tabbable:after {
  display: table;
  content: "";
  line-height: 0;
}
.tabbable:after {
  clear: both;
}
.tab-content {
  overflow: auto;
}
.tabs-below > .nav-tabs,
.tabs-right > .nav-tabs,
.tabs-left > .nav-tabs {
  border-bottom: 0;
}
.tab-content > .tab-pane,
.pill-content > .pill-pane {
  display: none;
}
.tab-content > .active,
.pill-content > .active {
  display: block;
}
.tabs-below > .nav-tabs {
  border-top: 1px solid #ddd;
}
.tabs-below > .nav-tabs > li {
  margin-top: -1px;
  margin-bottom: 0;
}
.tabs-below > .nav-tabs > li > a {
  -webkit-border-radius: 0 0 4px 4px;
  -moz-border-radius: 0 0 4px 4px;
  border-radius: 0 0 4px 4px;
}
.tabs-below > .nav-tabs > li > a:hover,
.tabs-below > .nav-tabs > li > a:focus {
  border-bottom-color: transparent;
  border-top-color: #ddd;
}
.tabs-below > .nav-tabs > .active > a,
.tabs-below > .nav-tabs > .active > a:hover,
.tabs-below > .nav-tabs > .active > a:focus {
  border-color: transparent #ddd #ddd #ddd;
}
.tabs-left > .nav-tabs > li,
.tabs-right > .nav-tabs > li {
  float: none;
}
.tabs-left > .nav-tabs > li > a,
.tabs-right > .nav-tabs > li > a {
  min-width: 74px;
  margin-right: 0;
  margin-bottom: 3px;
}
.tabs-left > .nav-tabs {
  float: left;
  margin-right: 19px;
  border-right: 1px solid #ddd;
}
.tabs-left > .nav-tabs > li > a {
  margin-right: -1px;
  -webkit-border-radius: 4px 0 0 4px;
  -moz-border-radius: 4px 0 0 4px;
  border-radius: 4px 0 0 4px;
}
.tabs-left > .nav-tabs > li > a:hover,
.tabs-left > .nav-tabs > li > a:focus {
  border-color: #ffffff #dddddd #ffffff #ffffff;
}
.tabs-left > .nav-tabs .active > a,
.tabs-left > .nav-tabs .active > a:hover,
.tabs-left > .nav-tabs .active > a:focus {
  border-color: #ddd transparent #ddd #ddd;
  *border-right-color: #ffffff;
}
.tabs-right > .nav-tabs {
  float: right;
  margin-left: 19px;
  border-left: 1px solid #ddd;
}
.tabs-right > .nav-tabs > li > a {
  margin-left: -1px;
  -webkit-border-radius: 0 4px 4px 0;
  -moz-border-radius: 0 4px 4px 0;
  border-radius: 0 4px 4px 0;
}
.tabs-right > .nav-tabs > li > a:hover,
.tabs-right > .nav-tabs > li > a:focus {
  border-color: #ffffff #ffffff #ffffff #dddddd;
}
.tabs-right > .nav-tabs .active > a,
.tabs-right > .nav-tabs .active > a:hover,
.tabs-right > .nav-tabs .active > a:focus {
  border-color: #ddd #ddd #ddd transparent;
  *border-left-color: #ffffff;
}
.nav > .disabled > a {
  color: #cccccc;
}
.nav > .disabled > a:hover,
.nav > .disabled > a:focus {
  text-decoration: none;
  background-color: transparent;
  cursor: default;
}
.navbar {
  overflow: visible;
  margin-bottom: 18px;
  *position: relative;
  *z-index: 2;
}
.navbar-inner {
  min-height: 40px;
  padding-left: 20px;
  padding-right: 20px;
  background-color: #525252;
  background-image: -moz-linear-gradient(top, #666666, #333333);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#666666), to(#333333));
  background-image: -webkit-linear-gradient(top, #666666, #333333);
  background-image: -o-linear-gradient(top, #666666, #333333);
  background-image: linear-gradient(to bottom, #666666, #333333);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff666666', endColorstr='#ff333333', GradientType=0);
  border: 1px solid #141414;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.065);
  -moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.065);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.065);
  *zoom: 1;
}
.navbar-inner:before,
.navbar-inner:after {
  display: table;
  content: "";
  line-height: 0;
}
.navbar-inner:after {
  clear: both;
}
.navbar-inner:before,
.navbar-inner:after {
  display: table;
  content: "";
  line-height: 0;
}
.navbar-inner:after {
  clear: both;
}
.navbar .container {
  width: auto;
}
.nav-collapse.collapse {
  height: auto;
  overflow: visible;
}
.navbar .brand {
  float: left;
  display: block;
  padding: 11px 20px 11px;
  margin-left: -20px;
  font-size: 20px;
  font-weight: 200;
  color: #cccccc;
  text-shadow: 0 1px 0 #666666;
}
.navbar .brand:hover,
.navbar .brand:focus {
  text-decoration: none;
}
.navbar-text {
  margin-bottom: 0;
  line-height: 40px;
  color: #cccccc;
}
.navbar-link {
  color: #cccccc;
}
.navbar-link:hover,
.navbar-link:focus {
  color: #ffffff;
}
.navbar .divider-vertical {
  height: 40px;
  margin: 0 9px;
  border-left: 1px solid #333333;
  border-right: 1px solid #666666;
}
.navbar .btn,
.navbar .btn-group {
  margin-top: 5px;
}
.navbar .btn-group .btn,
.navbar .input-prepend .btn,
.navbar .input-append .btn,
.navbar .input-prepend .btn-group,
.navbar .input-append .btn-group {
  margin-top: 0;
}
.navbar-form {
  margin-bottom: 0;
  *zoom: 1;
}
.navbar-form:before,
.navbar-form:after {
  display: table;
  content: "";
  line-height: 0;
}
.navbar-form:after {
  clear: both;
}
.navbar-form:before,
.navbar-form:after {
  display: table;
  content: "";
  line-height: 0;
}
.navbar-form:after {
  clear: both;
}
.navbar-form input,
.navbar-form select,
.navbar-form .radio,
.navbar-form .checkbox {
  margin-top: 5px;
}
.navbar-form input,
.navbar-form select,
.navbar-form .btn {
  display: inline-block;
  margin-bottom: 0;
}
.navbar-form input[type="image"],
.navbar-form input[type="checkbox"],
.navbar-form input[type="radio"] {
  margin-top: 3px;
}
.navbar-form .input-append,
.navbar-form .input-prepend {
  margin-top: 5px;
  white-space: nowrap;
}
.navbar-form .input-append input,
.navbar-form .input-prepend input {
  margin-top: 0;
}
.navbar-search {
  position: relative;
  float: left;
  margin-top: 5px;
  margin-bottom: 0;
}
.navbar-search .search-query {
  margin-bottom: 0;
  padding: 4px 14px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: normal;
  line-height: 1;
  -webkit-border-radius: 15px;
  -moz-border-radius: 15px;
  border-radius: 15px;
}
.navbar-static-top {
  position: static;
  margin-bottom: 0;
}
.navbar-static-top .navbar-inner {
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.navbar-fixed-top,
.navbar-fixed-bottom {
  position: fixed;
  right: 0;
  left: 0;
  z-index: 1030;
  margin-bottom: 0;
}
.navbar-fixed-top .navbar-inner,
.navbar-static-top .navbar-inner {
  border-width: 0 0 1px;
}
.navbar-fixed-bottom .navbar-inner {
  border-width: 1px 0 0;
}
.navbar-fixed-top .navbar-inner,
.navbar-fixed-bottom .navbar-inner {
  padding-left: 0;
  padding-right: 0;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.navbar-static-top .container,
.navbar-fixed-top .container,
.navbar-fixed-bottom .container {
  width: 940px;
}
.navbar-fixed-top {
  top: 0;
}
.navbar-fixed-top .navbar-inner,
.navbar-static-top .navbar-inner {
  -webkit-box-shadow: 0 1px 10px rgba(0,0,0,.1);
  -moz-box-shadow: 0 1px 10px rgba(0,0,0,.1);
  box-shadow: 0 1px 10px rgba(0,0,0,.1);
}
.navbar-fixed-bottom {
  bottom: 0;
}
.navbar-fixed-bottom .navbar-inner {
  -webkit-box-shadow: 0 -1px 10px rgba(0,0,0,.1);
  -moz-box-shadow: 0 -1px 10px rgba(0,0,0,.1);
  box-shadow: 0 -1px 10px rgba(0,0,0,.1);
}
.navbar .nav {
  position: relative;
  left: 0;
  display: block;
  float: left;
  margin: 0 10px 0 0;
}
.navbar .nav.pull-right {
  float: right;
  margin-right: 0;
}
.navbar .nav > li {
  float: left;
}
.navbar .nav > li > a {
  float: none;
  padding: 11px 15px 11px;
  color: #cccccc;
  text-decoration: none;
  text-shadow: 0 1px 0 #666666;
}
.navbar .nav .dropdown-toggle .caret {
  margin-top: 8px;
}
.navbar .nav > li > a:focus,
.navbar .nav > li > a:hover {
  background-color: transparent;
  color: #ffffff;
  text-decoration: none;
}
.navbar .nav > .active > a,
.navbar .nav > .active > a:hover,
.navbar .nav > .active > a:focus {
  color: #999999;
  text-decoration: none;
  background-color: #262626;
  -webkit-box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.125);
  -moz-box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.125);
}
.navbar .btn-navbar {
  display: none;
  float: right;
  padding: 7px 10px;
  margin-left: 5px;
  margin-right: 5px;
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #454545;
  background-image: -moz-linear-gradient(top, #595959, #262626);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#595959), to(#262626));
  background-image: -webkit-linear-gradient(top, #595959, #262626);
  background-image: -o-linear-gradient(top, #595959, #262626);
  background-image: linear-gradient(to bottom, #595959, #262626);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff595959', endColorstr='#ff262626', GradientType=0);
  border-color: #262626 #262626 #000000;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #262626;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
  -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 1px 0 rgba(255,255,255,.075);
  -moz-box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 1px 0 rgba(255,255,255,.075);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 1px 0 rgba(255,255,255,.075);
}
.navbar .btn-navbar:hover,
.navbar .btn-navbar:focus,
.navbar .btn-navbar:active,
.navbar .btn-navbar.active,
.navbar .btn-navbar.disabled,
.navbar .btn-navbar[disabled] {
  color: #ffffff;
  background-color: #262626;
  *background-color: #1a1a1a;
}
.navbar .btn-navbar:active,
.navbar .btn-navbar.active {
  background-color: #0d0d0d \9;
}
.navbar .btn-navbar .icon-bar {
  display: block;
  width: 18px;
  height: 2px;
  background-color: #f5f5f5;
  -webkit-border-radius: 1px;
  -moz-border-radius: 1px;
  border-radius: 1px;
  -webkit-box-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
  -moz-box-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
}
.btn-navbar .icon-bar + .icon-bar {
  margin-top: 3px;
}
.navbar .nav > li > .dropdown-menu:before {
  content: '';
  display: inline-block;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid #ccc;
  border-bottom-color: rgba(0, 0, 0, 0.2);
  position: absolute;
  top: -7px;
  left: 9px;
}
.navbar .nav > li > .dropdown-menu:after {
  content: '';
  display: inline-block;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #ffffff;
  position: absolute;
  top: -6px;
  left: 10px;
}
.navbar-fixed-bottom .nav > li > .dropdown-menu:before {
  border-top: 7px solid #ccc;
  border-top-color: rgba(0, 0, 0, 0.2);
  border-bottom: 0;
  bottom: -7px;
  top: auto;
}
.navbar-fixed-bottom .nav > li > .dropdown-menu:after {
  border-top: 6px solid #ffffff;
  border-bottom: 0;
  bottom: -6px;
  top: auto;
}
.navbar .nav li.dropdown > a:hover .caret,
.navbar .nav li.dropdown > a:focus .caret {
  border-top-color: #ffffff;
  border-bottom-color: #ffffff;
}
.navbar .nav li.dropdown.open > .dropdown-toggle,
.navbar .nav li.dropdown.active > .dropdown-toggle,
.navbar .nav li.dropdown.open.active > .dropdown-toggle {
  background-color: #262626;
  color: #999999;
}
.navbar .nav li.dropdown > .dropdown-toggle .caret {
  border-top-color: #cccccc;
  border-bottom-color: #cccccc;
}
.navbar .nav li.dropdown.open > .dropdown-toggle .caret,
.navbar .nav li.dropdown.active > .dropdown-toggle .caret,
.navbar .nav li.dropdown.open.active > .dropdown-toggle .caret {
  border-top-color: #999999;
  border-bottom-color: #999999;
}
.navbar .pull-right > li > .dropdown-menu,
.navbar .nav > li > .dropdown-menu.pull-right {
  left: auto;
  right: 0;
}
.navbar .pull-right > li > .dropdown-menu:before,
.navbar .nav > li > .dropdown-menu.pull-right:before {
  left: auto;
  right: 12px;
}
.navbar .pull-right > li > .dropdown-menu:after,
.navbar .nav > li > .dropdown-menu.pull-right:after {
  left: auto;
  right: 13px;
}
.navbar .pull-right > li > .dropdown-menu .dropdown-menu,
.navbar .nav > li > .dropdown-menu.pull-right .dropdown-menu {
  left: auto;
  right: 100%;
  margin-left: 0;
  margin-right: -1px;
  -webkit-border-radius: 6px 0 6px 6px;
  -moz-border-radius: 6px 0 6px 6px;
  border-radius: 6px 0 6px 6px;
}
.navbar-inverse .navbar-inner {
  background-color: #1b1b1b;
  background-image: -moz-linear-gradient(top, #222222, #111111);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#222222), to(#111111));
  background-image: -webkit-linear-gradient(top, #222222, #111111);
  background-image: -o-linear-gradient(top, #222222, #111111);
  background-image: linear-gradient(to bottom, #222222, #111111);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff222222', endColorstr='#ff111111', GradientType=0);
  border-color: #252525;
}
.navbar-inverse .brand,
.navbar-inverse .nav > li > a {
  color: #cccccc;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
}
.navbar-inverse .brand:hover,
.navbar-inverse .nav > li > a:hover,
.navbar-inverse .brand:focus,
.navbar-inverse .nav > li > a:focus {
  color: #ffffff;
}
.navbar-inverse .brand {
  color: #cccccc;
}
.navbar-inverse .navbar-text {
  color: #cccccc;
}
.navbar-inverse .nav > li > a:focus,
.navbar-inverse .nav > li > a:hover {
  background-color: transparent;
  color: #ffffff;
}
.navbar-inverse .nav .active > a,
.navbar-inverse .nav .active > a:hover,
.navbar-inverse .nav .active > a:focus {
  color: #ffffff;
  background-color: #111111;
}
.navbar-inverse .navbar-link {
  color: #cccccc;
}
.navbar-inverse .navbar-link:hover,
.navbar-inverse .navbar-link:focus {
  color: #ffffff;
}
.navbar-inverse .divider-vertical {
  border-left-color: #111111;
  border-right-color: #222222;
}
.navbar-inverse .nav li.dropdown.open > .dropdown-toggle,
.navbar-inverse .nav li.dropdown.active > .dropdown-toggle,
.navbar-inverse .nav li.dropdown.open.active > .dropdown-toggle {
  background-color: #111111;
  color: #ffffff;
}
.navbar-inverse .nav li.dropdown > a:hover .caret,
.navbar-inverse .nav li.dropdown > a:focus .caret {
  border-top-color: #ffffff;
  border-bottom-color: #ffffff;
}
.navbar-inverse .nav li.dropdown > .dropdown-toggle .caret {
  border-top-color: #cccccc;
  border-bottom-color: #cccccc;
}
.navbar-inverse .nav li.dropdown.open > .dropdown-toggle .caret,
.navbar-inverse .nav li.dropdown.active > .dropdown-toggle .caret,
.navbar-inverse .nav li.dropdown.open.active > .dropdown-toggle .caret {
  border-top-color: #ffffff;
  border-bottom-color: #ffffff;
}
.navbar-inverse .navbar-search .search-query {
  color: #ffffff;
  background-color: #515151;
  border-color: #111111;
  -webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1), 0 1px 0 rgba(255,255,255,.15);
  -moz-box-shadow: inset 0 1px 2px rgba(0,0,0,.1), 0 1px 0 rgba(255,255,255,.15);
  box-shadow: inset 0 1px 2px rgba(0,0,0,.1), 0 1px 0 rgba(255,255,255,.15);
  -webkit-transition: none;
  -moz-transition: none;
  -o-transition: none;
  transition: none;
}
.navbar-inverse .navbar-search .search-query:-moz-placeholder {
  color: #cccccc;
}
.navbar-inverse .navbar-search .search-query:-ms-input-placeholder {
  color: #cccccc;
}
.navbar-inverse .navbar-search .search-query::-webkit-input-placeholder {
  color: #cccccc;
}
.navbar-inverse .navbar-search .search-query:focus,
.navbar-inverse .navbar-search .search-query.focused {
  padding: 5px 15px;
  color: #666666;
  text-shadow: 0 1px 0 #ffffff;
  background-color: #ffffff;
  border: 0;
  -webkit-box-shadow: 0 0 3px rgba(0, 0, 0, 0.15);
  -moz-box-shadow: 0 0 3px rgba(0, 0, 0, 0.15);
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.15);
  outline: 0;
}
.navbar-inverse .btn-navbar {
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #0e0e0e;
  background-image: -moz-linear-gradient(top, #151515, #040404);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#151515), to(#040404));
  background-image: -webkit-linear-gradient(top, #151515, #040404);
  background-image: -o-linear-gradient(top, #151515, #040404);
  background-image: linear-gradient(to bottom, #151515, #040404);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff151515', endColorstr='#ff040404', GradientType=0);
  border-color: #040404 #040404 #000000;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #040404;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.navbar-inverse .btn-navbar:hover,
.navbar-inverse .btn-navbar:focus,
.navbar-inverse .btn-navbar:active,
.navbar-inverse .btn-navbar.active,
.navbar-inverse .btn-navbar.disabled,
.navbar-inverse .btn-navbar[disabled] {
  color: #ffffff;
  background-color: #040404;
  *background-color: #000000;
}
.navbar-inverse .btn-navbar:active,
.navbar-inverse .btn-navbar.active {
  background-color: #000000 \9;
}
.breadcrumb {
  padding: 8px 15px;
  margin: 0 0 18px;
  list-style: none;
  background-color: #f5f5f5;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
.breadcrumb > li {
  display: inline-block;
  *display: inline;
  /* IE7 inline-block hack */

  *zoom: 1;
  text-shadow: 0 1px 0 #ffffff;
}
.breadcrumb > li > .divider {
  padding: 0 5px;
  color: #ccc;
}
.breadcrumb > .active {
  color: #cccccc;
}
.pagination {
  margin: 18px 0;
}
.pagination ul {
  display: inline-block;
  *display: inline;
  /* IE7 inline-block hack */

  *zoom: 1;
  margin-left: 0;
  margin-bottom: 0;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  -moz-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.pagination ul > li {
  display: inline;
}
.pagination ul > li > a,
.pagination ul > li > span {
  float: left;
  padding: 4px 12px;
  line-height: 18px;
  text-decoration: none;
  background-color: #ffffff;
  border: 1px solid #dddddd;
  border-left-width: 0;
}
.pagination ul > li > a:hover,
.pagination ul > li > a:focus,
.pagination ul > .active > a,
.pagination ul > .active > span {
  background-color: #f5f5f5;
}
.pagination ul > .active > a,
.pagination ul > .active > span {
  color: #cccccc;
  cursor: default;
}
.pagination ul > .disabled > span,
.pagination ul > .disabled > a,
.pagination ul > .disabled > a:hover,
.pagination ul > .disabled > a:focus {
  color: #cccccc;
  background-color: transparent;
  cursor: default;
}
.pagination ul > li:first-child > a,
.pagination ul > li:first-child > span {
  border-left-width: 1px;
  -webkit-border-top-left-radius: 4px;
  -moz-border-radius-topleft: 4px;
  border-top-left-radius: 4px;
  -webkit-border-bottom-left-radius: 4px;
  -moz-border-radius-bottomleft: 4px;
  border-bottom-left-radius: 4px;
}
.pagination ul > li:last-child > a,
.pagination ul > li:last-child > span {
  -webkit-border-top-right-radius: 4px;
  -moz-border-radius-topright: 4px;
  border-top-right-radius: 4px;
  -webkit-border-bottom-right-radius: 4px;
  -moz-border-radius-bottomright: 4px;
  border-bottom-right-radius: 4px;
}
.pagination-centered {
  text-align: center;
}
.pagination-right {
  text-align: right;
}
.pagination-large ul > li > a,
.pagination-large ul > li > span {
  padding: 11px 19px;
  font-size: 20px;
}
.pagination-large ul > li:first-child > a,
.pagination-large ul > li:first-child > span {
  -webkit-border-top-left-radius: 6px;
  -moz-border-radius-topleft: 6px;
  border-top-left-radius: 6px;
  -webkit-border-bottom-left-radius: 6px;
  -moz-border-radius-bottomleft: 6px;
  border-bottom-left-radius: 6px;
}
.pagination-large ul > li:last-child > a,
.pagination-large ul > li:last-child > span {
  -webkit-border-top-right-radius: 6px;
  -moz-border-radius-topright: 6px;
  border-top-right-radius: 6px;
  -webkit-border-bottom-right-radius: 6px;
  -moz-border-radius-bottomright: 6px;
  border-bottom-right-radius: 6px;
}
.pagination-mini ul > li:first-child > a,
.pagination-small ul > li:first-child > a,
.pagination-mini ul > li:first-child > span,
.pagination-small ul > li:first-child > span {
  -webkit-border-top-left-radius: 3px;
  -moz-border-radius-topleft: 3px;
  border-top-left-radius: 3px;
  -webkit-border-bottom-left-radius: 3px;
  -moz-border-radius-bottomleft: 3px;
  border-bottom-left-radius: 3px;
}
.pagination-mini ul > li:last-child > a,
.pagination-small ul > li:last-child > a,
.pagination-mini ul > li:last-child > span,
.pagination-small ul > li:last-child > span {
  -webkit-border-top-right-radius: 3px;
  -moz-border-radius-topright: 3px;
  border-top-right-radius: 3px;
  -webkit-border-bottom-right-radius: 3px;
  -moz-border-radius-bottomright: 3px;
  border-bottom-right-radius: 3px;
}
.pagination-small ul > li > a,
.pagination-small ul > li > span {
  padding: 2px 10px;
  font-size: 13.6px;
}
.pagination-mini ul > li > a,
.pagination-mini ul > li > span {
  padding: 0 6px;
  font-size: 12px;
}
.pager {
  margin: 18px 0;
  list-style: none;
  text-align: center;
  *zoom: 1;
}
.pager:before,
.pager:after {
  display: table;
  content: "";
  line-height: 0;
}
.pager:after {
  clear: both;
}
.pager:before,
.pager:after {
  display: table;
  content: "";
  line-height: 0;
}
.pager:after {
  clear: both;
}
.pager li {
  display: inline;
}
.pager li > a,
.pager li > span {
  display: inline-block;
  padding: 5px 14px;
  background-color: #fff;
  border: 1px solid #ddd;
  -webkit-border-radius: 15px;
  -moz-border-radius: 15px;
  border-radius: 15px;
}
.pager li > a:hover,
.pager li > a:focus {
  text-decoration: none;
  background-color: #f5f5f5;
}
.pager .next > a,
.pager .next > span {
  float: right;
}
.pager .previous > a,
.pager .previous > span {
  float: left;
}
.pager .disabled > a,
.pager .disabled > a:hover,
.pager .disabled > a:focus,
.pager .disabled > span {
  color: #cccccc;
  background-color: #fff;
  cursor: default;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1040;
  background-color: #000000;
}
.modal-backdrop.fade {
  opacity: 0;
}
.modal-backdrop,
.modal-backdrop.fade.in {
  opacity: 0.8;
  filter: alpha(opacity=80);
}
.modal {
  position: fixed;
  top: 10%;
  left: 50%;
  z-index: 1050;
  width: 560px;
  margin-left: -280px;
  background-color: #ffffff;
  border: 1px solid #999;
  border: 1px solid rgba(0, 0, 0, 0.3);
  *border: 1px solid #999;
  /* IE6-7 */

  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
  -webkit-box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
  -webkit-background-clip: padding-box;
  -moz-background-clip: padding-box;
  background-clip: padding-box;
  outline: none;
}
.modal.fade {
  -webkit-transition: opacity .3s linear, top .3s ease-out;
  -moz-transition: opacity .3s linear, top .3s ease-out;
  -o-transition: opacity .3s linear, top .3s ease-out;
  transition: opacity .3s linear, top .3s ease-out;
  top: -25%;
}
.modal.fade.in {
  top: 10%;
}
.modal-header {
  padding: 9px 15px;
  border-bottom: 1px solid #eee;
}
.modal-header .close {
  margin-top: 2px;
}
.modal-header h3 {
  margin: 0;
  line-height: 30px;
}
.modal-body {
  position: relative;
  overflow-y: auto;
  max-height: 400px;
  padding: 15px;
}
.modal-form {
  margin-bottom: 0;
}
.modal-footer {
  padding: 14px 15px 15px;
  margin-bottom: 0;
  text-align: right;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
  -webkit-border-radius: 0 0 6px 6px;
  -moz-border-radius: 0 0 6px 6px;
  border-radius: 0 0 6px 6px;
  -webkit-box-shadow: inset 0 1px 0 #ffffff;
  -moz-box-shadow: inset 0 1px 0 #ffffff;
  box-shadow: inset 0 1px 0 #ffffff;
  *zoom: 1;
}
.modal-footer:before,
.modal-footer:after {
  display: table;
  content: "";
  line-height: 0;
}
.modal-footer:after {
  clear: both;
}
.modal-footer:before,
.modal-footer:after {
  display: table;
  content: "";
  line-height: 0;
}
.modal-footer:after {
  clear: both;
}
.modal-footer .btn + .btn {
  margin-left: 5px;
  margin-bottom: 0;
}
.modal-footer .btn-group .btn + .btn {
  margin-left: -1px;
}
.modal-footer .btn-block + .btn-block {
  margin-left: 0;
}
.tooltip {
  position: absolute;
  z-index: 1030;
  display: block;
  visibility: visible;
  font-size: 11px;
  line-height: 1.4;
  opacity: 0;
  filter: alpha(opacity=0);
}
.tooltip.in {
  opacity: 0.8;
  filter: alpha(opacity=80);
}
.tooltip.top {
  margin-top: -3px;
  padding: 5px 0;
}
.tooltip.right {
  margin-left: 3px;
  padding: 0 5px;
}
.tooltip.bottom {
  margin-top: 3px;
  padding: 5px 0;
}
.tooltip.left {
  margin-left: -3px;
  padding: 0 5px;
}
.tooltip-inner {
  max-width: 200px;
  padding: 8px;
  color: #ffffff;
  text-align: center;
  text-decoration: none;
  background-color: #000000;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
}
.tooltip.top .tooltip-arrow {
  bottom: 0;
  left: 50%;
  margin-left: -5px;
  border-width: 5px 5px 0;
  border-top-color: #000000;
}
.tooltip.right .tooltip-arrow {
  top: 50%;
  left: 0;
  margin-top: -5px;
  border-width: 5px 5px 5px 0;
  border-right-color: #000000;
}
.tooltip.left .tooltip-arrow {
  top: 50%;
  right: 0;
  margin-top: -5px;
  border-width: 5px 0 5px 5px;
  border-left-color: #000000;
}
.tooltip.bottom .tooltip-arrow {
  top: 0;
  left: 50%;
  margin-left: -5px;
  border-width: 0 5px 5px;
  border-bottom-color: #000000;
}
.popover {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1010;
  display: none;
  max-width: 276px;
  padding: 1px;
  text-align: left;
  background-color: #ffffff;
  -webkit-background-clip: padding-box;
  -moz-background-clip: padding;
  background-clip: padding-box;
  border: 1px solid #ccc;
  border: 1px solid rgba(0, 0, 0, 0.2);
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  -moz-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  white-space: normal;
}
.popover.top {
  margin-top: -10px;
}
.popover.right {
  margin-left: 10px;
}
.popover.bottom {
  margin-top: 10px;
}
.popover.left {
  margin-left: -10px;
}
.popover-title {
  margin: 0;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: normal;
  line-height: 18px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #ebebeb;
  -webkit-border-radius: 5px 5px 0 0;
  -moz-border-radius: 5px 5px 0 0;
  border-radius: 5px 5px 0 0;
}
.popover-title:empty {
  display: none;
}
.popover-content {
  padding: 9px 14px;
}
.popover .arrow,
.popover .arrow:after {
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
}
.popover .arrow {
  border-width: 11px;
}
.popover .arrow:after {
  border-width: 10px;
  content: "";
}
.popover.top .arrow {
  left: 50%;
  margin-left: -11px;
  border-bottom-width: 0;
  border-top-color: #999;
  border-top-color: rgba(0, 0, 0, 0.25);
  bottom: -11px;
}
.popover.top .arrow:after {
  bottom: 1px;
  margin-left: -10px;
  border-bottom-width: 0;
  border-top-color: #ffffff;
}
.popover.right .arrow {
  top: 50%;
  left: -11px;
  margin-top: -11px;
  border-left-width: 0;
  border-right-color: #999;
  border-right-color: rgba(0, 0, 0, 0.25);
}
.popover.right .arrow:after {
  left: 1px;
  bottom: -10px;
  border-left-width: 0;
  border-right-color: #ffffff;
}
.popover.bottom .arrow {
  left: 50%;
  margin-left: -11px;
  border-top-width: 0;
  border-bottom-color: #999;
  border-bottom-color: rgba(0, 0, 0, 0.25);
  top: -11px;
}
.popover.bottom .arrow:after {
  top: 1px;
  margin-left: -10px;
  border-top-width: 0;
  border-bottom-color: #ffffff;
}
.popover.left .arrow {
  top: 50%;
  right: -11px;
  margin-top: -11px;
  border-right-width: 0;
  border-left-color: #999;
  border-left-color: rgba(0, 0, 0, 0.25);
}
.popover.left .arrow:after {
  right: 1px;
  border-right-width: 0;
  border-left-color: #ffffff;
  bottom: -10px;
}
.thumbnails {
  margin-left: -20px;
  list-style: none;
  *zoom: 1;
}
.thumbnails:before,
.thumbnails:after {
  display: table;
  content: "";
  line-height: 0;
}
.thumbnails:after {
  clear: both;
}
.thumbnails:before,
.thumbnails:after {
  display: table;
  content: "";
  line-height: 0;
}
.thumbnails:after {
  clear: both;
}
.row-fluid .thumbnails {
  margin-left: 0;
}
.thumbnails > li {
  float: left;
  margin-bottom: 18px;
  margin-left: 20px;
}
.thumbnail {
  display: block;
  padding: 4px;
  line-height: 18px;
  border: 1px solid #ddd;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.055);
  -moz-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.055);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.055);
  -webkit-transition: all 0.2s ease-in-out;
  -moz-transition: all 0.2s ease-in-out;
  -o-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
}
a.thumbnail:hover,
a.thumbnail:focus {
  border-color: #4380b8;
  -webkit-box-shadow: 0 1px 4px rgba(0, 105, 214, 0.25);
  -moz-box-shadow: 0 1px 4px rgba(0, 105, 214, 0.25);
  box-shadow: 0 1px 4px rgba(0, 105, 214, 0.25);
}
.thumbnail > img {
  display: block;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}
.thumbnail .caption {
  padding: 9px;
  color: #999999;
}
.media,
.media-body {
  overflow: hidden;
  *overflow: visible;
  zoom: 1;
}
.media,
.media .media {
  margin-top: 15px;
}
.media:first-child {
  margin-top: 0;
}
.media-object {
  display: block;
}
.media-heading {
  margin: 0 0 5px;
}
.media > .pull-left {
  margin-right: 10px;
}
.media > .pull-right {
  margin-left: 10px;
}
.media-list {
  margin-left: 0;
  list-style: none;
}
.label,
.badge {
  display: inline-block;
  padding: 2px 4px;
  font-size: 13.536px;
  font-weight: bold;
  line-height: 14px;
  color: #ffffff;
  vertical-align: baseline;
  white-space: nowrap;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #cccccc;
}
.label {
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}
.badge {
  padding-left: 9px;
  padding-right: 9px;
  -webkit-border-radius: 9px;
  -moz-border-radius: 9px;
  border-radius: 9px;
}
.label:empty,
.badge:empty {
  display: none;
}
a.label:hover,
a.label:focus,
a.badge:hover,
a.badge:focus {
  color: #ffffff;
  text-decoration: none;
  cursor: pointer;
}
.label-important,
.badge-important {
  background-color: #b94a48;
}
.label-important[href],
.badge-important[href] {
  background-color: #953b39;
}
.label-warning,
.badge-warning {
  background-color: #ffcc00;
}
.label-warning[href],
.badge-warning[href] {
  background-color: #cca300;
}
.label-success,
.badge-success {
  background-color: #468847;
}
.label-success[href],
.badge-success[href] {
  background-color: #356635;
}
.label-info,
.badge-info {
  background-color: #3a87ad;
}
.label-info[href],
.badge-info[href] {
  background-color: #2d6987;
}
.label-inverse,
.badge-inverse {
  background-color: #666666;
}
.label-inverse[href],
.badge-inverse[href] {
  background-color: #4d4d4d;
}
.btn .label,
.btn .badge {
  position: relative;
  top: -1px;
}
.btn-mini .label,
.btn-mini .badge {
  top: 0;
}
@-webkit-keyframes progress-bar-stripes {
  from {
    background-position: 40px 0;
  }
  to {
    background-position: 0 0;
  }
}
@-moz-keyframes progress-bar-stripes {
  from {
    background-position: 40px 0;
  }
  to {
    background-position: 0 0;
  }
}
@-ms-keyframes progress-bar-stripes {
  from {
    background-position: 40px 0;
  }
  to {
    background-position: 0 0;
  }
}
@-o-keyframes progress-bar-stripes {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 40px 0;
  }
}
@keyframes progress-bar-stripes {
  from {
    background-position: 40px 0;
  }
  to {
    background-position: 0 0;
  }
}
.progress {
  overflow: hidden;
  height: 18px;
  margin-bottom: 18px;
  background-color: #f7f7f7;
  background-image: -moz-linear-gradient(top, #f5f5f5, #f9f9f9);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f5f5f5), to(#f9f9f9));
  background-image: -webkit-linear-gradient(top, #f5f5f5, #f9f9f9);
  background-image: -o-linear-gradient(top, #f5f5f5, #f9f9f9);
  background-image: linear-gradient(to bottom, #f5f5f5, #f9f9f9);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#fff5f5f5', endColorstr='#fff9f9f9', GradientType=0);
  -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  -moz-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
.progress .bar {
  width: 0%;
  height: 100%;
  color: #ffffff;
  float: left;
  font-size: 12px;
  text-align: center;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #0e90d2;
  background-image: -moz-linear-gradient(top, #149bdf, #0480be);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#149bdf), to(#0480be));
  background-image: -webkit-linear-gradient(top, #149bdf, #0480be);
  background-image: -o-linear-gradient(top, #149bdf, #0480be);
  background-image: linear-gradient(to bottom, #149bdf, #0480be);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff149bdf', endColorstr='#ff0480be', GradientType=0);
  -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  -moz-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-transition: width 0.6s ease;
  -moz-transition: width 0.6s ease;
  -o-transition: width 0.6s ease;
  transition: width 0.6s ease;
}
.progress .bar + .bar {
  -webkit-box-shadow: inset 1px 0 0 rgba(0,0,0,.15), inset 0 -1px 0 rgba(0,0,0,.15);
  -moz-box-shadow: inset 1px 0 0 rgba(0,0,0,.15), inset 0 -1px 0 rgba(0,0,0,.15);
  box-shadow: inset 1px 0 0 rgba(0,0,0,.15), inset 0 -1px 0 rgba(0,0,0,.15);
}
.progress-striped .bar {
  background-color: #149bdf;
  background-image: -webkit-gradient(linear, 0 100%, 100% 0, color-stop(0.25, rgba(255, 255, 255, 0.15)), color-stop(0.25, transparent), color-stop(0.5, transparent), color-stop(0.5, rgba(255, 255, 255, 0.15)), color-stop(0.75, rgba(255, 255, 255, 0.15)), color-stop(0.75, transparent), to(transparent));
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -moz-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  -webkit-background-size: 40px 40px;
  -moz-background-size: 40px 40px;
  -o-background-size: 40px 40px;
  background-size: 40px 40px;
}
.progress.active .bar {
  -webkit-animation: progress-bar-stripes 2s linear infinite;
  -moz-animation: progress-bar-stripes 2s linear infinite;
  -ms-animation: progress-bar-stripes 2s linear infinite;
  -o-animation: progress-bar-stripes 2s linear infinite;
  animation: progress-bar-stripes 2s linear infinite;
}
.progress-danger .bar,
.progress .bar-danger {
  background-color: #dd514c;
  background-image: -moz-linear-gradient(top, #ee5f5b, #c43c35);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ee5f5b), to(#c43c35));
  background-image: -webkit-linear-gradient(top, #ee5f5b, #c43c35);
  background-image: -o-linear-gradient(top, #ee5f5b, #c43c35);
  background-image: linear-gradient(to bottom, #ee5f5b, #c43c35);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffee5f5b', endColorstr='#ffc43c35', GradientType=0);
}
.progress-danger.progress-striped .bar,
.progress-striped .bar-danger {
  background-color: #ee5f5b;
  background-image: -webkit-gradient(linear, 0 100%, 100% 0, color-stop(0.25, rgba(255, 255, 255, 0.15)), color-stop(0.25, transparent), color-stop(0.5, transparent), color-stop(0.5, rgba(255, 255, 255, 0.15)), color-stop(0.75, rgba(255, 255, 255, 0.15)), color-stop(0.75, transparent), to(transparent));
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -moz-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
}
.progress-success .bar,
.progress .bar-success {
  background-color: #5eb95e;
  background-image: -moz-linear-gradient(top, #62c462, #57a957);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#62c462), to(#57a957));
  background-image: -webkit-linear-gradient(top, #62c462, #57a957);
  background-image: -o-linear-gradient(top, #62c462, #57a957);
  background-image: linear-gradient(to bottom, #62c462, #57a957);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff62c462', endColorstr='#ff57a957', GradientType=0);
}
.progress-success.progress-striped .bar,
.progress-striped .bar-success {
  background-color: #62c462;
  background-image: -webkit-gradient(linear, 0 100%, 100% 0, color-stop(0.25, rgba(255, 255, 255, 0.15)), color-stop(0.25, transparent), color-stop(0.5, transparent), color-stop(0.5, rgba(255, 255, 255, 0.15)), color-stop(0.75, rgba(255, 255, 255, 0.15)), color-stop(0.75, transparent), to(transparent));
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -moz-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
}
.progress-info .bar,
.progress .bar-info {
  background-color: #4bb1cf;
  background-image: -moz-linear-gradient(top, #5bc0de, #339bb9);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#5bc0de), to(#339bb9));
  background-image: -webkit-linear-gradient(top, #5bc0de, #339bb9);
  background-image: -o-linear-gradient(top, #5bc0de, #339bb9);
  background-image: linear-gradient(to bottom, #5bc0de, #339bb9);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff5bc0de', endColorstr='#ff339bb9', GradientType=0);
}
.progress-info.progress-striped .bar,
.progress-striped .bar-info {
  background-color: #5bc0de;
  background-image: -webkit-gradient(linear, 0 100%, 100% 0, color-stop(0.25, rgba(255, 255, 255, 0.15)), color-stop(0.25, transparent), color-stop(0.5, transparent), color-stop(0.5, rgba(255, 255, 255, 0.15)), color-stop(0.75, rgba(255, 255, 255, 0.15)), color-stop(0.75, transparent), to(transparent));
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -moz-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
}
.progress-warning .bar,
.progress .bar-warning {
  background-color: #ffd52e;
  background-image: -moz-linear-gradient(top, #ffdb4d, #ffcc00);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffdb4d), to(#ffcc00));
  background-image: -webkit-linear-gradient(top, #ffdb4d, #ffcc00);
  background-image: -o-linear-gradient(top, #ffdb4d, #ffcc00);
  background-image: linear-gradient(to bottom, #ffdb4d, #ffcc00);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffdb4d', endColorstr='#ffffcc00', GradientType=0);
}
.progress-warning.progress-striped .bar,
.progress-striped .bar-warning {
  background-color: #ffdb4d;
  background-image: -webkit-gradient(linear, 0 100%, 100% 0, color-stop(0.25, rgba(255, 255, 255, 0.15)), color-stop(0.25, transparent), color-stop(0.5, transparent), color-stop(0.5, rgba(255, 255, 255, 0.15)), color-stop(0.75, rgba(255, 255, 255, 0.15)), color-stop(0.75, transparent), to(transparent));
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -moz-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
}
.accordion {
  margin-bottom: 18px;
}
.accordion-group {
  margin-bottom: 2px;
  border: 1px solid #e5e5e5;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
.accordion-heading {
  border-bottom: 0;
}
.accordion-heading .accordion-toggle {
  display: block;
  padding: 8px 15px;
}
.accordion-toggle {
  cursor: pointer;
}
.accordion-inner {
  padding: 9px 15px;
  border-top: 1px solid #e5e5e5;
}
.carousel {
  position: relative;
  margin-bottom: 18px;
  line-height: 1;
}
.carousel-inner {
  overflow: hidden;
  width: 100%;
  position: relative;
}
.carousel-inner > .item {
  display: none;
  position: relative;
  -webkit-transition: 0.6s ease-in-out left;
  -moz-transition: 0.6s ease-in-out left;
  -o-transition: 0.6s ease-in-out left;
  transition: 0.6s ease-in-out left;
}
.carousel-inner > .item > img,
.carousel-inner > .item > a > img {
  display: block;
  line-height: 1;
}
.carousel-inner > .active,
.carousel-inner > .next,
.carousel-inner > .prev {
  display: block;
}
.carousel-inner > .active {
  left: 0;
}
.carousel-inner > .next,
.carousel-inner > .prev {
  position: absolute;
  top: 0;
  width: 100%;
}
.carousel-inner > .next {
  left: 100%;
}
.carousel-inner > .prev {
  left: -100%;
}
.carousel-inner > .next.left,
.carousel-inner > .prev.right {
  left: 0;
}
.carousel-inner > .active.left {
  left: -100%;
}
.carousel-inner > .active.right {
  left: 100%;
}
.carousel-control {
  position: absolute;
  top: 40%;
  left: 15px;
  width: 40px;
  height: 40px;
  margin-top: -20px;
  font-size: 60px;
  font-weight: 100;
  line-height: 30px;
  color: #ffffff;
  text-align: center;
  background: #333333;
  border: 3px solid #ffffff;
  -webkit-border-radius: 23px;
  -moz-border-radius: 23px;
  border-radius: 23px;
  opacity: 0.5;
  filter: alpha(opacity=50);
}
.carousel-control.right {
  left: auto;
  right: 15px;
}
.carousel-control:hover,
.carousel-control:focus {
  color: #ffffff;
  text-decoration: none;
  opacity: 0.9;
  filter: alpha(opacity=90);
}
.carousel-indicators {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 5;
  margin: 0;
  list-style: none;
}
.carousel-indicators li {
  display: block;
  float: left;
  width: 10px;
  height: 10px;
  margin-left: 5px;
  text-indent: -999px;
  background-color: #ccc;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 5px;
}
.carousel-indicators .active {
  background-color: #fff;
}
.carousel-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 15px;
  background: #666666;
  background: rgba(0, 0, 0, 0.75);
}
.carousel-caption h4,
.carousel-caption p {
  color: #ffffff;
  line-height: 18px;
}
.carousel-caption h4 {
  margin: 0 0 5px;
}
.carousel-caption p {
  margin-bottom: 0;
}
.hero-unit {
  padding: 60px;
  margin-bottom: 30px;
  font-size: 18px;
  font-weight: 200;
  line-height: 27px;
  color: inherit;
  background-color: #ffffff;
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
}
.hero-unit h1 {
  margin-bottom: 0;
  font-size: 60px;
  line-height: 1;
  color: inherit;
  letter-spacing: -1px;
}
.hero-unit li {
  line-height: 27px;
}
.pull-right {
  float: right;
}
.pull-left {
  float: left;
}
.hide {
  display: none;
}
.show {
  display: block;
}
.invisible {
  visibility: hidden;
}
.affix {
  position: fixed;
}
/* old colors
@green:                 #46a546;
@red:                   #F72400;
@yellow:                rgb(255,255,98);
@yellowDark:						darken(@yellow, 25%);
@orange:                #FF6700;
@orangeDark:						#E55B00;
@orange:								#FFCC00;
@orangeDark:
@pink:                  #c3325f;
@purple:                #7a43b6;

@gray:                  #767676;
@grayDarker:            #333;
@grayDark:              #524F45;
@grayLight:             #D8D6D7;
@grayLighter:           #F0F0F0;

@linkColor:             @blue;
@linkColorHover:        darken(@linkColor, 15%);
@linkColorVisited:      #524F45;

*/
/* yellow is the new orange */
form {
  margin-bottom: 0px;
}
.container {
  width: 1000px;
  margin-top: 0px;
}
h1 {
  font-family: "SegoePrint";
  color: #426799;
  margin: 6px;
}
h2 {
  /* font-family: "architects_daughterregular"; */

  font-family: "SegoePrint";
  color: #426799;
  font-size: 16px;
}
h3 {
  font-family: "Helveticaneueltstd-ex";
  font-size: 14px;
}
.icon-check-empty {
  width: 24px !important;
}
/* buttons */
.btn-primary,
.btn-primary:hover {
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #35689e;
  background-image: -moz-linear-gradient(top, #4380b8, #214478);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#4380b8), to(#214478));
  background-image: -webkit-linear-gradient(top, #4380b8, #214478);
  background-image: -o-linear-gradient(top, #4380b8, #214478);
  background-image: linear-gradient(to bottom, #4380b8, #214478);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff4380b8', endColorstr='#ff214478', GradientType=0);
  border-color: #214478 #214478 #10223c;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #214478;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.btn-primary:hover,
.btn-primary:hover:hover,
.btn-primary:focus,
.btn-primary:hover:focus,
.btn-primary:active,
.btn-primary:hover:active,
.btn-primary.active,
.btn-primary:hover.active,
.btn-primary.disabled,
.btn-primary:hover.disabled,
.btn-primary[disabled],
.btn-primary:hover[disabled] {
  color: #ffffff;
  background-color: #214478;
  *background-color: #1b3964;
}
.btn-primary:active,
.btn-primary:hover:active,
.btn-primary.active,
.btn-primary:hover.active {
  background-color: #162d50 \9;
}
.btn-secondary,
.btn-orange,
.btn-secondary:hover,
.btn-orange:hover {
  color: #000000;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #ebbc00;
  background-image: -moz-linear-gradient(top, #ffcc00, #cca300);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffcc00), to(#cca300));
  background-image: -webkit-linear-gradient(top, #ffcc00, #cca300);
  background-image: -o-linear-gradient(top, #ffcc00, #cca300);
  background-image: linear-gradient(to bottom, #ffcc00, #cca300);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffcc00', endColorstr='#ffcca300', GradientType=0);
  border-color: #cca300 #cca300 #806600;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #cca300;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.btn-secondary:hover,
.btn-orange:hover,
.btn-secondary:hover:hover,
.btn-orange:hover:hover,
.btn-secondary:focus,
.btn-orange:focus,
.btn-secondary:hover:focus,
.btn-orange:hover:focus,
.btn-secondary:active,
.btn-orange:active,
.btn-secondary:hover:active,
.btn-orange:hover:active,
.btn-secondary.active,
.btn-orange.active,
.btn-secondary:hover.active,
.btn-orange:hover.active,
.btn-secondary.disabled,
.btn-orange.disabled,
.btn-secondary:hover.disabled,
.btn-orange:hover.disabled,
.btn-secondary[disabled],
.btn-orange[disabled],
.btn-secondary:hover[disabled],
.btn-orange:hover[disabled] {
  color: #000000;
  background-color: #cca300;
  *background-color: #b38f00;
}
.btn-secondary:active,
.btn-orange:active,
.btn-secondary:hover:active,
.btn-orange:hover:active,
.btn-secondary.active,
.btn-orange.active,
.btn-secondary:hover.active,
.btn-orange:hover.active {
  background-color: #997a00 \9;
}
.modal {
  top: 40%;
}
a,
a:hover,
a:focus {
  text-decoration: none;
}
#page-loading-modal {
  width: 400px;
  margin: -250px 0 0 -200px;
}
#page-loading-modal .modal-body p {
  font-style: italic;
}
#page-loading-modal .progress {
  margin-bottom: 0;
}
.pika-single {
  position: inherit;
}
.pika-single * {
  position: inherit;
}
.is-selected .pika-button {
  background: none repeat scroll 0 0 #ffcc00;
  box-shadow: 0 1px 3px #ffcc00 inset;
}
.pika-button:hover {
  background: none repeat scroll 0 0 #4380b8 !important;
}
.clearfix {
  *zoom: 1;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
  line-height: 0;
}
.clearfix:after {
  clear: both;
}
.white {
  color: #ffffff;
}
.black {
  colort: #000000;
}
.green {
  color: #64C832;
}
.red {
  color: red !important;
}
.orange {
  color: #ffcc00;
}
.yellow {
  color: #ffcc00;
}
.blue {
  color: #426799;
}
.arrow {
  border: none;
  background: transparent url('/images/transparent-arrow.png') no-repeat center center;
  width: 112px;
  height: 84px;
  color: #ffcc00;
  text-transform: uppercase;
  text-align: left;
}
.arrow .arrow-text {
  padding: 0px 0 0 15px;
}
.arrow:hover {
  color: #ffffff;
  background-image: url('/images/orange-arrow.png');
}
.dollar-sign {
  font-size: 20px;
  font-weight: bold;
}
.module {
  *zoom: 1;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.05);
  -moz-box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.05);
  box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.05);
  padding: 0px;
  min-height: 20px;
  margin-bottom: 20px;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.module:before,
.module:after {
  display: table;
  content: "";
  line-height: 0;
}
.module:after {
  clear: both;
}
.module:before,
.module:after {
  display: table;
  content: "";
  line-height: 0;
}
.module:after {
  clear: both;
}
.module blockquote {
  border-color: #ddd;
  border-color: rgba(0, 0, 0, 0.15);
}
.module .alert {
  -webkit-border-radius: 0 0 0 0;
  -moz-border-radius: 0 0 0 0;
  border-radius: 0 0 0 0;
}
.module h3 {
  -webkit-border-radius: 4px 4px 0 0;
  -moz-border-radius: 4px 4px 0 0;
  border-radius: 4px 4px 0 0;
  background-color: #8cb2d5;
  padding: 0px 19px;
  border-bottom: thin solid #cccccc;
}
.module h3 i {
  margin-top: 7px;
}
.module .oddRow {
  background-color: #ffffff;
}
#no-event-background {
  background: transparent url('/images/invite-no-event-bg.jpg') no-repeat center center;
  margin: 100px auto 0;
  width: 940px;
  height: 376px;
  position: relative;
}
#no-event-background #no-event-container {
  position: relative;
  top: 35px;
  left: -15px;
  margin: 0 auto;
  width: 500px;
}
#no-event-background #no-event-container h3 {
  text-align: left;
}
#no-event-background #no-event-container .log-in {
  *zoom: 1;
  padding: 20px;
  height: 40px;
  line-height: 20px;
  vertical-align: middle;
}
#no-event-background #no-event-container .log-in:before,
#no-event-background #no-event-container .log-in:after {
  display: table;
  content: "";
  line-height: 0;
}
#no-event-background #no-event-container .log-in:after {
  clear: both;
}
#no-event-background #no-event-container .log-in:before,
#no-event-background #no-event-container .log-in:after {
  display: table;
  content: "";
  line-height: 0;
}
#no-event-background #no-event-container .log-in:after {
  clear: both;
}
#no-event-background #no-event-container .log-in .copy {
  width: 110px;
}
#no-event-background #no-event-container .log-in .login-button {
  width: 200px;
  margin-top: 2px;
}
#no-event-background #no-event-container .log-in .signup {
  width: 110px;
  text-align: center;
}
#no-event-background #no-event-container .log-in .signup a {
  padding: 0;
}
#no-event-background #no-event-container a,
#no-event-background #no-event-container > .architect {
  padding: 10px;
}
#no-event-background #no-event-arrow-text {
  color: #ffffff;
  left: 90px;
  position: absolute;
  text-transform: uppercase;
  top: 68px;
  transform: rotate(6deg);
}
.map-container,
#map-container {
  /* twitter bootstrap screws up google map */

}
.map-container img,
#map-container img {
  max-width: none;
}
a {
  color: #4380b8;
}
a:hover {
  color: #e6b800;
}
a .icon,
button .icon {
  width: 20px;
}
.alert {
  color: #666666;
}
.alert .text.one-line {
  line-height: 38px;
  vertical-align: middle;
}
.alert-warning {
  background-color: #ffcc00;
}
.carousel .carousel-control {
  border: none;
  background: transparent;
}
/*!
 *  Font Awesome 3.1.0
 *  the iconic font designed for Bootstrap
 *  -------------------------------------------------------
 *  The full suite of pictographic icons, examples, and documentation
 *  can be found at: http://fontawesome.io
 *
 *  License
 *  -------------------------------------------------------
 *  - The Font Awesome font is licensed under the SIL Open Font License v1.1 -
 *    http://scripts.sil.org/OFL
 *  - Font Awesome CSS, LESS, and SASS files are licensed under the MIT License -
 *    http://opensource.org/licenses/mit-license.html
 *  - Font Awesome documentation licensed under CC BY 3.0 License -
 *    http://creativecommons.org/licenses/by/3.0/
 *  - Attribution is no longer required in Font Awesome 3.0, but much appreciated:
 *    "Font Awesome by Dave Gandy - http://fontawesome.io"

 *  Contact
 *  -------------------------------------------------------
 *  Email: dave@fontawesome.io
 *  Twitter: http://twitter.com/fortaweso_me
 *  Work: Lead Product Designer @ http://kyruus.com
 */
/* FONT PATH
 * -------------------------- */
@font-face {
  font-family: 'FontAwesome';
  src: url('../font/fontawesome-webfont.eot?v=3.1.0');
  src: url('../font/fontawesome-webfont.eot?#iefix&v=3.1.0') format('embedded-opentype'), url('../font/fontawesome-webfont.woff?v=3.1.0') format('woff'), url('../font/fontawesome-webfont.ttf?v=3.1.0') format('truetype'), url('../font/fontawesome-webfont.svg#fontawesomeregular?v=3.1.0') format('svg');
  font-weight: normal;
  font-style: normal;
}
/* FONT AWESOME CORE
 * -------------------------- */
[class^="icon-"],
[class*=" icon-"] {
  font-family: FontAwesome;
  font-weight: normal;
  font-style: normal;
  text-decoration: inherit;
  -webkit-font-smoothing: antialiased;
  *margin-right: .3em;
}
[class^="icon-"]:before,
[class*=" icon-"]:before {
  text-decoration: inherit;
  display: inline-block;
  speak: none;
}
/* makes the font 33% larger relative to the icon container */
.icon-large:before {
  vertical-align: -10%;
  font-size: 1.3333333333333333em;
}
/* makes sure icons active on rollover in links */
a [class^="icon-"],
a [class*=" icon-"],
a [class^="icon-"]:before,
a [class*=" icon-"]:before {
  display: inline;
}
/* increased font size for icon-large */
[class^="icon-"].icon-fixed-width,
[class*=" icon-"].icon-fixed-width {
  display: inline-block;
  width: 1.2857142857142858em;
  text-align: center;
}
[class^="icon-"].icon-fixed-width.icon-large,
[class*=" icon-"].icon-fixed-width.icon-large {
  width: 1.5714285714285714em;
}
ul.icons-ul {
  list-style-type: none;
  text-indent: -0.7142857142857143em;
  margin-left: 2.142857142857143em;
}
ul.icons-ul > li .icon-li {
  width: 0.7142857142857143em;
  display: inline-block;
  text-align: center;
}
[class^="icon-"].hide,
[class*=" icon-"].hide {
  display: none;
}
.icon-muted {
  color: #eeeeee;
}
.icon-light {
  color: #ffffff;
}
.icon-dark {
  color: #333333;
}
.icon-border {
  border: solid 1px #eeeeee;
  padding: .2em .25em .15em;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}
.icon-2x {
  font-size: 2em;
}
.icon-2x.icon-border {
  border-width: 2px;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
.icon-3x {
  font-size: 3em;
}
.icon-3x.icon-border {
  border-width: 3px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
}
.icon-4x {
  font-size: 4em;
}
.icon-4x.icon-border {
  border-width: 4px;
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
}
.icon-5x {
  font-size: 5em;
}
.icon-5x.icon-border {
  border-width: 5px;
  -webkit-border-radius: 7px;
  -moz-border-radius: 7px;
  border-radius: 7px;
}
.pull-right {
  float: right;
}
.pull-left {
  float: left;
}
[class^="icon-"].pull-left,
[class*=" icon-"].pull-left {
  margin-right: .3em;
}
[class^="icon-"].pull-right,
[class*=" icon-"].pull-right {
  margin-left: .3em;
}
/* BOOTSTRAP SPECIFIC CLASSES
 * -------------------------- */
/* Bootstrap 2.0 sprites.less reset */
[class^="icon-"],
[class*=" icon-"] {
  display: inline;
  width: auto;
  height: auto;
  line-height: normal;
  vertical-align: baseline;
  background-image: none;
  background-position: 0% 0%;
  background-repeat: repeat;
  margin-top: 0;
}
/* more sprites.less reset */
.icon-white,
.nav-pills > .active > a > [class^="icon-"],
.nav-pills > .active > a > [class*=" icon-"],
.nav-list > .active > a > [class^="icon-"],
.nav-list > .active > a > [class*=" icon-"],
.navbar-inverse .nav > .active > a > [class^="icon-"],
.navbar-inverse .nav > .active > a > [class*=" icon-"],
.dropdown-menu > li > a:hover > [class^="icon-"],
.dropdown-menu > li > a:hover > [class*=" icon-"],
.dropdown-menu > .active > a > [class^="icon-"],
.dropdown-menu > .active > a > [class*=" icon-"],
.dropdown-submenu:hover > a > [class^="icon-"],
.dropdown-submenu:hover > a > [class*=" icon-"] {
  background-image: none;
}
/* keeps Bootstrap styles with and without icons the same */
.btn [class^="icon-"].icon-large,
.nav [class^="icon-"].icon-large,
.btn [class*=" icon-"].icon-large,
.nav [class*=" icon-"].icon-large {
  line-height: .9em;
}
.btn [class^="icon-"].icon-spin,
.nav [class^="icon-"].icon-spin,
.btn [class*=" icon-"].icon-spin,
.nav [class*=" icon-"].icon-spin {
  display: inline-block;
}
.nav-tabs [class^="icon-"],
.nav-pills [class^="icon-"],
.nav-tabs [class*=" icon-"],
.nav-pills [class*=" icon-"],
.nav-tabs [class^="icon-"].icon-large,
.nav-pills [class^="icon-"].icon-large,
.nav-tabs [class*=" icon-"].icon-large,
.nav-pills [class*=" icon-"].icon-large {
  line-height: .9em;
}
.btn [class^="icon-"].pull-left.icon-2x,
.btn [class*=" icon-"].pull-left.icon-2x,
.btn [class^="icon-"].pull-right.icon-2x,
.btn [class*=" icon-"].pull-right.icon-2x {
  margin-top: .18em;
}
.btn [class^="icon-"].icon-spin.icon-large,
.btn [class*=" icon-"].icon-spin.icon-large {
  line-height: .8em;
}
.btn.btn-small [class^="icon-"].pull-left.icon-2x,
.btn.btn-small [class*=" icon-"].pull-left.icon-2x,
.btn.btn-small [class^="icon-"].pull-right.icon-2x,
.btn.btn-small [class*=" icon-"].pull-right.icon-2x {
  margin-top: .25em;
}
.btn.btn-large [class^="icon-"],
.btn.btn-large [class*=" icon-"] {
  margin-top: 0;
}
.btn.btn-large [class^="icon-"].pull-left.icon-2x,
.btn.btn-large [class*=" icon-"].pull-left.icon-2x,
.btn.btn-large [class^="icon-"].pull-right.icon-2x,
.btn.btn-large [class*=" icon-"].pull-right.icon-2x {
  margin-top: .05em;
}
.btn.btn-large [class^="icon-"].pull-left.icon-2x,
.btn.btn-large [class*=" icon-"].pull-left.icon-2x {
  margin-right: .2em;
}
.btn.btn-large [class^="icon-"].pull-right.icon-2x,
.btn.btn-large [class*=" icon-"].pull-right.icon-2x {
  margin-left: .2em;
}
/* EXTRAS
 * -------------------------- */
/* Stacked and layered icon */
.icon-stack {
  position: relative;
  display: inline-block;
  width: 2em;
  height: 2em;
  line-height: 2em;
  vertical-align: -35%;
}
.icon-stack [class^="icon-"],
.icon-stack [class*=" icon-"] {
  display: block;
  text-align: center;
  position: absolute;
  width: 100%;
  height: 100%;
  font-size: 1em;
  line-height: inherit;
  *line-height: 2em;
}
.icon-stack .icon-stack-base {
  font-size: 2em;
  *line-height: 1em;
}
/* Animated rotating icon */
.icon-spin {
  display: inline-block;
  -moz-animation: spin 2s infinite linear;
  -o-animation: spin 2s infinite linear;
  -webkit-animation: spin 2s infinite linear;
  animation: spin 2s infinite linear;
}
@-moz-keyframes spin {
  0% {
    -moz-transform: rotate(0deg);
  }
  100% {
    -moz-transform: rotate(359deg);
  }
}
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(359deg);
  }
}
@-o-keyframes spin {
  0% {
    -o-transform: rotate(0deg);
  }
  100% {
    -o-transform: rotate(359deg);
  }
}
@-ms-keyframes spin {
  0% {
    -ms-transform: rotate(0deg);
  }
  100% {
    -ms-transform: rotate(359deg);
  }
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}
/* Icon rotations and mirroring */
.icon-rotate-90:before {
  -webkit-transform: rotate(90deg);
  -moz-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  -o-transform: rotate(90deg);
  transform: rotate(90deg);
  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=1);
}
.icon-rotate-180:before {
  -webkit-transform: rotate(180deg);
  -moz-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  -o-transform: rotate(180deg);
  transform: rotate(180deg);
  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=2);
}
.icon-rotate-270:before {
  -webkit-transform: rotate(270deg);
  -moz-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
  -o-transform: rotate(270deg);
  transform: rotate(270deg);
  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);
}
.icon-flip-horizontal:before {
  -webkit-transform: scale(-1, 1);
  -moz-transform: scale(-1, 1);
  -ms-transform: scale(-1, 1);
  -o-transform: scale(-1, 1);
  transform: scale(-1, 1);
}
.icon-flip-vertical:before {
  -webkit-transform: scale(1, -1);
  -moz-transform: scale(1, -1);
  -ms-transform: scale(1, -1);
  -o-transform: scale(1, -1);
  transform: scale(1, -1);
}
/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen
   readers do not read off random characters that represent icons */
.icon-glass:before {
  content: "\f000";
}
.icon-music:before {
  content: "\f001";
}
.icon-search:before {
  content: "\f002";
}
.icon-envelope:before {
  content: "\f003";
}
.icon-heart:before {
  content: "\f004";
}
.icon-star:before {
  content: "\f005";
}
.icon-star-empty:before {
  content: "\f006";
}
.icon-user:before {
  content: "\f007";
}
.icon-film:before {
  content: "\f008";
}
.icon-th-large:before {
  content: "\f009";
}
.icon-th:before {
  content: "\f00a";
}
.icon-th-list:before {
  content: "\f00b";
}
.icon-ok:before {
  content: "\f00c";
}
.icon-remove:before {
  content: "\f00d";
}
.icon-zoom-in:before {
  content: "\f00e";
}
.icon-zoom-out:before {
  content: "\f010";
}
.icon-off:before {
  content: "\f011";
}
.icon-signal:before {
  content: "\f012";
}
.icon-cog:before {
  content: "\f013";
}
.icon-trash:before {
  content: "\f014";
}
.icon-home:before {
  content: "\f015";
}
.icon-file:before {
  content: "\f016";
}
.icon-time:before {
  content: "\f017";
}
.icon-road:before {
  content: "\f018";
}
.icon-download-alt:before {
  content: "\f019";
}
.icon-download:before {
  content: "\f01a";
}
.icon-upload:before {
  content: "\f01b";
}
.icon-inbox:before {
  content: "\f01c";
}
.icon-play-circle:before {
  content: "\f01d";
}
.icon-repeat:before,
.icon-rotate-right:before {
  content: "\f01e";
}
/* F020 doesn't work in Safari. all shifted one down */
.icon-refresh:before {
  content: "\f021";
}
.icon-list-alt:before {
  content: "\f022";
}
.icon-lock:before {
  content: "\f023";
}
.icon-flag:before {
  content: "\f024";
}
.icon-headphones:before {
  content: "\f025";
}
.icon-volume-off:before {
  content: "\f026";
}
.icon-volume-down:before {
  content: "\f027";
}
.icon-volume-up:before {
  content: "\f028";
}
.icon-qrcode:before {
  content: "\f029";
}
.icon-barcode:before {
  content: "\f02a";
}
.icon-tag:before {
  content: "\f02b";
}
.icon-tags:before {
  content: "\f02c";
}
.icon-book:before {
  content: "\f02d";
}
.icon-bookmark:before {
  content: "\f02e";
}
.icon-print:before {
  content: "\f02f";
}
.icon-camera:before {
  content: "\f030";
}
.icon-font:before {
  content: "\f031";
}
.icon-bold:before {
  content: "\f032";
}
.icon-italic:before {
  content: "\f033";
}
.icon-text-height:before {
  content: "\f034";
}
.icon-text-width:before {
  content: "\f035";
}
.icon-align-left:before {
  content: "\f036";
}
.icon-align-center:before {
  content: "\f037";
}
.icon-align-right:before {
  content: "\f038";
}
.icon-align-justify:before {
  content: "\f039";
}
.icon-list:before {
  content: "\f03a";
}
.icon-indent-left:before {
  content: "\f03b";
}
.icon-indent-right:before {
  content: "\f03c";
}
.icon-facetime-video:before {
  content: "\f03d";
}
.icon-picture:before {
  content: "\f03e";
}
.icon-pencil:before {
  content: "\f040";
}
.icon-map-marker:before {
  content: "\f041";
}
.icon-adjust:before {
  content: "\f042";
}
.icon-tint:before {
  content: "\f043";
}
.icon-edit:before {
  content: "\f044";
}
.icon-share:before {
  content: "\f045";
}
.icon-check:before {
  content: "\f046";
}
.icon-move:before {
  content: "\f047";
}
.icon-step-backward:before {
  content: "\f048";
}
.icon-fast-backward:before {
  content: "\f049";
}
.icon-backward:before {
  content: "\f04a";
}
.icon-play:before {
  content: "\f04b";
}
.icon-pause:before {
  content: "\f04c";
}
.icon-stop:before {
  content: "\f04d";
}
.icon-forward:before {
  content: "\f04e";
}
.icon-fast-forward:before {
  content: "\f050";
}
.icon-step-forward:before {
  content: "\f051";
}
.icon-eject:before {
  content: "\f052";
}
.icon-chevron-left:before {
  content: "\f053";
}
.icon-chevron-right:before {
  content: "\f054";
}
.icon-plus-sign:before {
  content: "\f055";
}
.icon-minus-sign:before {
  content: "\f056";
}
.icon-remove-sign:before {
  content: "\f057";
}
.icon-ok-sign:before {
  content: "\f058";
}
.icon-question-sign:before {
  content: "\f059";
}
.icon-info-sign:before {
  content: "\f05a";
}
.icon-screenshot:before {
  content: "\f05b";
}
.icon-remove-circle:before {
  content: "\f05c";
}
.icon-ok-circle:before {
  content: "\f05d";
}
.icon-ban-circle:before {
  content: "\f05e";
}
.icon-arrow-left:before {
  content: "\f060";
}
.icon-arrow-right:before {
  content: "\f061";
}
.icon-arrow-up:before {
  content: "\f062";
}
.icon-arrow-down:before {
  content: "\f063";
}
.icon-share-alt:before,
.icon-mail-forward:before {
  content: "\f064";
}
.icon-resize-full:before {
  content: "\f065";
}
.icon-resize-small:before {
  content: "\f066";
}
.icon-plus:before {
  content: "\f067";
}
.icon-minus:before {
  content: "\f068";
}
.icon-asterisk:before {
  content: "\f069";
}
.icon-exclamation-sign:before {
  content: "\f06a";
}
.icon-gift:before {
  content: "\f06b";
}
.icon-leaf:before {
  content: "\f06c";
}
.icon-fire:before {
  content: "\f06d";
}
.icon-eye-open:before {
  content: "\f06e";
}
.icon-eye-close:before {
  content: "\f070";
}
.icon-warning-sign:before {
  content: "\f071";
}
.icon-plane:before {
  content: "\f072";
}
.icon-calendar:before {
  content: "\f073";
}
.icon-random:before {
  content: "\f074";
}
.icon-comment:before {
  content: "\f075";
}
.icon-magnet:before {
  content: "\f076";
}
.icon-chevron-up:before {
  content: "\f077";
}
.icon-chevron-down:before {
  content: "\f078";
}
.icon-retweet:before {
  content: "\f079";
}
.icon-shopping-cart:before {
  content: "\f07a";
}
.icon-folder-close:before {
  content: "\f07b";
}
.icon-folder-open:before {
  content: "\f07c";
}
.icon-resize-vertical:before {
  content: "\f07d";
}
.icon-resize-horizontal:before {
  content: "\f07e";
}
.icon-bar-chart:before {
  content: "\f080";
}
.icon-twitter-sign:before {
  content: "\f081";
}
.icon-facebook-sign:before {
  content: "\f082";
}
.icon-camera-retro:before {
  content: "\f083";
}
.icon-key:before {
  content: "\f084";
}
.icon-cogs:before {
  content: "\f085";
}
.icon-comments:before {
  content: "\f086";
}
.icon-thumbs-up:before {
  content: "\f087";
}
.icon-thumbs-down:before {
  content: "\f088";
}
.icon-star-half:before {
  content: "\f089";
}
.icon-heart-empty:before {
  content: "\f08a";
}
.icon-signout:before {
  content: "\f08b";
}
.icon-linkedin-sign:before {
  content: "\f08c";
}
.icon-pushpin:before {
  content: "\f08d";
}
.icon-external-link:before {
  content: "\f08e";
}
.icon-signin:before {
  content: "\f090";
}
.icon-trophy:before {
  content: "\f091";
}
.icon-github-sign:before {
  content: "\f092";
}
.icon-upload-alt:before {
  content: "\f093";
}
.icon-lemon:before {
  content: "\f094";
}
.icon-phone:before {
  content: "\f095";
}
.icon-check-empty:before {
  content: "\f096";
}
.icon-bookmark-empty:before {
  content: "\f097";
}
.icon-phone-sign:before {
  content: "\f098";
}
.icon-twitter:before {
  content: "\f099";
}
.icon-facebook:before {
  content: "\f09a";
}
.icon-github:before {
  content: "\f09b";
}
.icon-unlock:before {
  content: "\f09c";
}
.icon-credit-card:before {
  content: "\f09d";
}
.icon-rss:before {
  content: "\f09e";
}
.icon-hdd:before {
  content: "\f0a0";
}
.icon-bullhorn:before {
  content: "\f0a1";
}
.icon-bell:before {
  content: "\f0a2";
}
.icon-certificate:before {
  content: "\f0a3";
}
.icon-hand-right:before {
  content: "\f0a4";
}
.icon-hand-left:before {
  content: "\f0a5";
}
.icon-hand-up:before {
  content: "\f0a6";
}
.icon-hand-down:before {
  content: "\f0a7";
}
.icon-circle-arrow-left:before {
  content: "\f0a8";
}
.icon-circle-arrow-right:before {
  content: "\f0a9";
}
.icon-circle-arrow-up:before {
  content: "\f0aa";
}
.icon-circle-arrow-down:before {
  content: "\f0ab";
}
.icon-globe:before {
  content: "\f0ac";
}
.icon-wrench:before {
  content: "\f0ad";
}
.icon-tasks:before {
  content: "\f0ae";
}
.icon-filter:before {
  content: "\f0b0";
}
.icon-briefcase:before {
  content: "\f0b1";
}
.icon-fullscreen:before {
  content: "\f0b2";
}
.icon-group:before {
  content: "\f0c0";
}
.icon-link:before {
  content: "\f0c1";
}
.icon-cloud:before {
  content: "\f0c2";
}
.icon-beaker:before {
  content: "\f0c3";
}
.icon-cut:before {
  content: "\f0c4";
}
.icon-copy:before {
  content: "\f0c5";
}
.icon-paper-clip:before {
  content: "\f0c6";
}
.icon-save:before {
  content: "\f0c7";
}
.icon-sign-blank:before {
  content: "\f0c8";
}
.icon-reorder:before {
  content: "\f0c9";
}
.icon-list-ul:before {
  content: "\f0ca";
}
.icon-list-ol:before {
  content: "\f0cb";
}
.icon-strikethrough:before {
  content: "\f0cc";
}
.icon-underline:before {
  content: "\f0cd";
}
.icon-table:before {
  content: "\f0ce";
}
.icon-magic:before {
  content: "\f0d0";
}
.icon-truck:before {
  content: "\f0d1";
}
.icon-pinterest:before {
  content: "\f0d2";
}
.icon-pinterest-sign:before {
  content: "\f0d3";
}
.icon-google-plus-sign:before {
  content: "\f0d4";
}
.icon-google-plus:before {
  content: "\f0d5";
}
.icon-money:before {
  content: "\f0d6";
}
.icon-caret-down:before {
  content: "\f0d7";
}
.icon-caret-up:before {
  content: "\f0d8";
}
.icon-caret-left:before {
  content: "\f0d9";
}
.icon-caret-right:before {
  content: "\f0da";
}
.icon-columns:before {
  content: "\f0db";
}
.icon-sort:before {
  content: "\f0dc";
}
.icon-sort-down:before {
  content: "\f0dd";
}
.icon-sort-up:before {
  content: "\f0de";
}
.icon-envelope-alt:before {
  content: "\f0e0";
}
.icon-linkedin:before {
  content: "\f0e1";
}
.icon-undo:before,
.icon-rotate-left:before {
  content: "\f0e2";
}
.icon-legal:before {
  content: "\f0e3";
}
.icon-dashboard:before {
  content: "\f0e4";
}
.icon-comment-alt:before {
  content: "\f0e5";
}
.icon-comments-alt:before {
  content: "\f0e6";
}
.icon-bolt:before {
  content: "\f0e7";
}
.icon-sitemap:before {
  content: "\f0e8";
}
.icon-umbrella:before {
  content: "\f0e9";
}
.icon-paste:before {
  content: "\f0ea";
}
.icon-lightbulb:before {
  content: "\f0eb";
}
.icon-exchange:before {
  content: "\f0ec";
}
.icon-cloud-download:before {
  content: "\f0ed";
}
.icon-cloud-upload:before {
  content: "\f0ee";
}
.icon-user-md:before {
  content: "\f0f0";
}
.icon-stethoscope:before {
  content: "\f0f1";
}
.icon-suitcase:before {
  content: "\f0f2";
}
.icon-bell-alt:before {
  content: "\f0f3";
}
.icon-coffee:before {
  content: "\f0f4";
}
.icon-food:before {
  content: "\f0f5";
}
.icon-file-alt:before {
  content: "\f0f6";
}
.icon-building:before {
  content: "\f0f7";
}
.icon-hospital:before {
  content: "\f0f8";
}
.icon-ambulance:before {
  content: "\f0f9";
}
.icon-medkit:before {
  content: "\f0fa";
}
.icon-fighter-jet:before {
  content: "\f0fb";
}
.icon-beer:before {
  content: "\f0fc";
}
.icon-h-sign:before {
  content: "\f0fd";
}
.icon-plus-sign-alt:before {
  content: "\f0fe";
}
.icon-double-angle-left:before {
  content: "\f100";
}
.icon-double-angle-right:before {
  content: "\f101";
}
.icon-double-angle-up:before {
  content: "\f102";
}
.icon-double-angle-down:before {
  content: "\f103";
}
.icon-angle-left:before {
  content: "\f104";
}
.icon-angle-right:before {
  content: "\f105";
}
.icon-angle-up:before {
  content: "\f106";
}
.icon-angle-down:before {
  content: "\f107";
}
.icon-desktop:before {
  content: "\f108";
}
.icon-laptop:before {
  content: "\f109";
}
.icon-tablet:before {
  content: "\f10a";
}
.icon-mobile-phone:before {
  content: "\f10b";
}
.icon-circle-blank:before {
  content: "\f10c";
}
.icon-quote-left:before {
  content: "\f10d";
}
.icon-quote-right:before {
  content: "\f10e";
}
.icon-spinner:before {
  content: "\f110";
}
.icon-circle:before {
  content: "\f111";
}
.icon-reply:before,
.icon-mail-reply:before {
  content: "\f112";
}
.icon-folder-close-alt:before {
  content: "\f114";
}
.icon-folder-open-alt:before {
  content: "\f115";
}
.icon-expand-alt:before {
  content: "\f116";
}
.icon-collapse-alt:before {
  content: "\f117";
}
.icon-smile:before {
  content: "\f118";
}
.icon-frown:before {
  content: "\f119";
}
.icon-meh:before {
  content: "\f11a";
}
.icon-gamepad:before {
  content: "\f11b";
}
.icon-keyboard:before {
  content: "\f11c";
}
.icon-flag-alt:before {
  content: "\f11d";
}
.icon-flag-checkered:before {
  content: "\f11e";
}
.icon-terminal:before {
  content: "\f120";
}
.icon-code:before {
  content: "\f121";
}
.icon-reply-all:before {
  content: "\f122";
}
.icon-mail-reply-all:before {
  content: "\f122";
}
.icon-star-half-full:before,
.icon-star-half-empty:before {
  content: "\f123";
}
.icon-location-arrow:before {
  content: "\f124";
}
.icon-crop:before {
  content: "\f125";
}
.icon-code-fork:before {
  content: "\f126";
}
.icon-unlink:before {
  content: "\f127";
}
.icon-question:before {
  content: "\f128";
}
.icon-info:before {
  content: "\f129";
}
.icon-exclamation:before {
  content: "\f12a";
}
.icon-superscript:before {
  content: "\f12b";
}
.icon-subscript:before {
  content: "\f12c";
}
.icon-eraser:before {
  content: "\f12d";
}
.icon-puzzle-piece:before {
  content: "\f12e";
}
.icon-microphone:before {
  content: "\f130";
}
.icon-microphone-off:before {
  content: "\f131";
}
.icon-shield:before {
  content: "\f132";
}
.icon-calendar-empty:before {
  content: "\f133";
}
.icon-fire-extinguisher:before {
  content: "\f134";
}
.icon-rocket:before {
  content: "\f135";
}
.icon-maxcdn:before {
  content: "\f136";
}
.icon-chevron-sign-left:before {
  content: "\f137";
}
.icon-chevron-sign-right:before {
  content: "\f138";
}
.icon-chevron-sign-up:before {
  content: "\f139";
}
.icon-chevron-sign-down:before {
  content: "\f13a";
}
.icon-html5:before {
  content: "\f13b";
}
.icon-css3:before {
  content: "\f13c";
}
.icon-anchor:before {
  content: "\f13d";
}
.icon-unlock-alt:before {
  content: "\f13e";
}
.icon-bullseye:before {
  content: "\f140";
}
.icon-ellipsis-horizontal:before {
  content: "\f141";
}
.icon-ellipsis-vertical:before {
  content: "\f142";
}
.icon-rss-sign:before {
  content: "\f143";
}
.icon-play-sign:before {
  content: "\f144";
}
.icon-ticket:before {
  content: "\f145";
}
.icon-minus-sign-alt:before {
  content: "\f146";
}
.icon-check-minus:before {
  content: "\f147";
}
.icon-level-up:before {
  content: "\f148";
}
.icon-level-down:before {
  content: "\f149";
}
.icon-check-sign:before {
  content: "\f14a";
}
.icon-edit-sign:before {
  content: "\f14b";
}
.icon-external-link-sign:before {
  content: "\f14c";
}
.icon-share-sign:before {
  content: "\f14d";
}
@font-face {
  font-family: 'SegoePrint';
  src: url('/font/segoepr.eot');
  src: url('/font/segoepr.eot?#iefix') format('embedded-opentype'), url('/font/segoepr.woff') format('woff'), url('/font/segoepr.ttf') format('truetype'), url('/font/segoepr.svg#segoepr') format('svg');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'Helveticaneueltstd-ex';
  src: url('/font/helveticaneueltstdex.eot');
  src: url('/font/helveticaneueltstdex.eot?#iefix') format('embedded-opentype'), url('/font/helveticaneueltstdex.woff') format('woff'), url('/font/helveticaneueltstdex.ttf') format('truetype'), url('/font/helveticaneueltstdex.svg#helveticaneueltstdex') format('svg');
  font-weight: normal;
  font-style: normal;
}
.myriad {
  font-family: Myriad Pro, Arial, Helvetica, Tahoma, sans-serif;
}
.arialBlack {
  font-family: Arial Black, Arial, Helvetica, Tahoma, sans-serif;
}
.segoe {
  font-family: "SegoePrint";
}
.helvetica {
  font-family: "Helveticaneueltstd-ex";
}
.calibri {
  font-family: "calibri";
}
h1,
h2,
h3,
h4,
h5,
p,
ul,
ol,
label {
  margin: 0;
  font-weight: normal;
}
h2,
h3 {
  text-transform: uppercase;
}
a:hover {
  text-decoration: none;
}
fieldset {
  border: none;
}
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
dl {
  margin-bottom: 0;
}
dd {
  margin-left: 0;
}
.hidden {
  display: none;
}
.bold {
  font-weight: bold;
}
.seo {
  text-indent: -9999px;
  overflow: hidden;
}
.lowercase {
  text-transform: lowercase;
}
.finePrint,
.small {
  font-size: .7em;
}
.normalSize {
  font-size: 0.5em;
}
.error {
  color: #ffcc00;
}
.tl {
  text-align: left;
}
.tr {
  text-align: right;
}
.tc {
  text-align: center;
}
.tb {
  text-align: block;
}
html {
  overflow-x: hidden;
  height: 100%;
}
body {
  height: 100%;
  overflow-x: hidden;
  font-family: "Calibri", "Helvetica", "Arial";
  font-size: 14px;
}
* {
  outline: none !important;
}
.block {
  display: block;
}
.clearfix:after {
  content: ".";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
.container {
  width: 1024px;
  margin: auto;
  position: relative;
}
#content {
  width: 100%;
  height: 100%;
  position: relative;
  text-align: center;
  margin: 0 auto;
  *zoom: 1;
  overflow-x: hidden;
}
#content:before,
#content:after {
  display: table;
  content: "";
  line-height: 0;
}
#content:after {
  clear: both;
}
#content:before,
#content:after {
  display: table;
  content: "";
  line-height: 0;
}
#content:after {
  clear: both;
}
#content.fixed-height {
  overflow: hidden;
}
#content > ul > li > * {
  position: absolute;
}
#content > ul > li > div {
  background-color: #ffffff;
  left: 100%;
  width: 100%;
  height: 100%;
  margin-top: 56px;
  -webkit-transition-duration: 0.6s;
  -moz-transition-duration: 0.6s;
  -ms-transition-duration: 0.6s;
  -o-transition-duration: 0.6s;
  transition-duration: 0.6s;
}
/* this is so the footer doesn't block scrolling down */
#content > ul > li > div > div {
  /* i took this out for the activity feed on the dashboard...need to find another way to handle the footer blockage */

}
#content > ul > li.animate-in > div {
  left: 0%;
  -webkit-transition-duration: 750ms;
  -moz-transition-duration: 750ms;
  -ms-transition-duration: 750ms;
  -o-transition-duration: 750ms;
  transition-duration: 750ms;
}
#content > ul > li.animate-out > div {
  left: -100%;
  -webkit-transition-duration: 750ms;
  -moz-transition-duration: 750ms;
  -ms-transition-duration: 750ms;
  -o-transition-duration: 750ms;
  transition-duration: 750ms;
}
.hero {
  width: 1024px;
  margin: 60px auto 0;
  *zoom: 1;
}
.hero:before,
.hero:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero:after {
  clear: both;
}
.hero:before,
.hero:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero:after {
  clear: both;
}
.hero .hero-left {
  position: relative;
  float: left;
  width: 400px;
  height: 100%;
}
.hero .hero-left #copy {
  position: absolute;
  -webkit-transform: rotate(-4deg);
  -moz-transform: rotate(-4deg);
  -ms-transform: rotate(-4deg);
  -o-transform: rotate(-4deg);
  transform: rotate(-4deg);
  width: 220px;
  top: 190px;
  left: 60px;
  text-align: center;
  font-size: 16px;
}
.hero .hero-left #cartoon-man {
  background: transparent url('/images/question.png') no-repeat center center;
  height: 164px;
  width: 200px;
  margin: 270px 0 0 50px;
}
.hero .hero-left #dotted-line {
  position: absolute;
  background: transparent url('/images/login-dotted-line.png') no-repeat center center;
  height: 83px;
  width: 616px;
  left: 220px;
  top: 440px;
}
.hero .hero-right {
  position: relative;
  margin-left: 400px;
  width: 560px;
  min-height: 450px;
  background-color: #ffffff;
}
.hero .hero-right form .control-label,
.hero .hero-right form .help-block,
.hero .hero-right form .help-inline {
  color: #cccccc;
}
.hero .hero-right form .checkbox,
.hero .hero-right form .radio,
.hero .hero-right form input,
.hero .hero-right form select,
.hero .hero-right form textarea {
  color: #cccccc;
}
.hero .hero-right form input,
.hero .hero-right form select,
.hero .hero-right form textarea {
  border-color: #999999;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}
.hero .hero-right form input:focus,
.hero .hero-right form select:focus,
.hero .hero-right form textarea:focus {
  border-color: #808080;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #cccccc;
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #cccccc;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #cccccc;
}
.hero .hero-right form .input-prepend .add-on,
.hero .hero-right form .input-append .add-on {
  color: #cccccc;
  background-color: #f5f5f5;
  border-color: #cccccc;
}
.hero .hero-right form > label,
.hero .hero-right form .help-block,
.hero .hero-right form .help-inline {
  color: #cccccc;
}
.hero .hero-right form .checkbox,
.hero .hero-right form .radio,
.hero .hero-right form input,
.hero .hero-right form select,
.hero .hero-right form textarea {
  color: #cccccc;
  border-color: #999999;
}
.hero .hero-right form .checkbox:focus,
.hero .hero-right form .radio:focus,
.hero .hero-right form input:focus,
.hero .hero-right form select:focus,
.hero .hero-right form textarea:focus {
  color: #666666;
  border-color: #cc5200;
  -webkit-box-shadow: 0 0 6px #ffa466;
  -moz-box-shadow: 0 0 6px #ffa466;
  box-shadow: 0 0 6px #ffa466;
}
.hero .hero-right form .input-prepend .add-on,
.hero .hero-right form .input-append .add-on {
  color: #cccccc;
  background-color: #f5f5f5;
  border-color: #cccccc;
}
.hero .hero-right form fieldset {
  background-color: #ffffff;
  border: 2px solid #999999;
  width: 400px;
  margin: 0 auto;
  min-height: 200px;
}
.hero .hero-right form fieldset #error,
.hero .hero-right form fieldset .error {
  height: 30px;
  padding-left: 20px;
}
.hero .hero-right form fieldset .error-text {
  line-height: 30px;
  text-align: left;
  color: #ffcc00;
}
.hero .hero-right form fieldset .control-group {
  *zoom: 1;
  margin: 20px 30px 20px 20px;
}
.hero .hero-right form fieldset .control-group:before,
.hero .hero-right form fieldset .control-group:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero .hero-right form fieldset .control-group:after {
  clear: both;
}
.hero .hero-right form fieldset .control-group:before,
.hero .hero-right form fieldset .control-group:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero .hero-right form fieldset .control-group:after {
  clear: both;
}
.hero .hero-right form fieldset input[type="text"],
.hero .hero-right form fieldset input[type="password"] {
  height: 30px;
  width: 100%;
  margin: 0 auto;
}
.hero .hero-right form .arrow {
  position: absolute;
  top: 410px;
  left: 460px;
  -webkit-transform: rotate(-5deg);
  -moz-transform: rotate(-5deg);
  -ms-transform: rotate(-5deg);
  -o-transform: rotate(-5deg);
  transform: rotate(-5deg);
}
.logo-45 {
  height: 45px;
  width: 177px;
  background: transparent url("/images/wembli-logo-45.png") no-repeat center center;
}
.logo-35 {
  height: 35px;
  width: 138px;
  background: transparent url("/images/wembli-logo-35.png") no-repeat center center;
}
a.logo-35 {
  display: block;
}
.cb_slide_panel {
  background: #ffffff;
  -webkit-box-shadow: inset -2px 2px 6px 0px rgba(0, 0, 0, 0.25);
  -moz-box-shadow: inset -2px 2px 6px 0px rgba(0, 0, 0, 0.25);
  box-shadow: inset -2px 2px 6px 0px rgba(0, 0, 0, 0.25);
}
.cb_slide_panel .wrapper .controls {
  margin: 10px 10px 0 0;
  color: #426799;
}
.cb_slide_panel .log-out,
.cb_slide_panel .sign-up {
  width: 100%;
  text-align: center;
}
.cb_slide_panel .log-out a,
.cb_slide_panel .sign-up a {
  margin: 20px;
  width: 180px;
}
.cb_slide_panel ul {
  padding: 20px 0px;
}
.cb_slide_panel ul li a {
  padding: 10px 20px 10px 40px;
  display: block;
  color: #426799;
  font-size: 22px;
  line-height: 24px;
}
.cb_slide_panel ul li a:hover {
  background-color: #4380b8;
  color: #ffcc00;
}
.cb_slide_panel ul.side-nav li a {
  border-bottom: 2px solid #CCC;
}
.cb_slide_panel ul.links li a {
  display: block;
  padding: 10px 0 10px 40px;
}
header {
  background-color: #ffffff;
  position: fixed;
  z-index: 999;
  width: 100%;
  top: 0;
  left: 0;
  -webkit-box-shadow: 0 1px 30px 0px rgba(0, 0, 0, 0.25);
  -moz-box-shadow: 0 1px 30px 0px rgba(0, 0, 0, 0.25);
  box-shadow: 0 1px 30px 0px rgba(0, 0, 0, 0.25);
}
header .search,
header .login,
header .signup,
header .menu-text {
  font-size: 18px;
  line-height: 13px;
  vertical-align: middle;
  padding: 0 6px;
}
header .left-container {
  display: block;
  margin: 20px;
  width: 177px;
}
header .left-container .icon {
  text-align: right;
}
header .middle-container {
  margin: 20px 0;
}
header .middle-container .signup {
  border-left: 2px solid #4380b8;
}
header .right-container {
  margin: 10px 20px 10px 20px;
}
header .right-container .logo-35,
header .right-container .logo-45 {
  margin: auto;
}
header .right-container .logo-35 h1,
header .right-container .logo-45 h1 {
  text-indent: 1000%;
}
/* below this is the old header */
#header-old {
  position: fixed;
  z-index: 4000;
  top: 0;
  left: 0;
}
#header-old #logo {
  display: block;
  margin: 20px;
  height: 85px;
  width: 200px;
  background: url('/images/layout/wembli-orange-beta-small.png') #ffffff center center no-repeat;
}
/* Stars */
.stars {
  display: inline-block;
  margin-top: -1px;
  margin-left: 5px;
  height: 14px;
  width: 66px;
  overflow: hidden;
  text-indent: -9999px;
}
.stars span {
  display: block;
  margin-top: 1px;
  float: left;
  background-image: url('/images/icons/star-icons-sprite.png');
  height: 13px;
  width: 13px;
}
.stars span.whole-star {
  background-position: 0 0;
}
.stars span.half-star {
  background-position: -14px 0;
}
.stars span.empty-star {
  background-position: -27px 0;
}
#event-list-wrapper {
  margin: 0;
  background: transparent !important;
}
#event-list-wrapper h3 {
  padding: 16px 10px 0px 10px;
}
#event-list-wrapper ul li > * {
  position: static;
}
#event-list-wrapper .no-results {
  text-align: center;
  width: 100%;
}
.dashboard-plan:hover,
.event-wrapper:hover {
  background-color: #6da1b7;
  cursor: pointer;
}
.dashboard-plan,
.event-wrapper {
  *zoom: 1;
  position: relative;
  padding: 10px;
}
.dashboard-plan:before,
.event-wrapper:before,
.dashboard-plan:after,
.event-wrapper:after {
  display: table;
  content: "";
  line-height: 0;
}
.dashboard-plan:after,
.event-wrapper:after {
  clear: both;
}
.dashboard-plan:before,
.event-wrapper:before,
.dashboard-plan:after,
.event-wrapper:after {
  display: table;
  content: "";
  line-height: 0;
}
.dashboard-plan:after,
.event-wrapper:after {
  clear: both;
}
.dashboard-plan .event-link,
.event-wrapper .event-link {
  display: block;
}
.dashboard-plan .cta,
.event-wrapper .cta {
  margin: 20px;
  *zoom: 1;
}
.dashboard-plan .cta:before,
.event-wrapper .cta:before,
.dashboard-plan .cta:after,
.event-wrapper .cta:after {
  display: table;
  content: "";
  line-height: 0;
}
.dashboard-plan .cta:after,
.event-wrapper .cta:after {
  clear: both;
}
.dashboard-plan .cta:before,
.event-wrapper .cta:before,
.dashboard-plan .cta:after,
.event-wrapper .cta:after {
  display: table;
  content: "";
  line-height: 0;
}
.dashboard-plan .cta:after,
.event-wrapper .cta:after {
  clear: both;
}
.dashboard-plan .cta .choose-event,
.event-wrapper .cta .choose-event {
  float: right;
  text-align: center;
  color: #ffffff;
  font-size: 16px;
}
.event-data {
  *zoom: 1;
  background-color: #427fb8;
}
.event-data .info {
  color: #cccccc;
}
.event-data:before,
.event-data:after {
  display: table;
  content: "";
  line-height: 0;
}
.event-data:after {
  clear: both;
}
.event-data:before,
.event-data:after {
  display: table;
  content: "";
  line-height: 0;
}
.event-data:after {
  clear: both;
}
.event-data a {
  color: #ffffff;
}
.event-date-box {
  float: left;
  background: transparent url('/images/date-box.png') no-repeat center top;
  width: 75px;
  height: 75px;
  margin: 10px;
}
.event-date-box span {
  display: block;
  text-align: center;
}
.event-date-box .day,
.event-date-box .time {
  margin-top: 2px;
  text-transform: uppercase;
  font-size: 14px;
}
.event-date-box .event-date {
  margin: 6px 0 2px;
  font-size: 18px;
  font-weight: bold;
}
.info {
  text-align: left;
  margin-left: 100px;
  margin-top: 10px;
  *zoom: 1;
}
.info:before,
.info:after {
  display: table;
  content: "";
  line-height: 0;
}
.info:after {
  clear: both;
}
.info:before,
.info:after {
  display: table;
  content: "";
  line-height: 0;
}
.info:after {
  clear: both;
}
.info span {
  display: block;
}
.info .name {
  font-size: 24px;
  line-height: 24px;
}
.info .name,
.info .venue,
.info .location {
  max-width: 420px;
}
#payment-type-modal form {
  margin: 20px;
}
#payment-type-modal form label.radio {
  padding: 0 30px;
}
#payment-type-modal form label.radio input {
  margin-top: 20px;
}
#payment-type-modal form label.radio .option-content {
  padding: 10px;
}
#payment-type-modal form label.radio .option-content h3 {
  color: #6da1b7;
}
#payment-type-modal form label.radio:hover {
  background-color: rgba(66, 127, 184, 0.25);
}
#index-frame section {
  min-height: 500px;
}
#index-frame .section2 {
  text-align: left;
}
#index-frame .section2 .container .tag-line {
  text-transform: uppercase;
  text-shadow: #000 2px 2px 6px;
  font-size: 40px;
  line-height: 48px;
  font-weight: bold;
  text-align: right;
  color: #ffffff;
  position: absolute;
  top: -280px;
  width: 1024px;
  margin: auto;
}
#index-frame .section2 .container .tag-line a {
  margin-top: 100px;
  display: block;
}
#index-frame .section2 .container .tag-line a .meet-wembli {
  width: 530px;
  height: 200px;
  text-align: right;
  font-size: 36px;
  z-index: 7;
  position: relative;
}
#index-frame .section2 .container .click {
  width: 773px;
  height: 276px;
  background: transparent url("/images/index-click2.png") no-repeat left center;
  position: absolute;
  z-index: 6;
  top: -110px;
}
#index-frame .section2 .container .click .click-text {
  -webkit-transform: rotate(-20deg);
  -moz-transform: rotate(-20deg);
  -ms-transform: rotate(-20deg);
  -o-transform: rotate(-20deg);
  transform: rotate(-20deg);
  font-size: 48px;
  position: absolute;
  left: 550px;
  top: 95px;
}
#index-frame .section2 .container .video-container {
  margin: 230px auto 140px;
}
#index-frame .section2 .container .video-container .video,
#index-frame .section2 .container .video-container .video-text {
  padding: 6px;
  width: 500px;
}
#index-frame .section2 .container .video-container .video-text {
  font-size: 22px;
  line-height: 22px;
}
#index-frame .section2 .container .video-container .video-text p {
  margin-top: 20px;
}
#index-frame .section2 .container .video-container .video iframe {
  display: block;
  margin: auto;
}
#index-frame .section3 {
  background-color: #426799;
  min-height: 610px;
}
#index-frame .section3 h1 {
  display: block;
  width: 100%;
  background-color: #000000;
  height: 120px;
  line-height: 120px;
  font-size: 34px;
  color: #ffffff;
  text-align: center;
  vertical-align: middle;
  text-transform: uppercase;
}
#index-frame .section3 .container {
  text-align: left;
}
#index-frame .section3 .container .top-events-arrow {
  margin: auto;
  width: 587px;
  height: 638px;
  background: transparent url("/images/top-events-arrow.png") no-repeat center center;
  position: absolute;
  top: -60px;
  left: 220px;
}
#index-frame .section3 .container .left,
#index-frame .section3 .container .middle,
#index-frame .section3 .container .right {
  min-height: 350px;
  width: 340px;
  position: relative;
  z-index: 2;
}
#index-frame .section3 .container .left h2,
#index-frame .section3 .container .middle h2,
#index-frame .section3 .container .right h2 {
  color: #000000;
  font-size: 20px;
  margin-top: 60px;
}
#index-frame .section3 .container .left .performers,
#index-frame .section3 .container .middle .performers,
#index-frame .section3 .container .right .performers {
  padding: 6px;
  max-width: 250px;
}
#index-frame .section3 .container .left .performer,
#index-frame .section3 .container .middle .performer,
#index-frame .section3 .container .right .performer {
  font-size: 18px;
  text-decoration: underline;
}
#index-frame .section4 {
  background: transparent url("/images/index-car.png") no-repeat left bottom;
}
#index-frame .section4 .container {
  margin-top: 80px;
}
#index-frame .section4 .container .left {
  width: 60%;
}
#index-frame .section4 .container .left .body {
  color: #ffffff;
}
#index-frame .section4 .container .right {
  width: 40%;
}
#index-frame .section4 .container .right .body .row a {
  display: block;
  height: 85px;
  width: 101px;
  margin: 20px 0 0 60px;
}
#index-frame .section4 .container .right .body .row .blog-link {
  background: transparent url("/images/index-social-icons.png") no-repeat 0px 0px;
}
#index-frame .section4 .container .right .body .row .gplus-link {
  background: transparent url("/images/index-social-icons.png") no-repeat 0px -85px;
}
#index-frame .section4 .container .right .body .row .twitter-link {
  background: transparent url("/images/index-social-icons.png") no-repeat 0px -170px;
}
#index-frame .section4 .container .right .body .row .facebook-link {
  background: transparent url("/images/index-social-icons.png") no-repeat 0px -255px;
}
#index-frame .section4 .container .right .body .message {
  margin: 40px;
  text-align: left;
}
#index-frame .section4 .container .right .body .message text {
  font-size: 14px;
}
#index-frame .section5 {
  min-height: 30px;
  border-top: 2px solid #AAA;
  padding: 20px;
  background-color: #cccccc;
}
#index-frame .section5 .container {
  text-align: left;
  color: #000000;
}
#index-frame .section5 .container .footer-social-button {
  margin-left: 20px;
}
#index-frame .section5 .container .links {
  margin-top: 20px;
}
#index-frame .section5 .container .links .footer-link {
  padding: 5px 20px;
  color: #ffffff;
}
#index-frame .section5 .container .links a:hover {
  color: #e6b800;
}
#index-frame .section5 .container .footer-column {
  width: 25%;
}
/* below this is the old homepage */
#content-old #index-frame {
  *zoom: 1;
  background: transparent url('/images/home-background-top.jpg') no-repeat center top;
  min-height: 300px;
}
#content-old #index-frame:before,
#content-old #index-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame:after {
  clear: both;
}
#content-old #index-frame:before,
#content-old #index-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame:after {
  clear: both;
}
#content-old #index-frame .copy {
  position: relative;
  left: 360px;
  width: 510px;
  font-size: 28px;
  color: #426799;
  text-shadow: #000 1px 2px 1px;
  top: 80px;
}
#content-old #index-frame a#start-now {
  background: transparent url('/images/layout/start-now-button.png') no-repeat center center;
  height: 130px;
  width: 202px;
  display: block;
  position: relative;
  left: 840px;
  margin: 40px 0;
}
#content-old #index-frame a#start-now:hover {
  background: transparent url('/images/layout/start-now-button-yellow.png') no-repeat center center;
}
#content-old #index-frame #how-it-works {
  margin: 130px auto 0;
  width: 600px;
  color: #214478;
  font-size: 20px;
  text-align: center;
}
#content-old #index-frame #circles {
  width: 600px;
  *zoom: 1;
  margin: 15px auto;
}
#content-old #index-frame #circles:before,
#content-old #index-frame #circles:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #circles:after {
  clear: both;
}
#content-old #index-frame #circles:before,
#content-old #index-frame #circles:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #circles:after {
  clear: both;
}
#content-old #index-frame #circles .circle {
  *zoom: 1;
  background: transparent url('/images/home-circle.png') no-repeat center center;
  height: 109px;
  width: 140px;
  float: left;
}
#content-old #index-frame #circles .circle:before,
#content-old #index-frame #circles .circle:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #circles .circle:after {
  clear: both;
}
#content-old #index-frame #circles .circle:before,
#content-old #index-frame #circles .circle:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #circles .circle:after {
  clear: both;
}
#content-old #index-frame #circles .circle i {
  position: relative;
  top: 35px;
}
#content-old #index-frame #circles .alligator {
  margin: 40px 22px;
}
#content-old #index-frame #circles .circle-text {
  font-size: 16px;
  color: #214478;
  position: relative;
  top: 70px;
}
#content-old #index-frame #circles #circle-left {
  margin-left: 10px;
}
#content-old #index-frame #circles #circle-middle {
  margin: 0;
}
#content-old #index-frame #circles #circle-right {
  margin-right: 10px;
}
#content-old #index-frame #feeds {
  width: 1024px;
  margin: 60px auto 0;
  *zoom: 1;
}
#content-old #index-frame #feeds:before,
#content-old #index-frame #feeds:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #feeds:after {
  clear: both;
}
#content-old #index-frame #feeds:before,
#content-old #index-frame #feeds:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #feeds:after {
  clear: both;
}
#content-old #index-frame #feeds .feed {
  float: left;
  font-family: "Calibri";
}
#content-old #index-frame #feeds .feed .header {
  text-align: center;
  color: #FFF;
  font-size: 18px;
  line-height: 64px;
  vertical-align: middle;
}
#content-old #index-frame #feeds .feed .body {
  *zoom: 1;
  height: 550px;
  overflow: auto;
  padding-top: 20px;
}
#content-old #index-frame #feeds .feed .body:before,
#content-old #index-frame #feeds .feed .body:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #feeds .feed .body:after {
  clear: both;
}
#content-old #index-frame #feeds .feed .body:before,
#content-old #index-frame #feeds .feed .body:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #feeds .feed .body:after {
  clear: both;
}
#content-old #index-frame #feeds #feed-left .header {
  margin-top: 11px;
  background: transparent url('/images/upcoming-events.png') no-repeat center top;
  height: 83px;
  width: 356px;
  line-height: 94px;
  position: relative;
  z-index: 1;
}
#content-old #index-frame #feeds #feed-left .body {
  background-color: #CCC;
  margin: -30px 1px 0;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .event-date-box {
  background: #ffffff;
  width: 50px;
  height: 50px;
  margin: 10px;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .event-date-box .day,
#content-old #index-frame #feeds #feed-left .body .event-wrapper .event-date-box .time {
  margin-top: 2px;
  text-transform: uppercase;
  font-size: 10px;
  line-height: 14px;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .event-date-box .event-date {
  margin: 0 0 2px;
  font-size: 11px;
  font-weight: bold;
  line-height: 14px;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info {
  margin-left: 20px;
  margin-top: 4px;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .cta {
  margin: 4px;
  *zoom: 1;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .cta:before,
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .cta:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .cta:after {
  clear: both;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .cta:before,
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .cta:after {
  display: table;
  content: "";
  line-height: 0;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .cta:after {
  clear: both;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .cta .choose-event {
  font-size: 14px;
  padding: 2px 5px;
}
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .name,
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .venue,
#content-old #index-frame #feeds #feed-left .body .event-wrapper .info .location {
  width: 190px;
  font-size: 14px;
}
#content-old #index-frame #feeds #feed-middle .header {
  margin: 10px 8px;
  background: transparent url('/images/twitter-feed.png') no-repeat center top;
  height: 84px;
  width: 267px;
  line-height: 95px;
  position: relative;
  z-index: 1;
}
#content-old #index-frame #feeds #feed-middle .body {
  background-color: #333;
  margin: -40px 10px;
  padding: 40px 0px 0px;
  height: 541px;
}
#content-old #index-frame #feeds #feed-right .header {
  margin-top: 23px;
  background: transparent url('/images/recent-posts.png') no-repeat center top;
  height: 70px;
  width: 360px;
  position: relative;
  z-index: 1;
}
#content-old #index-frame #feeds #feed-right .body {
  background-color: #808080;
  margin: -30px 1px 0;
  font-size: 18px;
  height: 551px;
}
#content-old #index-frame #feeds #feed-right .body .quote {
  width: 298px;
  margin: 0px 30px 65px;
  text-align: left;
}
#content-old #index-frame #feeds #feed-right .body .quote i {
  margin: 10px;
}
#content-old #index-frame #feeds #feed-right .body .name {
  font-style: italic;
  margin: 12px;
}
#content-old #index-frame #directory {
  height: 60px;
}
#search-box {
  margin: auto;
  width: 510px;
  height: 70px;
  background: #ffffff url('/images/search-box.png') no-repeat center top;
}
#search-box form#search-form {
  *zoom: 1;
}
#search-box form#search-form:before,
#search-box form#search-form:after {
  display: table;
  content: "";
  line-height: 0;
}
#search-box form#search-form:after {
  clear: both;
}
#search-box form#search-form:before,
#search-box form#search-form:after {
  display: table;
  content: "";
  line-height: 0;
}
#search-box form#search-form:after {
  clear: both;
}
#search-box form#search-form .control-label,
#search-box form#search-form .help-block,
#search-box form#search-form .help-inline {
  color: #cccccc;
}
#search-box form#search-form .checkbox,
#search-box form#search-form .radio,
#search-box form#search-form input,
#search-box form#search-form select,
#search-box form#search-form textarea {
  color: #cccccc;
}
#search-box form#search-form input,
#search-box form#search-form select,
#search-box form#search-form textarea {
  border-color: #999999;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}
#search-box form#search-form input:focus,
#search-box form#search-form select:focus,
#search-box form#search-form textarea:focus {
  border-color: #808080;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #cccccc;
  -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #cccccc;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #cccccc;
}
#search-box form#search-form .input-prepend .add-on,
#search-box form#search-form .input-append .add-on {
  color: #cccccc;
  background-color: #f5f5f5;
  border-color: #cccccc;
}
#search-box form#search-form > label,
#search-box form#search-form .help-block,
#search-box form#search-form .help-inline {
  color: #cccccc;
}
#search-box form#search-form .checkbox,
#search-box form#search-form .radio,
#search-box form#search-form input,
#search-box form#search-form select,
#search-box form#search-form textarea {
  color: #cccccc;
  border-color: #999999;
}
#search-box form#search-form .checkbox:focus,
#search-box form#search-form .radio:focus,
#search-box form#search-form input:focus,
#search-box form#search-form select:focus,
#search-box form#search-form textarea:focus {
  color: #666666;
  border-color: #cc5200;
  -webkit-box-shadow: 0 0 6px #ffa466;
  -moz-box-shadow: 0 0 6px #ffa466;
  box-shadow: 0 0 6px #ffa466;
}
#search-box form#search-form .input-prepend .add-on,
#search-box form#search-form .input-append .add-on {
  color: #cccccc;
  background-color: #f5f5f5;
  border-color: #cccccc;
}
#search-box form#search-form #query {
  height: 40px;
  width: 400px;
  float: left;
  font-size: 18px;
  margin: 10px 0 0 10px;
  padding-left: 10px;
}
#search-box form#search-form button#submit {
  float: left;
  display: block;
  width: 60px;
  height: 48px;
  margin: 10px 0 0 10px;
  background-color: #4380b8;
  border: none;
  -webkit-border-radius: 2px;
  -moz-border-radius: 2px;
  border-radius: 2px;
}
#search-box form#search-form button#submit #magnifying-glass {
  -webkit-transition-duration: 0s;
  -moz-transition-duration: 0s;
  -ms-transition-duration: 0s;
  -o-transition-duration: 0s;
  transition-duration: 0s;
  width: 25px;
  height: 50px;
  margin: auto;
  background: transparent url('/images/magnifying-glass.png') no-repeat 0 center;
}
#search-box form#search-form button#submit:hover #magnifying-glass {
  background: transparent url('/images/magnifying-glass.png') no-repeat -24px center;
}
#content #search-frame {
  background: #ffffff url('/images/home.png') no-repeat 100px 40px;
  *zoom: 1;
}
#content #search-frame:before,
#content #search-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#content #search-frame:after {
  clear: both;
}
#content #search-frame:before,
#content #search-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#content #search-frame:after {
  clear: both;
}
#content #search-frame #left {
  float: left;
  min-width: 400px;
  *zoom: 1;
  position: relative;
  margin-left: 100px;
}
#content #search-frame #left:before,
#content #search-frame #left:after {
  display: table;
  content: "";
  line-height: 0;
}
#content #search-frame #left:after {
  clear: both;
}
#content #search-frame #left:before,
#content #search-frame #left:after {
  display: table;
  content: "";
  line-height: 0;
}
#content #search-frame #left:after {
  clear: both;
}
#content #search-frame #left #copy {
  position: relative;
  -webkit-transform: rotate(-4deg);
  -moz-transform: rotate(-4deg);
  -ms-transform: rotate(-4deg);
  -o-transform: rotate(-4deg);
  transform: rotate(-4deg);
  width: 220px;
  top: 250px;
  left: 60px;
  text-align: center;
  font-size: 16px;
}
#content #search-frame #right {
  margin-left: 350px;
  *zoom: 1;
}
#content #search-frame #right:before,
#content #search-frame #right:after {
  display: table;
  content: "";
  line-height: 0;
}
#content #search-frame #right:after {
  clear: both;
}
#content #search-frame #right:before,
#content #search-frame #right:after {
  display: table;
  content: "";
  line-height: 0;
}
#content #search-frame #right:after {
  clear: both;
}
#content #search-frame #right #search-wrapper {
  background-color: #ffffff;
  float: right;
  position: relative;
  max-width: 800px;
  min-width: 650px;
  padding-right: 20px;
  *zoom: 1;
}
#content #search-frame #right #search-wrapper:before,
#content #search-frame #right #search-wrapper:after {
  display: table;
  content: "";
  line-height: 0;
}
#content #search-frame #right #search-wrapper:after {
  clear: both;
}
#content #search-frame #right #search-wrapper:before,
#content #search-frame #right #search-wrapper:after {
  display: table;
  content: "";
  line-height: 0;
}
#content #search-frame #right #search-wrapper:after {
  clear: both;
}
#content #search-frame #right #search-wrapper #arrow {
  position: absolute;
  top: 0px;
  left: -60px;
  float: left;
  background: transparent url('/images/orange-arrow.png') no-repeat center center;
  width: 112px;
  height: 84px;
  margin-top: 20px;
}
#content #search-frame #right #search-wrapper #arrow .arrow-text {
  color: #ffffff;
  -webkit-transform: rotate(6deg);
  -moz-transform: rotate(6deg);
  -ms-transform: rotate(6deg);
  -o-transform: rotate(6deg);
  transform: rotate(6deg);
  text-transform: uppercase;
  position: absolute;
  top: 21px;
  left: 15px;
}
#content #search-frame #right #search-wrapper #search {
  background-color: #ffffff;
  text-align: left;
  padding-bottom: 90px;
}
#content #search-frame #right #search-wrapper #search #search-results {
  background: #ffffff;
  padding-top: 40px;
  min-height: 600px;
}
#content #search-frame #right #search-wrapper #search #search-results .loading {
  padding: 4px;
  text-align: center;
}
#content #search-frame #right #search-wrapper #search #search-results a#more-events {
  display: block;
  background-color: #cccccc;
  text-align: center;
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
}
#content #search-frame #right #search-wrapper #search #search-results a#more-events i {
  margin: 1px 0px 0px 8px;
}
#tickets-login-modal .modal-body,
#restaurants-login-modal .modal-body {
  padding: 0;
}
#tickets-login-modal .modal-body .top .icon,
#restaurants-login-modal .modal-body .top .icon {
  padding: 10px 20px;
}
#tickets-login-modal .modal-body .top .title,
#restaurants-login-modal .modal-body .top .title {
  padding: 10px;
  font-size: 24px;
  width: 378px;
  line-height: 24px;
}
#tickets-login-modal .modal-body .bottom .qty,
#restaurants-login-modal .modal-body .bottom .qty,
#tickets-login-modal .modal-body .bottom .discount,
#restaurants-login-modal .modal-body .bottom .discount,
#tickets-login-modal .modal-body .bottom .price,
#restaurants-login-modal .modal-body .bottom .price {
  font-weight: bold;
  min-width: 52px;
  background-color: #ffcc00;
  text-align: center;
  padding: 6px;
  line-height: 28px;
  vertical-align: middle;
  height: 70px;
}
#tickets-login-modal .modal-body .bottom .qty .header,
#restaurants-login-modal .modal-body .bottom .qty .header,
#tickets-login-modal .modal-body .bottom .discount .header,
#restaurants-login-modal .modal-body .bottom .discount .header,
#tickets-login-modal .modal-body .bottom .price .header,
#restaurants-login-modal .modal-body .bottom .price .header {
  line-height: 20px;
}
#tickets-login-modal .modal-body .bottom .qty .value,
#restaurants-login-modal .modal-body .bottom .qty .value,
#tickets-login-modal .modal-body .bottom .discount .value,
#restaurants-login-modal .modal-body .bottom .discount .value,
#tickets-login-modal .modal-body .bottom .price .value,
#restaurants-login-modal .modal-body .bottom .price .value {
  height: 30px;
  font-size: 24px;
}
#tickets-login-modal .modal-body .bottom .seats,
#restaurants-login-modal .modal-body .bottom .seats {
  font-size: 20px;
  line-height: 20px;
}
#tickets-login-modal .modal-body .bottom .ticket-info,
#restaurants-login-modal .modal-body .bottom .ticket-info,
#tickets-login-modal .modal-body .bottom .contact,
#restaurants-login-modal .modal-body .bottom .contact {
  padding: 0 10px;
}
#tickets-login-modal .modal-body .bottom .ticket-info .seats,
#restaurants-login-modal .modal-body .bottom .ticket-info .seats,
#tickets-login-modal .modal-body .bottom .contact .seats,
#restaurants-login-modal .modal-body .bottom .contact .seats,
#tickets-login-modal .modal-body .bottom .ticket-info .business,
#restaurants-login-modal .modal-body .bottom .ticket-info .business,
#tickets-login-modal .modal-body .bottom .contact .business,
#restaurants-login-modal .modal-body .bottom .contact .business {
  max-width: 200px;
}
#tickets-login-modal .modal-body .bottom .ticket-info .seats .name,
#restaurants-login-modal .modal-body .bottom .ticket-info .seats .name,
#tickets-login-modal .modal-body .bottom .contact .seats .name,
#restaurants-login-modal .modal-body .bottom .contact .seats .name,
#tickets-login-modal .modal-body .bottom .ticket-info .business .name,
#restaurants-login-modal .modal-body .bottom .ticket-info .business .name,
#tickets-login-modal .modal-body .bottom .contact .business .name,
#restaurants-login-modal .modal-body .bottom .contact .business .name {
  font-weight: bold;
}
#tickets-login-modal .modal-body .bottom .controls,
#restaurants-login-modal .modal-body .bottom .controls {
  margin: 0 16px;
  text-align: center;
}
#tickets-login-modal .modal-body .bottom .controls .details a,
#restaurants-login-modal .modal-body .bottom .controls .details a,
#tickets-login-modal .modal-body .bottom .controls .details button,
#restaurants-login-modal .modal-body .bottom .controls .details button {
  color: #000;
}
#tickets-login-modal .modal-body .bottom .controls .actions a,
#restaurants-login-modal .modal-body .bottom .controls .actions a,
#tickets-login-modal .modal-body .bottom .controls .actions button,
#restaurants-login-modal .modal-body .bottom .controls .actions button {
  color: #ffffff;
}
#tickets-login-modal .modal-body .bottom .qty,
#restaurants-login-modal .modal-body .bottom .qty,
#tickets-login-modal .modal-body .bottom .discount,
#restaurants-login-modal .modal-body .bottom .discount {
  background-color: #426799;
}
#restaurants-info-modal .modal-body .left {
  width: 150px;
}
#restaurants-info-modal .modal-body .left .discount,
#restaurants-info-modal .modal-body .left .price {
  font-weight: bold;
  min-width: 52px;
  background-color: #ffcc00;
  text-align: center;
  padding: 6px;
  line-height: 28px;
  vertical-align: middle;
  height: 70px;
}
#restaurants-info-modal .modal-body .left .discount .header,
#restaurants-info-modal .modal-body .left .price .header {
  line-height: 20px;
}
#restaurants-info-modal .modal-body .left .discount .value,
#restaurants-info-modal .modal-body .left .price .value {
  height: 30px;
  font-size: 24px;
}
#restaurants-info-modal .modal-body .left .discount {
  background-color: #6da1b7;
}
#restaurants-info-modal .modal-body .right {
  width: 350px;
  padding: 0 10px;
}
#restaurants-info-modal .modal-body .right .details .purchase-by {
  padding: 10px 0;
  font-size: 16px;
}
#restaurants-info-modal .modal-body .right .contact {
  padding: 20px 0;
}
#restaurants-info-modal .modal-body .right .contact .business .name {
  font-size: 16px;
  font-weight: bold;
}
#hotels-frame,
#parking-frame,
#restaurants-frame {
  overflow: hidden;
  *zoom: 1;
}
#hotels-frame:before,
#parking-frame:before,
#restaurants-frame:before,
#hotels-frame:after,
#parking-frame:after,
#restaurants-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#hotels-frame:after,
#parking-frame:after,
#restaurants-frame:after {
  clear: both;
}
#hotels-frame:before,
#parking-frame:before,
#restaurants-frame:before,
#hotels-frame:after,
#parking-frame:after,
#restaurants-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#hotels-frame:after,
#parking-frame:after,
#restaurants-frame:after {
  clear: both;
}
#hotels-frame #map-background,
#parking-frame #map-background,
#restaurants-frame #map-background {
  text-align: center;
  position: absolute;
  height: 100%;
  width: 100%;
}
#hotels-frame #map-background .info-window,
#parking-frame #map-background .info-window,
#restaurants-frame #map-background .info-window {
  height: 100%;
}
#hotels-frame #map-background .info-window h3,
#parking-frame #map-background .info-window h3,
#restaurants-frame #map-background .info-window h3 {
  padding: 0;
  margin: 0;
  line-height: 14px;
  font-size: 12px;
  font-weight: bold;
}
#hotels-frame #map-background #hotels-map-container,
#parking-frame #map-background #hotels-map-container,
#restaurants-frame #map-background #hotels-map-container,
#hotels-frame #map-background #restaurants-map-container,
#parking-frame #map-background #restaurants-map-container,
#restaurants-frame #map-background #restaurants-map-container,
#hotels-frame #map-background #parking-map-container,
#parking-frame #map-background #parking-map-container,
#restaurants-frame #map-background #parking-map-container {
  height: 100%;
  width: 100%;
}
.addons-list {
  position: absolute;
  right: 0;
  width: 32%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  color: #000;
}
.addons-list .continue-controls {
  text-align: center;
  padding: 20px;
  background-color: #427fb8;
}
.addons-list .filter-container,
.addons-list .list-header-container {
  background-color: rgba(153, 153, 153, 0.9);
}
.addons-list .list-container .row {
  background-color: rgba(153, 153, 153, 0.7);
}
.addons-list .filter-container > h3 {
  margin-left: 0.5em;
  margin-top: 2px;
  font-size: 14px;
  font-weight: bold;
}
.addons-list .filter-container {
  *zoom: 1;
  position: relative;
  text-align: left;
}
.addons-list .filter-container:before,
.addons-list .filter-container:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .filter-container:after {
  clear: both;
}
.addons-list .filter-container:before,
.addons-list .filter-container:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .filter-container:after {
  clear: both;
}
.addons-list .filter-container .popover-container {
  margin: 10px 0 0 10px;
}
.addons-list .filter-container .display-popover {
  margin-left: 2px;
  font-size: 18px;
  padding: 0;
  top: 3px;
}
.addons-list .filter-container .qty-filter {
  float: left;
  margin: 10px 10px 5px 25px;
}
.addons-list .filter-container .qty-filter strong {
  margin-right: 4px;
}
.addons-list .filter-container .qty-filter select {
  margin-top: 6px;
  width: 50px;
}
.addons-list .filter-container .price-filter {
  margin: 5px;
  float: right;
  width: 220px;
}
.addons-list .filter-container .price-filter p label {
  float: left;
  font-size: 11px;
  margin: 4px 0 0 15px;
}
.addons-list .filter-container .price-filter p input {
  border: 0;
  color: #426799;
  font-weight: bold;
  background: transparent;
  width: 100px;
  -webkit-box-shadow: 0 0 0 0;
  -moz-box-shadow: 0 0 0 0;
  box-shadow: 0 0 0 0;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
.addons-list .filter-container .price-filter .price-slider {
  width: 200px;
  height: 6px;
}
.addons-list .filter-container .price-filter .price-slider .ui-slider-handle {
  height: 12px;
  width: 12px;
}
.addons-list .list-header-container {
  padding: 10px;
  margin-top: 2px;
  *zoom: 1;
}
.addons-list .list-header-container:before,
.addons-list .list-header-container:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .list-header-container:after {
  clear: both;
}
.addons-list .list-header-container:before,
.addons-list .list-header-container:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .list-header-container:after {
  clear: both;
}
.addons-list .list-header-container h4 {
  font-weight: bold;
  font-size: 16px;
  text-align: left;
  margin: 10px 0;
}
.addons-list .list-header-container a {
  display: block;
  float: left;
  color: #333333;
  font-weight: bold;
  text-decoration: underline;
  text-align: left;
}
.addons-list .list-header-container a:hover {
  color: #000000;
}
.addons-list .list-header-container a.range-header {
  width: 65px;
}
.addons-list .list-header-container a.section-header {
  width: 320px;
}
.addons-list .list-header-container a.qty-header {
  width: 40px;
}
.addons-list .list-header-container a.distance-header {
  width: 65px;
}
.addons-list .list-header-container a.price-header {
  width: 65px;
}
.addons-list .list-header-container .list-header {
  *zoom: 1;
}
.addons-list .list-header-container .list-header:before,
.addons-list .list-header-container .list-header:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .list-header-container .list-header:after {
  clear: both;
}
.addons-list .list-header-container .list-header:before,
.addons-list .list-header-container .list-header:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .list-header-container .list-header:after {
  clear: both;
}
.addons-list .list-header-container .list-header .popover {
  font-weight: normal;
}
.addons-list .list-header-container .list-header .popover-container {
  margin: 10px 0 0 10px;
}
.addons-list .list-container .parking-price {
  margin-top: 6px;
}
.addons-list .list-container .parking-price .actual-price {
  margin-top: 6px;
}
.addons-list .list-container .row:hover {
  background-color: rgba(153, 153, 153, 0.9);
}
.addons-list .list-container .row {
  padding: 0;
  margin: 2px 0 0 0;
  text-align: left;
}
.addons-list .list-container .row .top .icon {
  padding: 10px 0;
  width: 60px;
  text-align: center;
}
.addons-list .list-container .row .top .title {
  padding: 10px;
  font-size: 24px;
  width: 378px;
  line-height: 24px;
}
.addons-list .list-container .row .bottom {
  width: 100%;
}
.addons-list .list-container .row .bottom .qty,
.addons-list .list-container .row .bottom .discount,
.addons-list .list-container .row .bottom .price {
  font-weight: bold;
  min-width: 52px;
  background-color: #ffcc00;
  text-align: center;
  padding: 6px;
  line-height: 28px;
  vertical-align: middle;
  height: 100px;
}
.addons-list .list-container .row .bottom .qty .header,
.addons-list .list-container .row .bottom .discount .header,
.addons-list .list-container .row .bottom .price .header {
  line-height: 20px;
}
.addons-list .list-container .row .bottom .qty .value,
.addons-list .list-container .row .bottom .discount .value,
.addons-list .list-container .row .bottom .price .value {
  height: 30px;
  font-size: 24px;
}
.addons-list .list-container .row .bottom .notes {
  max-width: 198px;
}
.addons-list .list-container .row .bottom .seats {
  font-size: 20px;
  line-height: 20px;
}
.addons-list .list-container .row .bottom .ticket-info,
.addons-list .list-container .row .bottom .contact {
  padding: 0 10px;
}
.addons-list .list-container .row .bottom .ticket-info .seats,
.addons-list .list-container .row .bottom .contact .seats,
.addons-list .list-container .row .bottom .ticket-info .business,
.addons-list .list-container .row .bottom .contact .business {
  max-width: 198px;
}
.addons-list .list-container .row .bottom .ticket-info .seats .name,
.addons-list .list-container .row .bottom .contact .seats .name,
.addons-list .list-container .row .bottom .ticket-info .business .name,
.addons-list .list-container .row .bottom .contact .business .name {
  font-weight: bold;
}
.addons-list .list-container .row .bottom .ticket-info .message,
.addons-list .list-container .row .bottom .contact .message {
  font-size: 10px;
}
.addons-list .list-container .row .bottom .details {
  padding: 10px 0px;
}
.addons-list .list-container .row .bottom .details a,
.addons-list .list-container .row .bottom .details button {
  font-size: 12px;
  color: #000;
}
.addons-list .list-container .row .bottom .actions {
  padding-bottom: 10px;
}
.addons-list .list-container .row .bottom .actions a,
.addons-list .list-container .row .bottom .actions button {
  font-size: 14px;
  color: #ffffff;
}
.addons-list .list-container .row .bottom .controls {
  margin: 0 16px;
  text-align: center;
}
.addons-list .list-container .row .bottom .qty,
.addons-list .list-container .row .bottom .discount {
  background-color: #426799;
}
.addons-list .list-container .row .bottom .qty select {
  width: 50px;
  margin-top: 6px;
}
.addons-list .list-container .row a {
  margin-top: 6px;
}
.addons-list .list-container .row .parking-range {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  width: 65px;
  padding: 18px 0;
}
.addons-list .list-container .row .parking-price {
  background: transparent url('/images/price-box-small.png') no-repeat center center;
  height: 50px;
  width: 50px;
  font-weight: bold;
  font-size: 16px;
  margin: 0 10px;
}
.addons-list .list-container .row .parking-price .actual-price {
  margin-top: 10px;
}
.addons-list .list-container .row .parking-price .each {
  font-size: 10px;
}
.addons-list .list-container .row .parking-info {
  text-align: left;
  font-weight: bold;
  font-size: 14px;
  width: 150px;
  margin-top: 10px;
  *zoom: 1;
}
.addons-list .list-container .row .parking-info:before,
.addons-list .list-container .row .parking-info:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .list-container .row .parking-info:after {
  clear: both;
}
.addons-list .list-container .row .parking-info:before,
.addons-list .list-container .row .parking-info:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .list-container .row .parking-info:after {
  clear: both;
}
.addons-list .list-container .row .parking-available {
  text-align: center;
  font-size: 12px;
  width: 80px;
  padding: 10px 0px;
}
.addons-list .list-container .row .no-reservations-available {
  text-align: center;
  font-size: 12px;
  width: 210px;
  padding: 10px 0px;
}
.addons-list .list-container .row .parking-distance {
  text-align: center;
  font-size: 12px;
  width: 65px;
  padding: 10px 0px;
}
.addons-list .list-container .parking-row > div {
  float: left;
}
.addons-list .dollar-sign {
  font-size: 20px;
  font-weight: bold;
}
.addons-list .price-range > h3 {
  margin-left: 0.5em;
  margin-top: 2px;
  font-size: 20px;
  font-weight: bold;
}
.addons-list .price-range {
  margin-top: 20px;
  text-align: left;
  position: relative;
}
.addons-list .price-range .popover-container {
  margin: 10px 0 0 10px;
}
.addons-list .price-range .display-popover {
  margin-left: 2px;
  font-size: 18px;
  padding: 0;
  top: 3px;
}
.addons-list .price-range .price-range-form {
  *zoom: 1;
  background-color: rgba(204, 204, 204, 0.9);
}
.addons-list .price-range .price-range-form:before,
.addons-list .price-range .price-range-form:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .price-range .price-range-form:after {
  clear: both;
}
.addons-list .price-range .price-range-form:before,
.addons-list .price-range .price-range-form:after {
  display: table;
  content: "";
  line-height: 0;
}
.addons-list .price-range .price-range-form:after {
  clear: both;
}
.addons-list .price-range .price-range-form fieldset label.checkbox {
  margin: 6px;
  padding: 10px;
  color: #666666;
}
.addons-list .price-range .price-range-form fieldset label.checkbox:hover {
  background-color: rgba(66, 127, 184, 0.9);
  color: #ffcc00;
}
.addons-list .price-range .price-range-form a {
  margin: 6px;
}
.addons-list .no-results {
  margin-bottom: 60px;
}
.addons-list .no-results .back-to-search,
.addons-list .no-results .collected-email,
.addons-list .no-results .collect-email {
  background-color: rgba(153, 153, 153, 0.9);
  padding: 20px 40px 80px 40px;
}
.addons-list .no-results .back-to-search p,
.addons-list .no-results .collected-email p,
.addons-list .no-results .collect-email p {
  padding: 20px;
}
.addons-list .no-results .back-to-search #email,
.addons-list .no-results .collected-email #email,
.addons-list .no-results .collect-email #email {
  height: 25px;
  width: 300px;
}
.addons-list .no-results .back-to-search button,
.addons-list .no-results .collected-email button,
.addons-list .no-results .collect-email button {
  font-size: 12px;
  margin: 10px 34px;
}
.addons-list .no-results .back-to-search {
  text-align: left;
}
#no-tickets .modal-body .btn {
  margin: 30px auto;
  width: 130px;
  display: block;
}
#hotels-login-modal .modal-body,
#restaurants-login-modal .modal-body,
#parking-login-modal .modal-body,
#rsvp-login-modal .modal-body,
#tickets-login-modal .modal-body {
  max-height: 450px;
  color: #000000;
}
#hotels-login-modal .not-friend,
#restaurants-login-modal .not-friend,
#parking-login-modal .not-friend,
#rsvp-login-modal .not-friend,
#tickets-login-modal .not-friend {
  text-align: center;
}
#hotels-login-modal form,
#restaurants-login-modal form,
#parking-login-modal form,
#rsvp-login-modal form,
#tickets-login-modal form {
  margin: 20px;
}
#hotels-login-modal form label.radio,
#restaurants-login-modal form label.radio,
#parking-login-modal form label.radio,
#rsvp-login-modal form label.radio,
#tickets-login-modal form label.radio {
  padding: 0 20px;
}
#hotels-login-modal form label.radio input[type=radio],
#restaurants-login-modal form label.radio input[type=radio],
#parking-login-modal form label.radio input[type=radio],
#rsvp-login-modal form label.radio input[type=radio],
#tickets-login-modal form label.radio input[type=radio] {
  margin: 45px 25px 45px 0;
}
#hotels-login-modal form label.radio input#facebook-login,
#restaurants-login-modal form label.radio input#facebook-login,
#parking-login-modal form label.radio input#facebook-login,
#rsvp-login-modal form label.radio input#facebook-login,
#tickets-login-modal form label.radio input#facebook-login {
  visibility: hidden;
}
#hotels-login-modal form label.radio .option-content,
#restaurants-login-modal form label.radio .option-content,
#parking-login-modal form label.radio .option-content,
#rsvp-login-modal form label.radio .option-content,
#tickets-login-modal form label.radio .option-content {
  padding: 10px;
}
#hotels-login-modal form label.radio .option-content h3,
#restaurants-login-modal form label.radio .option-content h3,
#parking-login-modal form label.radio .option-content h3,
#rsvp-login-modal form label.radio .option-content h3,
#tickets-login-modal form label.radio .option-content h3 {
  color: #6da1b7;
}
#hotels-login-modal form label.radio .option-content .first-name,
#restaurants-login-modal form label.radio .option-content .first-name,
#parking-login-modal form label.radio .option-content .first-name,
#rsvp-login-modal form label.radio .option-content .first-name,
#tickets-login-modal form label.radio .option-content .first-name {
  width: 100px;
}
#hotels-login-modal form label.radio .option-content .last-name,
#restaurants-login-modal form label.radio .option-content .last-name,
#parking-login-modal form label.radio .option-content .last-name,
#rsvp-login-modal form label.radio .option-content .last-name,
#tickets-login-modal form label.radio .option-content .last-name {
  margin-left: 10px;
  width: 200px;
}
#hotels-login-modal form label.radio .option-content .password,
#restaurants-login-modal form label.radio .option-content .password,
#parking-login-modal form label.radio .option-content .password,
#rsvp-login-modal form label.radio .option-content .password,
#tickets-login-modal form label.radio .option-content .password,
#hotels-login-modal form label.radio .option-content .email,
#restaurants-login-modal form label.radio .option-content .email,
#parking-login-modal form label.radio .option-content .email,
#rsvp-login-modal form label.radio .option-content .email,
#tickets-login-modal form label.radio .option-content .email {
  width: 320px;
}
#hotels-login-modal form label.radio .option-content .facebook-login,
#restaurants-login-modal form label.radio .option-content .facebook-login,
#parking-login-modal form label.radio .option-content .facebook-login,
#rsvp-login-modal form label.radio .option-content .facebook-login,
#tickets-login-modal form label.radio .option-content .facebook-login {
  width: 400px;
}
#hotels-login-modal form label.radio .option-content .facebook-login #facebook-login-button,
#restaurants-login-modal form label.radio .option-content .facebook-login #facebook-login-button,
#parking-login-modal form label.radio .option-content .facebook-login #facebook-login-button,
#rsvp-login-modal form label.radio .option-content .facebook-login #facebook-login-button,
#tickets-login-modal form label.radio .option-content .facebook-login #facebook-login-button {
  margin: 0 auto;
}
#hotels-login-modal form label.radio.selected,
#restaurants-login-modal form label.radio.selected,
#parking-login-modal form label.radio.selected,
#rsvp-login-modal form label.radio.selected,
#tickets-login-modal form label.radio.selected,
#hotels-login-modal form label.radio:hover,
#restaurants-login-modal form label.radio:hover,
#parking-login-modal form label.radio:hover,
#rsvp-login-modal form label.radio:hover,
#tickets-login-modal form label.radio:hover {
  background-color: rgba(66, 127, 184, 0.25);
}
#hotels-offsite-modal form,
#restaurants-offsite-modal form,
#parking-offsite-modal form,
#tickets-offsite-modal form {
  margin: 20px;
}
#hotels-offsite-modal form label.radio,
#restaurants-offsite-modal form label.radio,
#parking-offsite-modal form label.radio,
#tickets-offsite-modal form label.radio {
  padding: 0 30px;
}
#hotels-offsite-modal form label.radio input[type=radio],
#restaurants-offsite-modal form label.radio input[type=radio],
#parking-offsite-modal form label.radio input[type=radio],
#tickets-offsite-modal form label.radio input[type=radio] {
  margin-top: 20px;
}
#hotels-offsite-modal form label.radio .option-content,
#restaurants-offsite-modal form label.radio .option-content,
#parking-offsite-modal form label.radio .option-content,
#tickets-offsite-modal form label.radio .option-content {
  padding: 10px;
}
#hotels-offsite-modal form label.radio .option-content h3,
#restaurants-offsite-modal form label.radio .option-content h3,
#parking-offsite-modal form label.radio .option-content h3,
#tickets-offsite-modal form label.radio .option-content h3 {
  color: #6da1b7;
}
#hotels-offsite-modal form label.radio.selected,
#restaurants-offsite-modal form label.radio.selected,
#parking-offsite-modal form label.radio.selected,
#tickets-offsite-modal form label.radio.selected,
#hotels-offsite-modal form label.radio:hover,
#restaurants-offsite-modal form label.radio:hover,
#parking-offsite-modal form label.radio:hover,
#tickets-offsite-modal form label.radio:hover {
  background-color: rgba(66, 127, 184, 0.25);
}
#hotels-offsite-modal form #qty,
#restaurants-offsite-modal form #qty,
#parking-offsite-modal form #qty,
#tickets-offsite-modal form #qty {
  width: 20px;
  text-align: center;
  margin: 0 6px;
}
#hotels-offsite-modal form #amount-paid-prepend,
#restaurants-offsite-modal form #amount-paid-prepend,
#parking-offsite-modal form #amount-paid-prepend,
#tickets-offsite-modal form #amount-paid-prepend {
  margin: 0 6px;
}
#hotels-offsite-modal form #amount-paid,
#restaurants-offsite-modal form #amount-paid,
#parking-offsite-modal form #amount-paid,
#tickets-offsite-modal form #amount-paid {
  width: 60px;
  text-align: center;
  margin: 0;
}
.back-to-plan-container {
  text-align: right;
  padding: 20px;
  font-size: 1.2em;
  background-color: rgba(153, 153, 153, 0.9);
}
#tickets-frame {
  overflow: hidden;
  *zoom: 1;
}
#tickets-frame:before,
#tickets-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame:after {
  clear: both;
}
#tickets-frame:before,
#tickets-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame:after {
  clear: both;
}
#tickets-frame section {
  text-align: left;
  padding: 0 20px 20px;
  position: relative;
  z-index: 1;
  margin: auto;
  background-color: #ffffff;
}
#tickets-frame section .header h1 {
  width: 100%;
  padding: 10px 0 4px;
  border-bottom: 6px solid #426799;
  text-transform: uppercase;
  margin: 10px 0;
  font-weight: bold;
}
#tickets-frame section .sub-header {
  font-size: 1.25em;
}
#tickets-frame #map-background {
  position: relative;
  bottom: 0px;
  overflow: hidden;
  text-align: center;
  float: left;
  width: 68%;
  height: 100%;
}
#tickets-frame #map-background .tuMapContainer {
  overflow: visible !important;
}
#tickets-frame #map-background .tuMapControl {
  background-color: #ffffff;
  padding: 6px;
  cursor: pointer;
  -webkit-box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #ffcc00;
  background-image: -moz-linear-gradient(top, #ffcc00, #ffcc00);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffcc00), to(#ffcc00));
  background-image: -webkit-linear-gradient(top, #ffcc00, #ffcc00);
  background-image: -o-linear-gradient(top, #ffcc00, #ffcc00);
  background-image: linear-gradient(to bottom, #ffcc00, #ffcc00);
  background-repeat: repeat-x;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffcc00', endColorstr='#ffffcc00', GradientType=0);
  border-color: #ffcc00 #ffcc00 #b38f00;
  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
  *background-color: #ffcc00;
  /* Darken IE7 buttons by default so they stand out more given they won't have borders */

  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  color: #ffffff;
}
#tickets-frame #map-background .tuMapControl:hover,
#tickets-frame #map-background .tuMapControl:focus,
#tickets-frame #map-background .tuMapControl:active,
#tickets-frame #map-background .tuMapControl.active,
#tickets-frame #map-background .tuMapControl.disabled,
#tickets-frame #map-background .tuMapControl[disabled] {
  color: #ffffff;
  background-color: #ffcc00;
  *background-color: #e6b800;
}
#tickets-frame #map-background .tuMapControl:active,
#tickets-frame #map-background .tuMapControl.active {
  background-color: #cca300 \9;
}
#tickets-frame #map-background .tuMapTooltip {
  background: none repeat scroll 0 0 #FCF1BD;
  border: 1px solid #666666;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  -webkit-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  font-size: 12px;
  padding: 5px;
  left: 0;
}
#tickets-frame #map-background .ZoomControls {
  position: absolute;
  left: 20px;
  top: 0px;
  width: 35px;
  color: #ffffff;
  font-weight: bold;
}
#tickets-frame #map-background .ZoomControls div {
  background-color: #ffcc00;
  /* background-image: url("images/Zoom.png"); */

  background-repeat: no-repeat;
  border: 0 none;
  -webkit-box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  display: block;
  font-size: 14px;
  height: 20px;
  margin: 5px 4px;
  width: 25px;
  float: left;
}
#tickets-frame #map-background #venue-map-container {
  width: 68%;
  height: 100%;
}
#tickets-frame #map-background #groups-container {
  position: absolute;
  bottom: 120px;
  left: 20px;
}
#tickets-frame #tickets-invite-friends {
  margin-top: 100px;
  text-align: left;
}
#tickets-frame #tickets-invite-friends p {
  padding: 6px 50px 6px 0;
}
#tickets-frame #tickets-invite-friends img {
  margin: 10px 0;
}
#tickets-frame #tickets-invite-friends .controls a {
  display: block;
}
#tickets-frame #tickets-invite-friends .controls a.invite-friends-button {
  width: 30%;
  margin: auto;
}
#tickets-frame #tickets-invite-friends .controls a.change-payment-preference {
  width: 50%;
  margin: 0 20px;
  text-align: center;
}
#tickets-frame .price-slider {
  width: 200px;
  height: 6px;
}
#tickets-frame .price-slider .ui-slider-range {
  background-color: #426799;
}
#tickets-frame .price-slider .ui-slider-handle {
  height: 12px;
  width: 12px;
}
#tickets-frame #tickets-off {
  position: absolute;
  right: 0;
  width: 32%;
  overflow-y: auto;
  overflow-x: hidden;
}
#tickets-frame #tickets-off .filter-container,
#tickets-frame #tickets-off .ticket-list-container .ticket-row,
#tickets-frame #tickets-off .ticket-list-header-container {
  background-color: rgba(204, 204, 204, 0.25);
}
#tickets-frame #tickets-off .filter-container > h3 {
  margin-left: 0.5em;
  margin-top: 2px;
  font-size: 14px;
  font-weight: bold;
}
#tickets-frame #tickets-off .filter-container {
  *zoom: 1;
  position: relative;
  text-align: left;
}
#tickets-frame #tickets-off .filter-container:before,
#tickets-frame #tickets-off .filter-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off .filter-container:after {
  clear: both;
}
#tickets-frame #tickets-off .filter-container:before,
#tickets-frame #tickets-off .filter-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off .filter-container:after {
  clear: both;
}
#tickets-frame #tickets-off .filter-container .popover-container {
  margin: 10px 0 0 10px;
}
#tickets-frame #tickets-off .filter-container .display-popover {
  margin-left: 2px;
  font-size: 18px;
  padding: 0;
  top: 3px;
}
#tickets-frame #tickets-off .filter-container .qty-filter {
  float: left;
  margin: 10px 10px 5px 25px;
}
#tickets-frame #tickets-off .filter-container .qty-filter strong {
  margin-right: 4px;
}
#tickets-frame #tickets-off .filter-container .qty-filter select {
  margin-top: 6px;
  width: 50px;
}
#tickets-frame #tickets-off .filter-container .price-filter {
  margin: 5px;
  float: right;
  width: 220px;
}
#tickets-frame #tickets-off .filter-container .price-filter p label {
  float: left;
  font-size: 11px;
  margin: 4px 0 0 15px;
}
#tickets-frame #tickets-off .filter-container .price-filter p input {
  border: 0;
  color: #4380b8;
  font-weight: bold;
  background: transparent;
  width: 100px;
  -webkit-box-shadow: 0 0 0 0;
  -moz-box-shadow: 0 0 0 0;
  box-shadow: 0 0 0 0;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}
#tickets-frame #tickets-off .filter-container .price-filter .price-slider {
  width: 200px;
  height: 6px;
}
#tickets-frame #tickets-off .filter-container .price-filter .price-slider .ui-slider-range {
  background-color: #426799;
}
#tickets-frame #tickets-off .filter-container .price-filter .price-slider .ui-slider-handle {
  height: 12px;
  width: 12px;
}
#tickets-frame #tickets-off .ticket-list-header-container {
  padding: 10px;
  margin-top: 2px;
  *zoom: 1;
}
#tickets-frame #tickets-off .ticket-list-header-container:before,
#tickets-frame #tickets-off .ticket-list-header-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off .ticket-list-header-container:after {
  clear: both;
}
#tickets-frame #tickets-off .ticket-list-header-container:before,
#tickets-frame #tickets-off .ticket-list-header-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off .ticket-list-header-container:after {
  clear: both;
}
#tickets-frame #tickets-off .ticket-list-header-container h4 {
  font-weight: bold;
  font-size: 16px;
  text-align: left;
  margin: 10px 0;
}
#tickets-frame #tickets-off .ticket-list-header-container a {
  display: block;
  float: left;
  color: #333333;
  font-weight: bold;
  text-decoration: underline;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row:hover {
  background-color: rgba(66, 127, 184, 0.25);
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row {
  *zoom: 1;
  padding: 10px;
  margin-top: 2px;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row:before,
#tickets-frame #tickets-off .ticket-list-container .ticket-row:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row:after {
  clear: both;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row:before,
#tickets-frame #tickets-off .ticket-list-container .ticket-row:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row:after {
  clear: both;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row a {
  margin-top: 6px;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-range {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  width: 65px;
  padding: 18px 0;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-price {
  background: transparent url('/images/price-box-small.png') no-repeat center center;
  height: 50px;
  width: 50px;
  font-weight: bold;
  font-size: 16px;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-price .actual-price {
  margin-top: 10px;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-price .each {
  font-size: 10px;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-info {
  text-align: left;
  font-weight: bold;
  font-size: 14px;
  width: 180px;
  margin-top: 10px;
  *zoom: 1;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-info:before,
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-info:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-info:after {
  clear: both;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-info:before,
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-info:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .ticket-info:after {
  clear: both;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .tix-available {
  text-align: center;
  font-size: 12px;
  width: 80px;
  padding: 10px 10px;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .qty-container {
  margin: 6px 0 0 10px;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .qty-container strong {
  padding: 4px;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row .qty-container select {
  width: 50px;
  margin-top: 6px;
}
#tickets-frame #tickets-off .ticket-list-container .ticket-row > div {
  float: left;
}
#tickets-frame #tickets-off #read-only-filters #price-range-form {
  *zoom: 1;
}
#tickets-frame #tickets-off #read-only-filters #price-range-form:before,
#tickets-frame #tickets-off #read-only-filters #price-range-form:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off #read-only-filters #price-range-form:after {
  clear: both;
}
#tickets-frame #tickets-off #read-only-filters #price-range-form:before,
#tickets-frame #tickets-off #read-only-filters #price-range-form:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off #read-only-filters #price-range-form:after {
  clear: both;
}
#tickets-frame #tickets-off #read-only-filters #price-range-form fieldset label.checkbox {
  margin: 6px;
  padding: 10px;
  color: #666666;
}
#tickets-frame #tickets-off #read-only-filters #price-range-form fieldset label.checkbox:hover {
  background-color: rgba(66, 127, 184, 0.25);
  color: #ffcc00;
}
#tickets-frame #tickets-off #read-only-filters #price-range-form a {
  margin: 6px;
}
#tickets-frame #tickets-off #buy-now-filters .h3 {
  margin: 15px 10px 10px 10px;
  float: left;
}
#tickets-frame #tickets-off #read-only-header-container #read-only-header {
  *zoom: 1;
}
#tickets-frame #tickets-off #read-only-header-container #read-only-header:before,
#tickets-frame #tickets-off #read-only-header-container #read-only-header:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off #read-only-header-container #read-only-header:after {
  clear: both;
}
#tickets-frame #tickets-off #read-only-header-container #read-only-header:before,
#tickets-frame #tickets-off #read-only-header-container #read-only-header:after {
  display: table;
  content: "";
  line-height: 0;
}
#tickets-frame #tickets-off #read-only-header-container #read-only-header:after {
  clear: both;
}
#tickets-frame #tickets-off #read-only-header-container .popover {
  font-weight: normal;
}
#tickets-frame #tickets-off #read-only-header-container .popover-container {
  margin: 10px 0 0 10px;
}
#tickets-frame #tickets-off #read-only-header-container a#range-header {
  width: 65px;
}
#tickets-frame #tickets-off #read-only-header-container a#section-header {
  text-align: left;
  width: 180px;
}
#tickets-frame #tickets-off #read-only-header-container a#qty-header {
  width: 100px;
}
#tickets-frame #tickets-off #read-only-header-container a#price-header {
  width: 65px;
}
#tickets-frame #tickets-off #purchased-tickets-header-container a.price-header,
#tickets-frame #tickets-off #add-to-plan-header-container a.price-header,
#tickets-frame #tickets-off #buy-now-header-container a.price-header {
  width: 65px;
}
#tickets-frame #tickets-off #purchased-tickets-header-container a.section-header,
#tickets-frame #tickets-off #add-to-plan-header-container a.section-header,
#tickets-frame #tickets-off #buy-now-header-container a.section-header {
  width: 195px;
  text-align: left;
  margin-left: 5px;
}
#tickets-frame #tickets-off #purchased-tickets-header-container a.qty-header,
#tickets-frame #tickets-off #add-to-plan-header-container a.qty-header,
#tickets-frame #tickets-off #buy-now-header-container a.qty-header {
  width: 100px;
  text-align: left;
}
#tickets-frame #tickets-off #read-only-container-off .ticket-price {
  margin-top: 6px;
}
#tickets-frame #tickets-off #read-only-container-off .ticket-price .actual-price {
  margin-top: 6px;
}
#tickets-frame #tickets-off #read-only-container-off .ticket-row:hover {
  background-color: rgba(204, 204, 204, 0.25);
}
#tickets-frame #tickets-off #purchased-tickets-container .ticket-info,
#tickets-frame #tickets-off #add-to-plan-container .ticket-info,
#tickets-frame #tickets-off #buy-now-container .ticket-info {
  margin-top: 0;
}
#tickets-frame #tickets-off #purchased-tickets-container .ticket-row .ticket-price,
#tickets-frame #tickets-off #add-to-plan-container .ticket-row .ticket-price,
#tickets-frame #tickets-off #buy-now-container .ticket-row .ticket-price {
  margin: 0 10px;
}
/* this applies to login and signup */
/* this is the old facebook login with the image */
a#facebook-login {
  background: transparent url('/images/facebook-login.png') no-repeat center center;
  display: block;
  margin: 30px auto 0;
  height: 82px;
  width: 258px;
  color: white;
  font-size: 14px;
}
a#facebook-login span {
  display: block;
  width: 196px;
  position: relative;
  top: 30px;
  left: 61px;
}
a#facebook-login:hover {
  color: #ffcc00;
}
/* facebook button */
a#facebook-login-button {
  margin: 30px auto 0;
  line-height: 39px;
  vertical-align: middle;
}
#or {
  font-size: 18px;
  padding: 10px;
  width: 40px;
  margin: 10px auto;
}
.hero #login-hero-right {
  *zoom: 1;
}
.hero #login-hero-right:before,
.hero #login-hero-right:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #login-hero-right:after {
  clear: both;
}
.hero #login-hero-right:before,
.hero #login-hero-right:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #login-hero-right:after {
  clear: both;
}
.hero #login-hero-right #login-right #remember-label {
  margin-left: 10px;
}
.hero #login-hero-right #login-right #email-group,
.hero #login-hero-right #login-right #password-group {
  margin-top: 0px;
}
.hero #login-hero-right #login-right #remember-group {
  margin-bottom: 30px;
}
.hero #login-hero-right #login-right #signup-link {
  margin: 20px;
  display: block;
}
.hero #login-hero-right #login-right #check-email {
  text-align: left;
  margin: 100px auto;
  width: 400px;
}
.hero #login-hero-right #login-right #confirm-password-form {
  margin-top: 80px;
}
.hero #login-hero-right #login-right #confirm-password-form button {
  margin-top: 10px;
}
.hero #signup-hero-left #copy {
  top: 215px;
}
.hero #signup-hero-left #cartoon-man {
  margin-top: 320px;
}
.hero #signup-hero-left #dotted-line {
  top: 475px;
  z-index: 2;
}
.hero #signup-hero-right {
  *zoom: 1;
}
.hero #signup-hero-right:before,
.hero #signup-hero-right:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #signup-hero-right:after {
  clear: both;
}
.hero #signup-hero-right:before,
.hero #signup-hero-right:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #signup-hero-right:after {
  clear: both;
}
.hero #signup-hero-right #first-name-group {
  margin-top: 0px;
}
.hero #signup-hero-right #first-name-group input {
  display: inline;
}
.hero #signup-hero-right #first-name-group #first-name {
  width: 130px;
}
.hero #signup-hero-right #first-name-group #last-name {
  margin-left: 4px;
  width: 198px;
}
.hero #signup-hero-right .control-group {
  margin: 20px;
}
.hero #signup-hero-right .control-group #email,
.hero #signup-hero-right .control-group #password,
.hero #signup-hero-right .control-group #password2 {
  width: 346px;
}
.hero #signup-hero-right #login-link {
  margin: 20px;
  display: block;
}
.hero #signup-hero-right .arrow {
  top: 450px;
}
.hero #confirm-hero-left #copy {
  top: 230px;
  left: 110px;
}
.hero #confirm-hero-left #cartoon-man {
  background: transparent url('/images/wifi.png') no-repeat center center;
  height: 185px;
  margin: 250px 0 0 120px;
}
.hero #confirm-hero-right {
  *zoom: 1;
}
.hero #confirm-hero-right:before,
.hero #confirm-hero-right:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #confirm-hero-right:after {
  clear: both;
}
.hero #confirm-hero-right:before,
.hero #confirm-hero-right:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #confirm-hero-right:after {
  clear: both;
}
.hero #confirm-hero-right #confirm-right {
  margin-top: 100px;
}
.hero #confirm-hero-right #confirm-right .white-box {
  text-align: left;
  background-color: #ffffff;
  border: 2px solid #999999;
  width: 400px;
  margin: 0 auto;
  min-height: 200px;
}
.hero #confirm-hero-right #confirm-right .white-box #error {
  min-height: 20px;
  margin: 0 20px;
}
.hero #confirm-hero-right #confirm-right .white-box #error .error-text {
  color: #ffcc00;
}
.hero #confirm-hero-right #confirm-right .white-box #error .success-text {
  color: #4380b8;
}
.hero #confirm-hero-right #confirm-right .white-box .copy {
  margin: 0 20px 20px;
}
.hero #confirm-hero-right #confirm-right a {
  margin: 100px auto 0;
  width: 300px;
  text-align: center;
  display: block;
}
.hero #confirm-hero-right #arrow {
  border: none;
  position: relative;
  top: 75px;
  left: 245px;
  background: transparent url('/images/transparent-arrow.png') no-repeat center center;
  width: 112px;
  height: 84px;
  color: #ffcc00;
  text-transform: uppercase;
  text-align: left;
  -webkit-transform: rotate(-5deg);
  -moz-transform: rotate(-5deg);
  -ms-transform: rotate(-5deg);
  -o-transform: rotate(-5deg);
  transform: rotate(-5deg);
}
.hero #confirm-hero-right #arrow .arrow-text {
  padding: 0px 0 0 10px;
}
.hero #confirm-hero-right #arrow:hover {
  color: #ffffff;
  background-image: url('/images/orange-arrow.png');
}
.hero #event-options-hero-left #copy {
  top: 230px;
}
.hero #event-options-hero-left #cartoon-man {
  background: transparent url('/images/event-options.png') no-repeat center center;
  margin: 340px 0 0 90px;
  width: 180px;
}
.hero #event-options-hero-left #dotted-line {
  top: 575px;
  z-index: 2;
}
.hero #event-options-hero-right {
  *zoom: 1;
  text-align: left;
}
.hero #event-options-hero-right:before,
.hero #event-options-hero-right:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #event-options-hero-right:after {
  clear: both;
}
.hero #event-options-hero-right:before,
.hero #event-options-hero-right:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #event-options-hero-right:after {
  clear: both;
}
.hero #event-options-hero-right .event-data {
  height: 95px;
}
.hero #event-options-hero-right fieldset {
  border: none;
  background: transparent;
  width: 525px;
  min-height: 400px;
}
.hero #event-options-hero-right fieldset .control-group {
  *zoom: 1;
  margin: 5px;
}
.hero #event-options-hero-right fieldset .control-group:before,
.hero #event-options-hero-right fieldset .control-group:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #event-options-hero-right fieldset .control-group:after {
  clear: both;
}
.hero #event-options-hero-right fieldset .control-group:before,
.hero #event-options-hero-right fieldset .control-group:after {
  display: table;
  content: "";
  line-height: 0;
}
.hero #event-options-hero-right fieldset .control-group:after {
  clear: both;
}
.hero #event-options-hero-right fieldset .control-group input {
  float: left;
}
.hero #event-options-hero-right fieldset .control-group label {
  margin-left: 20px;
}
.hero #event-options-hero-right fieldset .control-group label span {
  font-size: 1.25em;
  line-height: 25px;
  vertical-align: middle;
}
.hero #event-options-hero-right fieldset button {
  margin: 20px;
}
.hero #event-options-hero-right .arrow {
  top: 550px;
  width: 110px;
}
.price-slider .ui-slider-range {
  background: #4380b8;
}
#rsvp-login-modal .not-friend {
  width: 100%;
  text-align: left;
}
#rsvp-complete-modal .rsvp-complete-text {
  width: 480px;
}
#rsvp-for-modal .collect-rsvp-container {
  padding: 0px;
  margin: 0 0 20px 30px;
}
#rsvp-for-modal .collect-rsvp-container button {
  margin: 20px 0 40px 0;
}
#rsvp-for-modal .collect-rsvp-container h3 {
  padding: 10px 0;
}
#rsvp-for-modal .collect-rsvp-container .collect-rsvp {
  *zoom: 1;
  padding: 20px 0px;
  /* change this to auto to center the rsvp */

  margin: 0;
  text-align: center;
}
#rsvp-for-modal .collect-rsvp-container .collect-rsvp:before,
#rsvp-for-modal .collect-rsvp-container .collect-rsvp:after {
  display: table;
  content: "";
  line-height: 0;
}
#rsvp-for-modal .collect-rsvp-container .collect-rsvp:after {
  clear: both;
}
#rsvp-for-modal .collect-rsvp-container .collect-rsvp:before,
#rsvp-for-modal .collect-rsvp-container .collect-rsvp:after {
  display: table;
  content: "";
  line-height: 0;
}
#rsvp-for-modal .collect-rsvp-container .collect-rsvp:after {
  clear: both;
}
#rsvp-for-modal .collect-rsvp-container .collect-rsvp a {
  font-size: 40px;
  margin: 10px;
  font-weight: bold;
  color: #cccccc;
  display: block;
  float: left;
}
#rsvp-for-modal .collect-rsvp-container .collect-rsvp a.active,
#rsvp-for-modal .collect-rsvp-container .collect-rsvp a:hover {
  color: #ffcc00;
}
#rsvp-for-modal .collect-rsvp-container .payment-type-note {
  margin-top: 30px;
}
#rsvp-for-modal .collect-rsvp-container fieldset {
  width: 250px;
  /* change this to auto to center the rsvp */

  margin: 0;
}
#rsvp-for-modal .collect-rsvp-container fieldset label {
  *zoom: 1;
}
#rsvp-for-modal .collect-rsvp-container fieldset label:before,
#rsvp-for-modal .collect-rsvp-container fieldset label:after {
  display: table;
  content: "";
  line-height: 0;
}
#rsvp-for-modal .collect-rsvp-container fieldset label:after {
  clear: both;
}
#rsvp-for-modal .collect-rsvp-container fieldset label:before,
#rsvp-for-modal .collect-rsvp-container fieldset label:after {
  display: table;
  content: "";
  line-height: 0;
}
#rsvp-for-modal .collect-rsvp-container fieldset label:after {
  clear: both;
}
#rsvp-for-modal .collect-rsvp-container fieldset label #including-yourself {
  line-height: 30px;
  vertical-align: middle;
  padding-left: 10px;
}
#rsvp-for-modal .collect-rsvp-container fieldset label #guest-count {
  width: 30px;
  height: 26px;
  text-align: center;
  margin: 0 10px;
}
#rsvp-for-modal .collect-rsvp-container .add-ons {
  margin: 23px 0 0 10px;
  width: 250px;
}
#rsvp-for-modal .collect-rsvp-container .add-ons span {
  line-height: 23px;
  vertical-align: middle;
  font-size: 1.2em;
}
#rsvp-for-modal .where-to-go {
  height: 150px;
  width: 150px;
  margin: 80px 0 0 30px;
}
#pony-up-modal,
#create-account-modal {
  width: 750px;
  height: 630px;
}
#pony-up-modal .modal-body,
#create-account-modal .modal-body {
  max-height: 530px;
}
#pony-up-modal .modal-footer,
#create-account-modal .modal-footer {
  background-color: #ffffff;
  text-align: left;
}
#pony-up-modal .security-logos,
#create-account-modal .security-logos {
  width: 400px;
  padding: 0 20px;
}
#pony-up-modal .positive-ssl,
#create-account-modal .positive-ssl {
  margin: 20px;
  height: 96px;
  width: 96px;
  background: transparent url('/images/PositiveSSL.gif') no-repeat center top;
}
#pony-up-modal .balanced-logo,
#create-account-modal .balanced-logo {
  margin: 10px 6px;
  height: 115px;
  width: 250px;
  background: transparent url('/images/balanced-logo.jpg') no-repeat center top;
}
#pony-up-modal .balanced-credit-card-logos,
#create-account-modal .balanced-credit-card-logos {
  height: 100px;
  width: 320px;
  background: #ffffff url('/images/balanced-credit-card-logos.png') no-repeat center center;
}
#pony-up-modal #pony-up-payment .alert,
#create-account-modal #pony-up-payment .alert,
#pony-up-modal #new-merchant-account .alert,
#create-account-modal #new-merchant-account .alert {
  margin-top: 10px;
}
#pony-up-modal #pony-up-payment h3,
#create-account-modal #pony-up-payment h3,
#pony-up-modal #new-merchant-account h3,
#create-account-modal #new-merchant-account h3 {
  border-bottom: thin solid #666666;
}
#pony-up-modal #pony-up-payment .container,
#create-account-modal #pony-up-payment .container,
#pony-up-modal #new-merchant-account .container,
#create-account-modal #new-merchant-account .container {
  width: 710px;
  margin-top: 20px;
}
#pony-up-modal #pony-up-payment .container fieldset input,
#create-account-modal #pony-up-payment .container fieldset input,
#pony-up-modal #new-merchant-account .container fieldset input,
#create-account-modal #new-merchant-account .container fieldset input {
  margin: 0;
}
#pony-up-modal #pony-up-payment .container fieldset .amount-to-pony-up,
#create-account-modal #pony-up-payment .container fieldset .amount-to-pony-up,
#pony-up-modal #new-merchant-account .container fieldset .amount-to-pony-up,
#create-account-modal #new-merchant-account .container fieldset .amount-to-pony-up {
  font-size: 16px;
  border: 2px solid #666666;
  padding: 10px;
  margin-bottom: 20px;
}
#pony-up-modal #pony-up-payment .container fieldset .me-pony-up-amount,
#create-account-modal #pony-up-payment .container fieldset .me-pony-up-amount,
#pony-up-modal #new-merchant-account .container fieldset .me-pony-up-amount,
#create-account-modal #new-merchant-account .container fieldset .me-pony-up-amount {
  width: 180px;
}
#pony-up-modal #pony-up-payment .container fieldset select,
#create-account-modal #pony-up-payment .container fieldset select,
#pony-up-modal #new-merchant-account .container fieldset select,
#create-account-modal #new-merchant-account .container fieldset select {
  width: 220px;
}
#pony-up-modal #pony-up-payment .container fieldset select.month,
#create-account-modal #pony-up-payment .container fieldset select.month,
#pony-up-modal #new-merchant-account .container fieldset select.month,
#create-account-modal #new-merchant-account .container fieldset select.month,
#pony-up-modal #pony-up-payment .container fieldset select.year,
#create-account-modal #pony-up-payment .container fieldset select.year,
#pony-up-modal #new-merchant-account .container fieldset select.year,
#create-account-modal #new-merchant-account .container fieldset select.year {
  width: 100px;
}
#pony-up-modal #pony-up-payment .container fieldset select.month,
#create-account-modal #pony-up-payment .container fieldset select.month,
#pony-up-modal #new-merchant-account .container fieldset select.month,
#create-account-modal #new-merchant-account .container fieldset select.month {
  margin-right: 20px;
}
#pony-up-modal #pony-up-payment .container .security-codes,
#create-account-modal #pony-up-payment .container .security-codes,
#pony-up-modal #new-merchant-account .container .security-codes,
#create-account-modal #new-merchant-account .container .security-codes {
  width: 300px;
  height: 186px;
  padding: 10px 20px;
  background: #ffffff url('/images/security-codes.png') no-repeat center center;
}
#pony-up-modal #pony-up-payment .container .security-message,
#create-account-modal #pony-up-payment .container .security-message,
#pony-up-modal #new-merchant-account .container .security-message,
#create-account-modal #new-merchant-account .container .security-message {
  background-color: #d3e3ea;
  padding: 20px;
  width: 400px;
  margin-left: 30px;
}
#pony-up-modal #pony-up-payment .container .security-message .header h4,
#create-account-modal #pony-up-payment .container .security-message .header h4,
#pony-up-modal #new-merchant-account .container .security-message .header h4,
#create-account-modal #new-merchant-account .container .security-message .header h4 {
  line-height: 30px;
  vertical-align: middle;
  font-size: 20px;
  font-weight: bold;
}
#pony-up-modal {
  height: 600px;
}
#pony-up-modal .modal-body {
  max-height: 500px;
}
#pony-up-modal .security-logos {
  width: 510px;
  padding: 0 10px;
}
#pony-up-modal .security-logos .balanced-credit-card-logos {
  margin: 15px 0 0 10px;
}
#pony-up-modal .modal-footer .control-group {
  margin: 50px 10px;
}
#plan-frame {
  *zoom: 1;
  /* this was removed */

}
#plan-frame:before,
#plan-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame:after {
  clear: both;
}
#plan-frame:before,
#plan-frame:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame:after {
  clear: both;
}
#plan-frame input {
  border: thin solid #cccccc;
}
#plan-frame #left {
  width: 18%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  *zoom: 1;
}
#plan-frame #left:before,
#plan-frame #left:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #left:after {
  clear: both;
}
#plan-frame #left:before,
#plan-frame #left:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #left:after {
  clear: both;
}
#plan-frame #left #plan-nav {
  height: 100%;
  font-size: 18px;
  width: 18%;
  background-color: #cccccc;
  top: 0;
}
#plan-frame #left #plan-nav .container {
  width: 100%;
}
#plan-frame #left #plan-nav .spacer {
  height: 90px;
  border-bottom: thin solid #cccccc;
}
#plan-frame #left #plan-nav .line {
  border-top: thin solid #ffffff;
}
#plan-frame #left #plan-nav #section1 {
  margin-top: -56px;
}
#plan-frame #left #plan-nav a.plan-section-nav {
  display: block;
  color: #666666;
  line-height: 60px;
  height: 65px;
  vertical-align: center;
  *zoom: 1;
}
#plan-frame #left #plan-nav a.plan-section-nav:before,
#plan-frame #left #plan-nav a.plan-section-nav:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #left #plan-nav a.plan-section-nav:after {
  clear: both;
}
#plan-frame #left #plan-nav a.plan-section-nav:before,
#plan-frame #left #plan-nav a.plan-section-nav:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #left #plan-nav a.plan-section-nav:after {
  clear: both;
}
#plan-frame #left #plan-nav a.plan-section-nav div {
  width: 100%;
  text-align: left;
}
#plan-frame #left #plan-nav a.plan-section-nav div i {
  margin-top: 23px;
  float: right;
}
#plan-frame #left #plan-nav a.plan-section-nav i {
  float: left;
  margin: 12px 20px;
}
#plan-frame #left #plan-nav a:hover,
#plan-frame #left #plan-nav a.active {
  color: #ffffff;
  background-color: #6da1b7;
}
#plan-frame #middle {
  width: 82%;
  float: left;
  height: 100%;
  margin-left: 18%;
  text-align: left;
  /* organizer specific css */

  /* friend specific css */

}
#plan-frame #middle #rsvp-for-modal,
#plan-frame #middle #plan-dashboard {
  height: 100%;
  /* global invitees lists */

  /* section specific global css */

}
#plan-frame #middle #rsvp-for-modal .border-bottom,
#plan-frame #middle #plan-dashboard .border-bottom {
  border-bottom: thin solid #666666;
}
#plan-frame #middle #rsvp-for-modal .header,
#plan-frame #middle #plan-dashboard .header {
  *zoom: 1;
}
#plan-frame #middle #rsvp-for-modal .header:before,
#plan-frame #middle #plan-dashboard .header:before,
#plan-frame #middle #rsvp-for-modal .header:after,
#plan-frame #middle #plan-dashboard .header:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .header:after,
#plan-frame #middle #plan-dashboard .header:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .header:before,
#plan-frame #middle #plan-dashboard .header:before,
#plan-frame #middle #rsvp-for-modal .header:after,
#plan-frame #middle #plan-dashboard .header:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .header:after,
#plan-frame #middle #plan-dashboard .header:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .header h1,
#plan-frame #middle #plan-dashboard .header h1 {
  width: 100%;
  padding: 10px 0 4px;
  border-bottom: 6px solid #426799;
  text-transform: uppercase;
  margin: 10px 0;
  font-weight: bold;
}
#plan-frame #middle #rsvp-for-modal .header .btn,
#plan-frame #middle #plan-dashboard .header .btn {
  margin: 30px;
}
#plan-frame #middle #rsvp-for-modal .plan-section,
#plan-frame #middle #plan-dashboard .plan-section {
  padding: 0 20px;
  min-height: 768px;
  *zoom: 1;
}
#plan-frame #middle #rsvp-for-modal .plan-section:before,
#plan-frame #middle #plan-dashboard .plan-section:before,
#plan-frame #middle #rsvp-for-modal .plan-section:after,
#plan-frame #middle #plan-dashboard .plan-section:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section:after,
#plan-frame #middle #plan-dashboard .plan-section:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section:before,
#plan-frame #middle #plan-dashboard .plan-section:before,
#plan-frame #middle #rsvp-for-modal .plan-section:after,
#plan-frame #middle #plan-dashboard .plan-section:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section:after,
#plan-frame #middle #plan-dashboard .plan-section:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .alert .icon-2x,
#plan-frame #middle #plan-dashboard .plan-section .alert .icon-2x {
  margin: 4px 10px 0 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .alert .text,
#plan-frame #middle #plan-dashboard .plan-section .alert .text {
  width: 89%;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body > h3,
#plan-frame #middle #plan-dashboard .plan-section .body > h3 {
  color: #214478;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body,
#plan-frame #middle #plan-dashboard .plan-section .body {
  *zoom: 1;
  margin-bottom: 30px;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body:before,
#plan-frame #middle #plan-dashboard .plan-section .body:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body:after,
#plan-frame #middle #plan-dashboard .plan-section .body:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body:after,
#plan-frame #middle #plan-dashboard .plan-section .body:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body:before,
#plan-frame #middle #plan-dashboard .plan-section .body:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body:after,
#plan-frame #middle #plan-dashboard .plan-section .body:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body:after,
#plan-frame #middle #plan-dashboard .plan-section .body:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body h3,
#plan-frame #middle #plan-dashboard .plan-section .body h3 {
  font-weight: bold;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .block1,
#plan-frame #middle #plan-dashboard .plan-section .body .block1 {
  *zoom: 1;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .block1:before,
#plan-frame #middle #plan-dashboard .plan-section .body .block1:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body .block1:after,
#plan-frame #middle #plan-dashboard .plan-section .body .block1:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .block1:after,
#plan-frame #middle #plan-dashboard .plan-section .body .block1:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .block1:before,
#plan-frame #middle #plan-dashboard .plan-section .body .block1:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body .block1:after,
#plan-frame #middle #plan-dashboard .plan-section .body .block1:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .block1:after,
#plan-frame #middle #plan-dashboard .plan-section .body .block1:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .block1 .firstRow h3,
#plan-frame #middle #plan-dashboard .plan-section .body .block1 .firstRow h3 {
  font-size: 1.2em;
  padding: 10px 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row,
#plan-frame #middle #plan-dashboard .plan-section .body .row {
  margin: 0;
  *zoom: 1;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row:before,
#plan-frame #middle #plan-dashboard .plan-section .body .row:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body .row:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row:before,
#plan-frame #middle #plan-dashboard .plan-section .body .row:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body .row:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-slider-container,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-slider-container {
  width: 300px;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-slider-container .price-range-group-container,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-slider-container .price-range-group-container {
  *zoom: 1;
  width: 300px;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-slider-container .price-range-group-container:before,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-slider-container .price-range-group-container:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-slider-container .price-range-group-container:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-slider-container .price-range-group-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-slider-container .price-range-group-container:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-slider-container .price-range-group-container:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-slider-container .price-range-group-container:before,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-slider-container .price-range-group-container:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-slider-container .price-range-group-container:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-slider-container .price-range-group-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-slider-container .price-range-group-container:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-slider-container .price-range-group-container:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-slider-container .price-range-group-container .dollar-sign,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-slider-container .price-range-group-container .dollar-sign {
  display: block;
  width: 80px;
  padding: 10px;
  text-align: center;
  float: left;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-input-container,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-input-container {
  width: 120px;
  line-height: 45px;
  margin: auto;
  font-size: 40px;
  color: #ffcc00;
  *zoom: 1;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-input-container:before,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-input-container:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-input-container:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-input-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-input-container:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-input-container:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-input-container:before,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-input-container:before,
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-input-container:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-input-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-input-container:after,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-input-container:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .body .row .price-input-container input,
#plan-frame #middle #plan-dashboard .plan-section .body .row .price-input-container input {
  width: 75px;
  border: none;
  margin: auto;
  height: 45px;
  font-size: 40px;
  color: #ffcc00;
  line-height: 45px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom {
  *zoom: 1;
  margin-top: 30px;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom:before,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom:before,
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom:after,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom:after,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom:before,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom:before,
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom:after,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom:after,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom .total-coming,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom .total-coming {
  color: #666666;
  width: 230px;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom .total-coming .header,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom .total-coming .header {
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
  background-color: #cccccc;
  padding: 10px;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom .total-coming .header .rsvp-count,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom .total-coming .header .rsvp-count {
  font-size: 26px;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom .total-coming .friend-coming,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom .total-coming .friend-coming {
  margin: 5px 10px;
}
#plan-frame #middle #rsvp-for-modal .plan-section .section-bottom .next-wrapper button,
#plan-frame #middle #plan-dashboard .plan-section .section-bottom .next-wrapper button {
  font-weight: bold;
  width: 200px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee,
#plan-frame #middle #plan-dashboard .invitees-container .invitee {
  margin: 0 30px 40px 0;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .img-container,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .img-container {
  margin-top: 10px;
  width: 75px;
  text-align: center;
  line-height: 12px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .img-container .rsvp-for,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .img-container .rsvp-for {
  font-size: .8em;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info {
  margin-left: 10px;
  width: 80%;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container {
  *zoom: 1;
  width: 100%;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container:before,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container:before,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container:after,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container:after,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container:before,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container:before,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container:after,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container:after,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref {
  width: 20%;
  text-align: center;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref .invitee-pref-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref .invitee-pref-header {
  text-transform: uppercase;
  color: #999999;
  font-style: italic;
  margin: 10px 5px;
  font-size: 14px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref .invitee-pref-value .icon,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref .invitee-pref-value .icon {
  height: 45px;
  line-height: 45px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref .invitee-pref-value .dollar-sign,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref .invitee-pref-value .dollar-sign {
  font-size: 30px;
  height: 45px;
  line-height: 45px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref .invitee-pref-value .prefs-list,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref .invitee-pref-value .prefs-list {
  text-align: left;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref.muted .invitee-pref-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref.muted .invitee-pref-header {
  color: #cccccc;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref.muted .invitee-pref-value .icon,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref.muted .invitee-pref-value .icon {
  color: #cccccc;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref.muted .invitee-pref-value .dollar-sign,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .invitee-pref.muted .invitee-pref-value .dollar-sign {
  color: #cccccc;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .first,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .first {
  text-align: left;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-prefs-container .first i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-prefs-container .first i {
  margin-left: 25px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-name,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-name {
  height: 24px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-name .name,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-name .name {
  font-size: 24px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .invitee-name .guests,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .invitee-name .guests {
  font-weight: bold;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container {
  width: 465px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .me-pony-up-amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .me-pony-up-amount,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .me-pony-up-amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .me-pony-up-amount,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .me-pony-up-amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .me-pony-up-amount {
  width: 60px;
  text-align: right;
  margin-bottom: 0px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container label.transaction-fee-label:hover,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container label.transaction-fee-label:hover,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container label.transaction-fee-label:hover,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container label.transaction-fee-label:hover,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container label.transaction-fee-label:hover,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container label.transaction-fee-label:hover,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container label.suggested-amounts-label:hover,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container label.suggested-amounts-label:hover,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container label.suggested-amounts-label:hover,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container label.suggested-amounts-label:hover,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container label.suggested-amounts-label:hover,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container label.suggested-amounts-label:hover {
  background-color: #d3e3ea;
  cursor: pointer;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label {
  width: 444px;
  padding: 6px;
  line-height: 24px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label i,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label i,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label i,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label i,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label i,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label i,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label i,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label i,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label i {
  width: 15px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .transaction-fee-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .transaction-fee-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .transaction-fee-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .transaction-fee-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .transaction-fee-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .transaction-fee-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .transaction-fee-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .transaction-fee-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .transaction-fee-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .transaction-fee-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .transaction-fee-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .transaction-fee-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .transaction-fee-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .transaction-fee-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .transaction-fee-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .transaction-fee-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .transaction-fee-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .transaction-fee-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .requested-amounts-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .requested-amounts-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .requested-amounts-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .requested-amounts-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .requested-amounts-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .requested-amounts-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .requested-amounts-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .requested-amounts-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .requested-amounts-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .requested-amounts-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .requested-amounts-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .requested-amounts-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .requested-amounts-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .requested-amounts-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .requested-amounts-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .requested-amounts-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .requested-amounts-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .requested-amounts-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .suggested-amount-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .suggested-amount-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .suggested-amount-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .suggested-amount-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .suggested-amount-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .suggested-amount-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .suggested-amount-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .suggested-amount-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .suggested-amount-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .suggested-amount-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .suggested-amount-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .suggested-amount-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .suggested-amount-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .suggested-amount-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .suggested-amount-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .suggested-amount-header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .suggested-amount-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .suggested-amount-header {
  font-size: 1em;
  line-height: 24px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .header {
  font-size: 1.25em;
  font-weight: bold;
  line-height: 24px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .value,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-label .value,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .value,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-label .value,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .value,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-label .value,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .value,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .requested-amounts-label .value,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .value,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .requested-amounts-label .value,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .value,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .requested-amounts-label .value,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .value,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts-label .value,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .value,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts-label .value,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .value,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts-label .value {
  font-size: 1em;
  line-height: 24px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .popover-content,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .popover-content,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .popover-content,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .popover-content,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .popover-content,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .popover-content,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .popover-content,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .popover-content,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .popover-content,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .popover-content,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .popover-content,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .popover-content {
  width: 250px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .popover-content .disclaimer small,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .popover-content .disclaimer small,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .popover-content .disclaimer small,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .popover-content .disclaimer small,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .popover-content .disclaimer small,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .popover-content .disclaimer small,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .popover-content .disclaimer small,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .popover-content .disclaimer small,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .popover-content .disclaimer small,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .popover-content .disclaimer small,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .popover-content .disclaimer small,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .popover-content .disclaimer small {
  padding: 10px 0;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .popover-content h4,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .popover-content h4,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .popover-content h4,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .popover-content h4,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .popover-content h4,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .popover-content h4,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .popover-content h4,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .popover-content h4,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .popover-content h4,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .popover-content h4,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .popover-content h4,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .popover-content h4 {
  font-size: 0.75em;
  display: block;
  width: 100%;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .suggested-amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .suggested-amount,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .suggested-amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .suggested-amount,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .suggested-amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .suggested-amount,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .suggested-amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .suggested-amount,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .suggested-amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .suggested-amount,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .suggested-amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .suggested-amount {
  width: 426px;
  height: 18px;
  margin: 0 10px 10px 30px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .suggested-amount .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .suggested-amount .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .suggested-amount .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .suggested-amount .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .suggested-amount .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .suggested-amount .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .suggested-amount .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .suggested-amount .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .suggested-amount .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .suggested-amount .header,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .suggested-amount .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .suggested-amount .header {
  font-weight: bold;
  width: 100px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .suggested-amount .suggested-amount-body,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .suggested-amount .suggested-amount-body,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .suggested-amount .suggested-amount-body,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .suggested-amount .suggested-amount-body,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .suggested-amount .suggested-amount-body,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .suggested-amount .suggested-amount-body,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .suggested-amount .suggested-amount-body,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .suggested-amount .suggested-amount-body,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .suggested-amount .suggested-amount-body,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .suggested-amount .suggested-amount-body,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .suggested-amount .suggested-amount-body,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .suggested-amount .suggested-amount-body {
  margin: 0 0 0 30px;
  width: 290px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .transaction-fee-container .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .transaction-fee-container .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .transaction-fee-container .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .requested-amounts-container .suggested-amounts .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .transaction-fee-container .suggested-amounts .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .suggested-amount .suggested-amount-body .key,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .suggested-amounts-container .suggested-amounts .suggested-amount .suggested-amount-body .key {
  color: #cccccc;
  font-style: italic;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .send-pony-up-control,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .send-pony-up-control {
  width: 450px;
  margin: 6px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .send-pony-up-control label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .send-pony-up-control label {
  height: 30px;
  padding: 6px;
  line-height: 30px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .send-pony-up-control label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .send-pony-up-control label .header {
  font-weight: bold;
  font-style: italic;
  font-size: 1.5em;
  line-height: 24px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .send-pony-up-control label i,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .send-pony-up-control label i {
  width: 26px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .send-pony-up-control input[type=text],
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .send-pony-up-control input[type=text] {
  width: 75px;
  font-size: 18px;
  text-align: right;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .invitee-info .send-pony-up-control .total,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .invitee-info .send-pony-up-control .total {
  font-size: 18px;
  text-align: right;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container {
  width: 75%;
  margin-left: 85px;
  padding: 6px;
  background-color: #d3e3ea;
  border: 2px dashed #666666;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history-label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history-label {
  cursor: pointer;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history-label .header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history-label .header {
  font-weight: bold;
  font-size: 16px;
  font-style: italic;
  line-height: 26px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history-label .icon,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history-label .icon {
  width: 20px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history {
  margin-left: 24px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history .outside-payment-form,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history .outside-payment-form {
  padding: 20px 6px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history .outside-payment-form label,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history .outside-payment-form label {
  font-weight: bold;
  font-style: italic;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history .outside-payment-form select,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history .outside-payment-form select {
  width: 75px;
  margin: 0 40px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history .outside-payment-form input[type=text],
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history .outside-payment-form input[type=text] {
  width: 50px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history .outside-payment-form a,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history .outside-payment-form a {
  margin-left: 40px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history table,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history table {
  width: 100%;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history table td,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history table td {
  color: #666666;
  text-transform: uppercase;
  font-style: italic;
  font-weight: bold;
  text-align: center;
  padding: 6px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history table td.type,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history table td.type {
  width: 175px;
  text-align: left;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history table td.history-header,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history table td.history-header {
  color: #999999;
  text-align: right;
  font-size: .8em;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history table td.date,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history table td.date,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history table td.status,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history table td.status,
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history table td.amount,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history table td.amount {
  text-align: left;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .invitee .history-container .history table td.actions a,
#plan-frame #middle #plan-dashboard .invitees-container .invitee .history-container .history table td.actions a {
  line-height: 14px;
  vertical-align: middle;
  width: 72px;
  padding: 4px 6px;
  margin-right: 4px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .pony-up-alert,
#plan-frame #middle #plan-dashboard .invitees-container .pony-up-alert {
  margin: 34px;
  width: 450px;
}
#plan-frame #middle #rsvp-for-modal .invitees-container .send-pony-up-button,
#plan-frame #middle #plan-dashboard .invitees-container .send-pony-up-button {
  margin: 40px 0 0 86px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body,
#plan-frame #middle #plan-dashboard .itinerary-section .body {
  position: relative;
  min-height: 2620px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .background,
#plan-frame #middle #plan-dashboard .itinerary-section .body .background {
  margin-top: 80px;
  position: absolute;
  min-width: 1160px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data {
  position: absolute;
  width: 100%;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .event-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .event-container {
  margin: 20px 30px 0 300px;
  font-size: 40px;
  line-height: 40px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .event-container .event-info,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .event-container .event-info {
  margin-left: 50px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .event-container .event-info .text,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .event-container .event-info .text {
  padding-right: 10px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .hotel-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .hotel-container,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .restaurant-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .restaurant-container,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .parking-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .parking-container,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .tickets-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .tickets-container {
  position: absolute;
  width: 350px;
  min-height: 280px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .hotel-container h2,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .hotel-container h2,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .restaurant-container h2,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .restaurant-container h2,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .parking-container h2,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .parking-container h2,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .tickets-container h2,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .tickets-container h2 {
  font-size: 24px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .hotel-container .row,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .hotel-container .row,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .restaurant-container .row,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .restaurant-container .row,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .parking-container .row,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .parking-container .row,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .tickets-container .row,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .tickets-container .row {
  padding: 6px;
  font-size: 16px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .hotel-container .row .info,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .hotel-container .row .info,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .restaurant-container .row .info,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .restaurant-container .row .info,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .parking-container .row .info,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .parking-container .row .info,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .tickets-container .row .info,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .tickets-container .row .info {
  margin-left: 0;
  margin-top: 0;
  margin: 0;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .hotel-container .row .info span,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .hotel-container .row .info span,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .restaurant-container .row .info span,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .restaurant-container .row .info span,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .parking-container .row .info span,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .parking-container .row .info span,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .tickets-container .row .info span,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .tickets-container .row .info span {
  display: inline;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .hotel-container .row .info > div,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .hotel-container .row .info > div,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .restaurant-container .row .info > div,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .restaurant-container .row .info > div,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .parking-container .row .info > div,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .parking-container .row .info > div,
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .tickets-container .row .info > div,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .tickets-container .row .info > div {
  padding: 2px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .tickets-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .tickets-container {
  width: 400px;
  top: 450px;
  left: 150px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .parking-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .parking-container {
  top: 375px;
  left: 610px;
  min-height: 280px;
  background-color: #ffffff;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .hotel-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .hotel-container {
  top: 985px;
  left: 160px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .restaurant-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .restaurant-container {
  top: 820px;
  left: 740px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .google-map-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .google-map-container {
  background-color: #ffffff;
  width: 100%;
  position: absolute;
  top: 1275px;
  height: 700px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .google-map-container h2,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .google-map-container h2 {
  font-size: 24px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .google-map-container .itinerary-map,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .google-map-container .itinerary-map {
  width: 100%;
  height: 600px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .notes-container,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .notes-container {
  position: absolute;
  top: 2000px;
  left: 50px;
  width: 500px;
  height: 500px;
  background-color: #ffcc00;
  border: thin solid #e6b800;
  -webkit-box-shadow: 2px 4px 4px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: 2px 4px 4px rgba(0, 0, 0, 0.3);
  box-shadow: 2px 4px 4px rgba(0, 0, 0, 0.3);
  padding: 10px;
}
#plan-frame #middle #rsvp-for-modal .itinerary-section .body .itinerary-data .notes-container textarea,
#plan-frame #middle #plan-dashboard .itinerary-section .body .itinerary-data .notes-container textarea {
  color: #000000;
  width: 100%;
  height: 465px;
  background: transparent;
  padding: 0px;
  border: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body,
#plan-frame #middle #plan-dashboard .rsvp-section .body {
  margin: 10px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container {
  margin: 30px 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container {
  width: 35%;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info {
  *zoom: 1;
  background-color: #cccccc;
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  border-radius: 6px;
  padding: 10px;
  margin: 0;
  font-family: "Calibri";
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info:before,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info:before,
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info:before,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info:before,
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row {
  *zoom: 1;
  margin: 0;
  padding: 2px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row:before,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row:before,
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row:before,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row:before,
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row h3,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row h3 {
  color: #666666;
  font-family: "Calibri";
  line-height: 15px;
  vertical-align: middle;
  padding: 0px;
  margin-right: 2px;
  font-size: 1.25em;
  padding: 3px 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row span,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row span {
  display: inline;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row label,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row label {
  margin-left: 20px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row .data,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row .data {
  line-height: 21px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .row .rsvp-days,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .row .rsvp-days {
  margin-bottom: 10px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .first-row .data,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .first-row .data {
  font-size: 1.5em;
  line-height: 20px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .info-container .info .first-row h3,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .info-container .info .first-row h3 {
  font-size: 1.5em;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container {
  padding: 0px;
  width: 50%;
  margin-left: 30px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container button,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container button {
  margin: 20px 0 40px 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container h3,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container h3 {
  padding: 10px 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp {
  *zoom: 1;
  width: 100%;
  padding: 25px 0px;
  /* change this to auto to center the rsvp */

  margin: 0;
  text-align: center;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:before,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:before,
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:before,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:before,
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp a,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp a {
  font-size: 40px;
  margin: 10px;
  font-weight: bold;
  color: #cccccc;
  display: block;
  float: left;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp a.active,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp a.active,
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp a:hover,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .collect-rsvp a:hover {
  color: #ffcc00;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container .payment-type-note,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container .payment-type-note {
  margin-top: 30px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset {
  width: 290px;
  /* change this to auto to center the rsvp */

  margin: 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label {
  *zoom: 1;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:before,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:before,
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:before,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:before,
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:after,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label #including-yourself,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label #including-yourself {
  line-height: 30px;
  vertical-align: middle;
  padding-left: 10px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label #guest-count,
#plan-frame #middle #plan-dashboard .rsvp-section .body .rsvp-container .collect-rsvp-container fieldset label #guest-count {
  width: 30px;
  height: 26px;
  text-align: center;
  margin: 0 10px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body #no-invitees,
#plan-frame #middle #plan-dashboard .rsvp-section .body #no-invitees {
  background-color: #cccccc;
  padding: 50px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body #no-invitees button,
#plan-frame #middle #plan-dashboard .rsvp-section .body #no-invitees button {
  margin: auto;
  display: block;
  width: 200px;
  height: 60px;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .section-bottom .next-wrapper,
#plan-frame #middle #plan-dashboard .rsvp-section .body .section-bottom .next-wrapper {
  text-align: right;
}
#plan-frame #middle #rsvp-for-modal .rsvp-section .body .section-bottom .next-wrapper button,
#plan-frame #middle #plan-dashboard .rsvp-section .body .section-bottom .next-wrapper button {
  margin-top: -65px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .row,
#plan-frame #middle #plan-dashboard .vote-section .row {
  width: 450px;
  margin: 20px 30px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .row .preference-dropdown,
#plan-frame #middle #plan-dashboard .vote-section .row .preference-dropdown {
  margin: 0 0 20px 0;
}
#plan-frame #middle #rsvp-for-modal .vote-section .row .checkbox,
#plan-frame #middle #plan-dashboard .vote-section .row .checkbox {
  font-size: 1.4em;
  font-weight: bold;
  margin: 20px 0;
}
#plan-frame #middle #rsvp-for-modal .vote-section .right,
#plan-frame #middle #plan-dashboard .vote-section .right {
  margin: 100px 30px 0;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label {
  display: block;
  *zoom: 1;
  margin-right: 10px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label:before,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label:before,
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label:after,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label:after,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label:before,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label:before,
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label:after,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label:after {
  display: table;
  content: "";
  line-height: 0;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label:after,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label:after {
  clear: both;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label h2,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label h2,
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label h3,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label h3,
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label .orange,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label .orange,
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label input,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label input {
  line-height: 45px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label h2,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label h2,
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label h3,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label h3 {
  margin-right: 30px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom label input,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom label input {
  width: 90px;
  border: none;
  margin: auto;
  height: 45px;
  color: #ffcc00;
  line-height: 40px;
  vertical-align: middle;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom #per-person .orange,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom #per-person .orange {
  font-size: 25px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom #per-person input,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom #per-person input {
  font-size: 25px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom #total h2,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom #total h2 {
  font-size: 20px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom #total .orange,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom #total .orange {
  font-size: 40px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom #total input,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom #total input {
  font-size: 40px;
}
#plan-frame #middle #rsvp-for-modal .vote-section .section-bottom button,
#plan-frame #middle #plan-dashboard .vote-section .section-bottom button {
  margin-top: 70px;
}
#plan-frame #middle #rsvp-for-modal .pony-up-section .pony-up,
#plan-frame #middle #plan-dashboard .pony-up-section .pony-up {
  font-size: 20px;
}
#plan-frame #middle #rsvp-for-modal .pony-up-section .pony-up .content,
#plan-frame #middle #plan-dashboard .pony-up-section .pony-up .content {
  margin-left: 30px;
  width: 60%;
}
#plan-frame #middle #rsvp-for-modal .pony-up-section .pony-up .content p,
#plan-frame #middle #plan-dashboard .pony-up-section .pony-up .content p {
  padding: 20px 0;
}
#plan-frame #middle #rsvp-for-modal .pony-up-section .pony-up .content .icon-circle,
#plan-frame #middle #plan-dashboard .pony-up-section .pony-up .content .icon-circle {
  display: block;
  font-size: 10px;
}
#plan-frame #middle #rsvp-for-modal .pony-up-section .pony-up .content span,
#plan-frame #middle #plan-dashboard .pony-up-section .pony-up .content span {
  margin-left: 10px;
  font-size: 20px;
}
#plan-frame #middle #rsvp-for-modal .pony-up-section .pony-up .content .note,
#plan-frame #middle #plan-dashboard .pony-up-section .pony-up .content .note {
  font-style: italic;
}
#plan-frame #middle #rsvp-for-modal .pony-up-section .pony-up .img,
#plan-frame #middle #plan-dashboard .pony-up-section .pony-up .img {
  width: 30%;
}
#plan-frame #middle #rsvp-for-modal .pony-up-section .pony-up .img img,
#plan-frame #middle #plan-dashboard .pony-up-section .pony-up .img img {
  margin: 30px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section .body,
#plan-frame #middle #plan-dashboard .chatter-section .body {
  margin-bottom: 60px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter {
  margin: 20px 30px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatter #new-chatter,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatter #new-chatter {
  width: 760px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatter #new-chatter textarea,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatter #new-chatter textarea {
  margin: 0 0 0 20px;
  height: 75px;
  width: 650px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatter #new-chatter button,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatter #new-chatter button {
  margin: 10px 0;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters {
  width: 760px;
  margin-top: 20px;
  border-top: thin solid #cccccc;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .upvote,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .upvote {
  display: inline;
  padding: 2px;
  text-align: center;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter {
  margin-top: 20px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container {
  margin-left: 95px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .actor-name-container,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .actor-name-container {
  height: 20px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .actor-name-container .actor-name,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .actor-name-container .actor-name {
  font-weight: bold;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .actor-name-container .actor-name .icon-asterisk,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .actor-name-container .actor-name .icon-asterisk {
  font-weight: normal;
  font-size: .6em;
  line-height: 20px;
  vertical-align: middle;
  margin: 0 6px;
  color: #cccccc;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .chatter-body,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .chatter-body {
  min-height: 45px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .new-chatter-comment,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .new-chatter-comment {
  margin-top: 20px;
  width: 665px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .new-chatter-comment .actor-image-container img,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .new-chatter-comment .actor-image-container img {
  width: 60%;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .new-chatter-comment textarea,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .new-chatter-comment textarea {
  height: 50px;
  width: 575px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .new-chatter-comment button,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .new-chatter-comment button {
  margin: 10px 0;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .chatter-comments,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .chatter-comments {
  margin-top: 20px 0 20px 95px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .chatter-comments .chatter-comment,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .chatter-comments .chatter-comment {
  margin-top: 20px;
}
#plan-frame #middle #rsvp-for-modal .chatter-section #plan-chatter #chatters .chatter .chatter-container .chatter-comments .chatter-comment .actor-image-container img,
#plan-frame #middle #plan-dashboard .chatter-section #plan-chatter #chatters .chatter .chatter-container .chatter-comments .chatter-comment .actor-image-container img {
  max-width: 60%;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-rsvp-section .confirmed-alert,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-rsvp-section .not-confirmed-warning {
  width: 540px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-rsvp-section .confirmed-alert a:hover,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-rsvp-section .not-confirmed-warning a:hover {
  color: #426799;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .btn {
  margin: 0;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .container.border-bottom {
  border-bottom: 4px solid #666666;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .container {
  width: 100%;
  margin: 20px 0 0 0;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .container .cartoon-man {
  width: 100px;
  margin: 0 20px;
  text-align: center;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .container .header label i {
  width: 40px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .container .header label h3 {
  color: #666666;
  font-size: 28px;
  line-height: 42px;
  vertical-align: middle;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .container .body {
  width: 500px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .container .body p {
  padding: 10px 0;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .container .body .button-container .buy-now {
  margin: 10px 10px 10px 200px;
  display: block;
  color: #4380b8;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-info,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-payment {
  font-size: 1.5em;
  margin: 10px 0;
  line-height: 24px;
  vertical-align: middle;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-info .left,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-payment .left {
  width: 360px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-section,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-row,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-seat {
  margin-right: 10px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-section span,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-row span,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-seat span {
  margin-left: 5px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-payment .qty-container select {
  margin: 0 10px;
  font-size: 0.6em;
  width: 50px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .ticket-container .ticket-payment .ticket-total {
  margin: 0 10px;
  color: #46a546;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .ticket-row .controls {
  margin: 20px 0;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-offsite-link .text {
  margin: 15px 0 0 15px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-info,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-payment {
  font-size: 1.5em;
  margin: 10px 0;
  line-height: 24px;
  vertical-align: middle;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-section,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-row,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-seat {
  margin-right: 10px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-section span,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-row span,
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-seat span {
  margin-left: 5px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-payment .qty-container select {
  margin: 0 10px;
  font-size: 0.6em;
  width: 50px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .add-on-container .add-on-payment .add-on-total {
  margin: 0 10px;
  color: #46a546;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .controls {
  margin: 20px 0;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .controls .change-add-on-link {
  margin: 10px 0px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .controls .view-add-on-link {
  margin-right: 20px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .add-on-row .controls .btn {
  margin-right: 20px;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .totals {
  font-size: 3em;
  width: 550px;
  text-align: right;
  margin-left: 150px;
  font-weight: bold;
}
#plan-frame #middle #plan-dashboard.organizer-plan-dashboard .organizer-cart-section .body .totals > div {
  line-height: normal;
}
#plan-frame #middle #plan-dashboard.friend-plan-dashboard .friend-rsvp-section .body .friend-rsvp-container .info-container .info .row h3 {
  font-size: 1em;
  padding: 4px 0;
}
#plan-frame #middle #plan-dashboard.friend-plan-dashboard .friend-rsvp-section .body .friend-rsvp-container .collect-rsvp-container .collect-rsvp {
  width: 100%;
}
#plan-frame #middle #plan-dashboard.friend-plan-dashboard .friend-rsvp-section .body .friend-rsvp-container .collect-rsvp-container .collect-rsvp a {
  font-size: 54px;
}
#plan-frame #right {
  width: 18%;
  float: left;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
}
#plan-frame #right #plan-feed {
  background-color: #ffffff;
  height: 100%;
  width: 18%;
}
#plan-frame #right #plan-feed .feed {
  padding: 5px 15px;
  text-align: left;
  line-height: 20px;
  border-bottom: thin solid #cccccc;
}
#plan-frame #right #plan-feed .feed i {
  margin: 5px;
}
.modal textarea {
  width: 520px;
  height: 80px;
}
.modal .char-count {
  display: inline-block;
  vertical-align: middle;
  background: none repeat scroll 0 0 #F5F5F5;
  border: 0 none;
  color: #666666;
  margin-right: 5px;
  text-align: center;
  width: 2em;
  font-size: 12px;
}
#invitation-modal.modal {
  width: 775px;
  margin: -345px 0 0 -375px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body {
  *zoom: 1;
  padding: 0;
  max-height: 650px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body:before,
#invitation-modal.modal #invite-friends-wizard .modal-body:after {
  display: table;
  content: "";
  line-height: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body:after {
  clear: both;
}
#invitation-modal.modal #invite-friends-wizard .modal-body:before,
#invitation-modal.modal #invite-friends-wizard .modal-body:after {
  display: table;
  content: "";
  line-height: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body:after {
  clear: both;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #left {
  background-color: #cccccc;
  width: 30%;
  height: 550px;
  font-size: 16px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #left a.wizard-step-nav {
  display: block;
  color: #666666;
  line-height: 30px;
  height: 30px;
  vertical-align: center;
  padding: 6px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #left a.wizard-step-nav div {
  margin-left: 40px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #left a.wizard-step-nav div i {
  float: right;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #left a.wizard-step-nav i {
  float: left;
  margin: 6px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #left a:hover,
#invitation-modal.modal #invite-friends-wizard .modal-body #left a.active {
  color: #ffffff;
  background-color: #6da1b7;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right {
  height: 450px;
  width: 500px;
  overflow-y: auto;
  padding: 5px 20px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .invite-wizard-step1-form .switch-login,
#invitation-modal.modal #invite-friends-wizard .modal-body #right .invite-wizard-step1-form .or,
#invitation-modal.modal #invite-friends-wizard .modal-body #right .invite-wizard-step1-form .facebook-login {
  width: 100%;
  text-align: center;
  margin-top: 30px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right #facebook-login-button {
  margin: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right #invite-wizard-rsvp-form .datepicker-container {
  position: relative;
  margin: 40px auto;
  width: 260px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .wizard-step {
  width: 485px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right p {
  margin: 10px 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right textarea {
  width: 475px;
  height: 60px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right input[type=text],
#invitation-modal.modal #invite-friends-wizard .modal-body #right input[type=password] {
  width: 320px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right form fieldset {
  *zoom: 1;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right form fieldset:before,
#invitation-modal.modal #invite-friends-wizard .modal-body #right form fieldset:after {
  display: table;
  content: "";
  line-height: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right form fieldset:after {
  clear: both;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right form fieldset:before,
#invitation-modal.modal #invite-friends-wizard .modal-body #right form fieldset:after {
  display: table;
  content: "";
  line-height: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right form fieldset:after {
  clear: both;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .name-group input {
  width: 475px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .name-group input.first-name {
  width: 180px;
  margin-right: 6px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .name-group input.last-name {
  width: 275px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .form-status {
  color: #46a546;
  width: 145px;
  text-align: center;
  margin-top: 5px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .form-controls {
  position: absolute;
  bottom: 30px;
  right: 30px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .form-controls .skip-step {
  margin-right: 20px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right #invite-wizard-step5-form fieldset .alert i {
  display: block;
  float: left;
  margin-right: 10px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right #invite-wizard-step5-form fieldset .alert .error-text {
  width: 400px;
  float: left;
  font-size: 18px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right #step5-friends-list .friend-controls {
  color: #6da1b7;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .spinner {
  height: 30px;
  width: 30px;
  margin: 50px auto;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friend-filter {
  width: 448px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list {
  margin-left: 2px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend:hover {
  background-color: #d3e3ea;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend {
  *zoom: 1;
  padding: 6px 0;
  width: 100%;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend:before,
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend:after {
  display: table;
  content: "";
  line-height: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend:after {
  clear: both;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend:before,
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend:after {
  display: table;
  content: "";
  line-height: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend:after {
  clear: both;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-controls {
  text-align: center;
  padding: 5px 10px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-img {
  *zoom: 1;
  width: 45px;
  text-align: center;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-img:before,
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-img:after {
  display: table;
  content: "";
  line-height: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-img:after {
  clear: both;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-img:before,
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-img:after {
  display: table;
  content: "";
  line-height: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-img:after {
  clear: both;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-img i.icon-user {
  font-size: 29px;
  margin: 0;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-img .picture {
  float: left;
  width: 30px;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-name .name {
  padding: 4px 0;
  font-size: 14px;
  height: 24px;
  line-height: 24px;
  vertical-align: middle;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-status {
  padding: 5px 10px 5px 5px;
  width: 80px;
  text-align: right;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-status .icon-question-sign {
  color: #4380b8;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-status .icon-ok-circle {
  color: #46a546;
}
#invitation-modal.modal #invite-friends-wizard .modal-body #right .friends-list-container .friends-list .friend .friend-status .icon-remove-circle {
  color: #ffcc00;
}
#planning-modal .no-plans,
#invited-modal .no-plans,
#contacts-modal .no-plans,
#archived-modal .no-plans {
  *zoom: 1;
  text-align: center;
}
#planning-modal .no-plans:before,
#invited-modal .no-plans:before,
#contacts-modal .no-plans:before,
#archived-modal .no-plans:before,
#planning-modal .no-plans:after,
#invited-modal .no-plans:after,
#contacts-modal .no-plans:after,
#archived-modal .no-plans:after {
  display: table;
  content: "";
  line-height: 0;
}
#planning-modal .no-plans:after,
#invited-modal .no-plans:after,
#contacts-modal .no-plans:after,
#archived-modal .no-plans:after {
  clear: both;
}
#planning-modal .no-plans:before,
#invited-modal .no-plans:before,
#contacts-modal .no-plans:before,
#archived-modal .no-plans:before,
#planning-modal .no-plans:after,
#invited-modal .no-plans:after,
#contacts-modal .no-plans:after,
#archived-modal .no-plans:after {
  display: table;
  content: "";
  line-height: 0;
}
#planning-modal .no-plans:after,
#invited-modal .no-plans:after,
#contacts-modal .no-plans:after,
#archived-modal .no-plans:after {
  clear: both;
}
#planning-modal .no-plans .start-now,
#invited-modal .no-plans .start-now,
#contacts-modal .no-plans .start-now,
#archived-modal .no-plans .start-now {
  width: 230px;
  margin: 20px;
}
#planning-modal .modal-body,
#invited-modal .modal-body,
#contacts-modal .modal-body,
#archived-modal .modal-body {
  max-height: 400px;
  overflow: auto;
}
#planning-modal .info .name,
#invited-modal .info .name,
#contacts-modal .info .name,
#archived-modal .info .name,
#planning-modal .info .venue,
#invited-modal .info .venue,
#contacts-modal .info .venue,
#archived-modal .info .venue,
#planning-modal .info .location,
#invited-modal .info .location,
#contacts-modal .info .location,
#archived-modal .info .location {
  width: 275px;
}
#planning-modal .contacts-list,
#invited-modal .contacts-list,
#contacts-modal .contacts-list,
#archived-modal .contacts-list {
  margin: 4px 20px;
}
#planning-modal .contacts-list .dashboard-contact,
#invited-modal .contacts-list .dashboard-contact,
#contacts-modal .contacts-list .dashboard-contact,
#archived-modal .contacts-list .dashboard-contact {
  *zoom: 1;
}
#planning-modal .contacts-list .dashboard-contact:before,
#invited-modal .contacts-list .dashboard-contact:before,
#contacts-modal .contacts-list .dashboard-contact:before,
#archived-modal .contacts-list .dashboard-contact:before,
#planning-modal .contacts-list .dashboard-contact:after,
#invited-modal .contacts-list .dashboard-contact:after,
#contacts-modal .contacts-list .dashboard-contact:after,
#archived-modal .contacts-list .dashboard-contact:after {
  display: table;
  content: "";
  line-height: 0;
}
#planning-modal .contacts-list .dashboard-contact:after,
#invited-modal .contacts-list .dashboard-contact:after,
#contacts-modal .contacts-list .dashboard-contact:after,
#archived-modal .contacts-list .dashboard-contact:after {
  clear: both;
}
#planning-modal .contacts-list .dashboard-contact:before,
#invited-modal .contacts-list .dashboard-contact:before,
#contacts-modal .contacts-list .dashboard-contact:before,
#archived-modal .contacts-list .dashboard-contact:before,
#planning-modal .contacts-list .dashboard-contact:after,
#invited-modal .contacts-list .dashboard-contact:after,
#contacts-modal .contacts-list .dashboard-contact:after,
#archived-modal .contacts-list .dashboard-contact:after {
  display: table;
  content: "";
  line-height: 0;
}
#planning-modal .contacts-list .dashboard-contact:after,
#invited-modal .contacts-list .dashboard-contact:after,
#contacts-modal .contacts-list .dashboard-contact:after,
#archived-modal .contacts-list .dashboard-contact:after {
  clear: both;
}
#planning-modal .contacts-list .dashboard-contact .contact-info,
#invited-modal .contacts-list .dashboard-contact .contact-info,
#contacts-modal .contacts-list .dashboard-contact .contact-info,
#archived-modal .contacts-list .dashboard-contact .contact-info {
  margin-left: 10px;
}
#planning-modal .contacts-list .dashboard-contact i,
#invited-modal .contacts-list .dashboard-contact i,
#contacts-modal .contacts-list .dashboard-contact i,
#archived-modal .contacts-list .dashboard-contact i {
  margin-top: 3px;
}
#dashboard-wrapper {
  *zoom: 1;
  height: 100%;
}
#dashboard-wrapper:before,
#dashboard-wrapper:after {
  display: table;
  content: "";
  line-height: 0;
}
#dashboard-wrapper:after {
  clear: both;
}
#dashboard-wrapper:before,
#dashboard-wrapper:after {
  display: table;
  content: "";
  line-height: 0;
}
#dashboard-wrapper:after {
  clear: both;
}
#dashboard-wrapper #left {
  width: 100%;
  text-align: left;
}
#dashboard-wrapper #left .alert {
  text-align: center;
}
#dashboard-wrapper #left #dashboard {
  margin-bottom: 60px;
}
#dashboard-wrapper #left #dashboard #dashboard-header {
  *zoom: 1;
  width: 600px;
  margin: auto;
  padding: 20px 50px;
}
#dashboard-wrapper #left #dashboard #dashboard-header:before,
#dashboard-wrapper #left #dashboard #dashboard-header:after {
  display: table;
  content: "";
  line-height: 0;
}
#dashboard-wrapper #left #dashboard #dashboard-header:after {
  clear: both;
}
#dashboard-wrapper #left #dashboard #dashboard-header:before,
#dashboard-wrapper #left #dashboard #dashboard-header:after {
  display: table;
  content: "";
  line-height: 0;
}
#dashboard-wrapper #left #dashboard #dashboard-header:after {
  clear: both;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown-menu {
  left: 8px;
  min-width: 230px;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown {
  margin: 10px 20px 0;
  line-height: 26px;
  vertical-align: middle;
  text-transform: capitalize;
  text-align: left;
  color: #666666;
  width: 256px;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown a {
  *zoom: 1;
  color: #666666;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  display: block;
  padding: 9px;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown a:before,
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown a:after {
  display: table;
  content: "";
  line-height: 0;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown a:after {
  clear: both;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown a:before,
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown a:after {
  display: table;
  content: "";
  line-height: 0;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown a:after {
  clear: both;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown a.selected,
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown a:hover {
  background: #666666;
  color: #ffffff;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown .welcome-message {
  font-size: 12px;
  padding: 0 10px;
  width: 186px;
}
#dashboard-wrapper #left #dashboard #dashboard-header .dropdown .icon-cog {
  float: left;
}
#dashboard-wrapper #left #dashboard #dashboard-header .start-now #start-now {
  margin: 10px 30px 0 0;
  width: 212px;
}
#dashboard-wrapper #left .payment-information-wrapper,
#dashboard-wrapper #left #settings-wrapper,
#dashboard-wrapper #left #dashboard-body {
  padding: 50px;
  margin: auto;
  border: 3px solid #666666;
  width: 600px;
}
#dashboard-wrapper #left .payment-information-wrapper .alert .text,
#dashboard-wrapper #left #settings-wrapper .alert .text,
#dashboard-wrapper #left #dashboard-body .alert .text {
  width: 500px;
}
#dashboard-wrapper #left .payment-information-wrapper .dashboard-row,
#dashboard-wrapper #left #settings-wrapper .dashboard-row,
#dashboard-wrapper #left #dashboard-body .dashboard-row {
  *zoom: 1;
}
#dashboard-wrapper #left .payment-information-wrapper .dashboard-row:before,
#dashboard-wrapper #left #settings-wrapper .dashboard-row:before,
#dashboard-wrapper #left #dashboard-body .dashboard-row:before,
#dashboard-wrapper #left .payment-information-wrapper .dashboard-row:after,
#dashboard-wrapper #left #settings-wrapper .dashboard-row:after,
#dashboard-wrapper #left #dashboard-body .dashboard-row:after {
  display: table;
  content: "";
  line-height: 0;
}
#dashboard-wrapper #left .payment-information-wrapper .dashboard-row:after,
#dashboard-wrapper #left #settings-wrapper .dashboard-row:after,
#dashboard-wrapper #left #dashboard-body .dashboard-row:after {
  clear: both;
}
#dashboard-wrapper #left .payment-information-wrapper .dashboard-row:before,
#dashboard-wrapper #left #settings-wrapper .dashboard-row:before,
#dashboard-wrapper #left #dashboard-body .dashboard-row:before,
#dashboard-wrapper #left .payment-information-wrapper .dashboard-row:after,
#dashboard-wrapper #left #settings-wrapper .dashboard-row:after,
#dashboard-wrapper #left #dashboard-body .dashboard-row:after {
  display: table;
  content: "";
  line-height: 0;
}
#dashboard-wrapper #left .payment-information-wrapper .dashboard-row:after,
#dashboard-wrapper #left #settings-wrapper .dashboard-row:after,
#dashboard-wrapper #left #dashboard-body .dashboard-row:after {
  clear: both;
}
#dashboard-wrapper #left .payment-information-wrapper .dashboard-row .dashboard-button,
#dashboard-wrapper #left #settings-wrapper .dashboard-row .dashboard-button,
#dashboard-wrapper #left #dashboard-body .dashboard-row .dashboard-button {
  width: 230px;
  height: 90px;
  margin: 20px;
  display: block;
  float: left;
}
#dashboard-wrapper #left .payment-information-wrapper .dashboard-row .dashboard-button:hover,
#dashboard-wrapper #left #settings-wrapper .dashboard-row .dashboard-button:hover,
#dashboard-wrapper #left #dashboard-body .dashboard-row .dashboard-button:hover {
  color: #ffcc00;
}
#dashboard-wrapper #left #payment-information-wrapper,
#dashboard-wrapper #left #settings-wrapper {
  text-align: left;
}
#dashboard-wrapper #left #payment-information-wrapper p,
#dashboard-wrapper #left #settings-wrapper p {
  padding: 10px;
}
#dashboard-wrapper #right {
  width: 20%;
  height: 100%;
}
#dashboard-wrapper #right #activity-feed {
  background-color: #ffffff;
  height: 100%;
}
