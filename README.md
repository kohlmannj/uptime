# Uptime Monitor

[![](doc-imgs/Uptime%20Monitor%20Poster%20Graphic.png "Uptime Monitor: an interactive visualization of a computer's average load and CPU usage")](https://vimeo.com/124244477)
(Check out the [video demo on Vimeo](https://vimeo.com/124244477))

## Overview

Uptime Monitor shows you a remote machine’s **average loads** on a dynamic “wavy” line graph, as well as the **system load vs. CPU usage** on a nearby area chart. The app also provides **high load alerts** when the load has exceeded a certain value for a period of time (recovery alerts are there too). Below are a few other vital stats.

**Front-End:** [Backbone](http://backbonejs.org) and [Marionette](http://marionettejs.com), [RequireJS](http://requirejs.org), [D3.js](http://d3js.org), and [many more](https://github.com/kohlmannj/uptime/blob/master/templates/config.js).
**Back-End:** Python, [Flask](http://flask.pocoo.org), and good ol’ `top`.
**Deployment:** Heroku—[check it out live!](https://kohlmannj-uptime.herokuapp.com)
**License:** [BSD-3 Clause](https://github.com/kohlmannj/uptime/blob/master/LICENSE.txt) ([learn more](http://opensource.org/licenses/BSD-3-Clause))

## Features

**Scaleable D3 visualizations:** D3 is a fairly popular datavis graphics library, but it’s fairly common to *redraw the underlying SVG* when resizing the browser window. Turns out there’s a whole [science](https://github.com/kohlmannj/uptime/search?l=javascript&q=D3ShimView&type=Code&utf8=%E2%9C%93) and [(dark) art](https://github.com/kohlmannj/uptime/search?l=scss&q=GraphCompositeView&utf8=%E2%9C%93) to doing this better. In the end, Uptime Monitor renders SVG-based visualizations in a *dynamic layout* with consistent coordinates and **no redraws** on window resize. **Go ahead and resize that browser window!**

**Animated “wavy” graphs:** Now that everything scales, let’s have some fun with those redraws! Uptime Monitor takes inspiration from **[Dark Sky](http://darkskyapp.com)** to give the load graph a bit of character. This bit of eye candy is also a *motion encoding* of changes in average load over time, drawing your eye to *big changes* in the graph.

**Linked brushing between visualizations:** Hover over any part of the interface—a message, CPU value, or load measurement—to see the corresponding data in another view. (You can also hover over for **tooltips** containing more info.)

**High load alerts with Local Notifications:** Uptime Monitor uses [Local Notifications](https://developer.apple.com/library/safari/documentation/NetworkingInternet/Conceptual/NotificationProgrammingGuideForWebsites/LocalNotifications/LocalNotifications.html) to provide alerts, even when you’re not looking right at it.

## Requirements

* Python 2.7.8, pip, and [other dependencies](https://github.com/kohlmannj/uptime/blob/master/requirements.txt)
* `top` on Linux or OS X
* A [sense of wonder](https://www.youtube.com/watch?v=U_xoICJChu8) and [deep appreciation](http://procatinator.com) for [fuzzy kittens](https://twitter.com/EmrgencyKittens)\*

\*Optional, except not really.

## Installation

Uptime Monitor is all ready to deploy on Heroku, so clone the repository, push, and you’re golden.

To run Uptime Monitor locally, use Python 2.7.8 and `pip` to install dependencies from [requirements.txt](https://github.com/kohlmannj/uptime/blob/master/requirements.txt). Then use `python` to run `flask_app.py` at [http://0.0.0.0:3000](http://0.0.0.0:3000):

	$ cd uptime
	$ pip install -r requirements.txt
	$ python flask_app.py

## For More Information

Check out [my research and design notes](https://github.com/kohlmannj/uptime/blob/master/DESIGN.md) for Uptime Monitor. See also: [the Appendix](https://github.com/kohlmannj/uptime/blob/master/APPENDIX.md) for sketches and research links.