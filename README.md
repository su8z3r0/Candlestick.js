Candlestick.js
==============

candlestick chart on canvas
---------------------------

This is a simple function to draw a candlestick chart using canvas.
The only file you need from this project is Candlestick.js

Not compatible with old browsers!
Tested on Chrome only!

Assumptions
===========
Data is in the same format as in finance.yahoo.com historical prices, see for example: http://finance.yahoo.com/q/hp?s=AAPL+Historical+Prices
On this page in finance.yahoo.com you can inspect the link below the table titled: "Download to Spreadsheet"

Roadmap:
 - [ ] x coordinate labels for different ranges - daily charts
 - [ ] add more indicators to top of the screen - bollinger bands, keltner bands, EMA, ...
 - [ ] add bottom indicators - MACD, Volume, ...
 - [ ] cache data using indexedDB

 Demo explanation
 ================

The index.html file is really short, it contains in the HEAD section 3 javascript files,
1. jQuery from a CDN
2. the Candlestick.js file which is the main file for this project
3. the demo index.js file

In the BODY section there is one canvas element with an id and dimensions.

The index.js file has one jQuery function which onLoad sets the indicators object and uses AJAX to get the data from a file on the same server as the rest of the project.
when the get returns with data it calls the main function:

```
Candlestick(canvasID, data, indicators);
```
the parameters:
- canvasID:   the canvas ID in the html DOM
- data:       the data in the finance.yahoo.com format, e.g. http://ichart.finance.yahoo.com/table.csv?s=AAPL&a=04&b=7&c=2013&d=07&e=27&f=2013&g=w&ignore=.csv
- indicators: the indicators object.

