# Research and Design Notes

I gave myself a few goals before starting this project:

* Make an attractive and usable remote system monitoring application
* Send alerts using browser-based local notifications
* Use D3.js for visualizations, but overcome some of the traditional challenges of browser-based datavis rendering
* Build on the best known state-of-the-art for visualizing average load
* Add additional information beyond average load to give context to the visualization
* Create a monitoring interface which could scale to different window sizes while still being functional and usable

Meeting these goals required a significant amount of research, before and during the development phase. You can review my research links in the Appendix.

Note that there were several web-based monitoring services I wanted to try out, including Datadog, but didn’t have a compatible server setup to use (I have two humble Heroku dynos at the moment).

## Learning from (one of) the best: iStat Menus

One of the best visualizations I came across was the average load graph in [Bjango’s iStat Menus for OS X](http://bjango.com/mac/istatmenus/):

![](doc-imgs/iStat%20Menus%20Screenshot.png "iStat Menus Average Load Graph")

This graph is both attractive and functional, having good use of color and distinct visual forms for the three different load averages. The 1-min average’s area fill also makes it stand out as the most relevant—and volatile—metric on the graph.

## Sketching The Interface

The goal was never to copy iStat Menus, of course, but to have a clear idea of what others have tried (and succeeded with). I wanted to enhance this strong design with a few new ways to look at the data.

After retaking [A Tour Through the Visualization Zoo ](https://queue.acm.org/detail.cfm?id=1805128), I started sketching a few different visualization concepts, both traditional and novel. [Take a look at my sketches in the Appendix.](https://github.com/kohlmannj/uptime/blob/master/APPENDIX.md)

## Data Sources

I decided I at least wanted some CPU usage stats in this interface, so I wrote a small backend application with Python Flask to capture and parse output from `top` on OS X. I later modified this code to support `top` on Linux, thereby letting me deploy to Heroku.

## Configuring a Web App Framework

With an interface in mind, I set out to actually build it. I wanted to engineer this interface using most of the engineering best practices I had used during my time at [AnswerDash](http://www.answerdash.com). This meant configuring a full web application stack with **Backbone models**, **Marionette views**, Bower packages, and **RequireJS modules** for everything. [With a few exceptions](https://github.com/kohlmannj/uptime/search?utf8=%E2%9C%93&q=focusSample%3A+function%28sample%29+%7B), this app is built the way I would build a production web application today.

## A Note on Opinions (technical and otherwise)

That said, look, it’s *way* more fun working as a team! These technical choices were right for *me* on *this* project—that’s it. I’m always looking for a chance to use new technologies anyway, and I love having **open and positive discussions on everything**, from design and tech to favorite musicians and vacation getaways. I have opinions, sure, but I *much* prefer **an open, positive, collaborative environment** more than anything else.

Heck, I also love **sharing what I’ve learned** as well, in hopes that it might help you out, dear reader. That’s why this document exists! But seriously, please know that everything is always on the table.

## Building the Thing: A Timeline

The application underpinnings were just the start, of course. Turns out, in computing, you rarely get anything for free. Here’s a summary of the technical hurdles I tried to clear during this project:

* Researching and designing something not only functional, but also worthwhile (1 day)
* Bootstrapping the web app configuration (2 days)
* Designing and implementing (and debugging) the average load view (2 days)
* Building the CPU % view and notifications (1 day)
* Debugging *everything*, from performance issues and messaging errors, to time zone errors, Heroku freakouts, and more (1 day)
* Writing this project debrief (1 day)

Honestly, there was a point where I thought, “you know, this is a design exercise that I’m probably taking too seriously.” This is true, and you can imagine (and see above) how that influenced my turnaround time. That said, I wanted Uptime Monitor to reflect my **dedication to excellence in design, engineering, and usability**. To wit, I’d call this an [early “MVP”](http://en.wikipedia.org/wiki/Minimum_viable_product) of this design. That is, I wouldn’t ship it just yet. Take a look at the next section for some reasons why.

## Compromises and Future Improvements

**Performance:** The “wiggly” animated graphs are super cool, adding an intentional whimsy to the interface. (Don’t worry, the animations pause if you’re brushing over the graph). CPU usage (for this monitoring app itself) *goes through the roof* if the browser’s animating too huge a path, however. I implemented a naïve performance optimization which only animates a certain portion of the data displayed in the graph.

**Bad things happen when the app is off-screen:** Turns out there are some nasty problems with fetching new stats, which can result in some pretty weird-looking graphs.

**Built-in legends and other help**: The current graph legends could use some expansion and clarification. It isn’t really obvious what’s going on in the charts unless 

**User testing:** This is a *big* one. When it comes to engineering and design, it’s often the case that getting to MVP is hard enough—but now you want to throw *people* in the mix? Usability testing is **essential**, and to be honest, should have tested my assumptions about how the interface works much earlier. That said, on principle: providing the time and resources to properly examine how well our work serves the people using it should be part of any development process.

## That’s It

Thanks for reading (or skimming—totally fine). For some fun sketches and research links, head over to the Appendix.