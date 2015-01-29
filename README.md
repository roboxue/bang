# Bang <ruby> 棒 <rt> Bàng</rt></ruby>

Frontend JSON workspace, a Chrome extension

[Chrome Store](https://chrome.google.com/webstore/detail/bang/dfmpfciemnocjnpfddbefbhhamhjcmgl)

License
-------

    Copyright (c) 2015, Groupon, Inc.
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

    Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.

    Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

    Neither the name of GROUPON nor the names of its contributors may be
    used to endorse or promote products derived from this software without
    specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
    IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
    TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
    PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
    TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
    LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
    NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*v0.1.3 Release*

Hightlights:

##### It is a good JSON viewer itself
![screen shot 2015-01-22 at 14 34 19](https://cloud.githubusercontent.com/assets/4080835/5864017/dff7bdda-a243-11e4-911f-aa7a068b3b8a.png)

But it can do more!

##### Custom Javascript expression cab be applied onto JSON response directly
Supporting [Underscore](http://underscorejs.org/), [Backbone](http://backbonejs.org), [d3](http://d3js.org), and [jquery](http://jquery.com)
![screen shot 2015-01-21 at 00 29 58](https://cloud.githubusercontent.com/assets/4080835/5832066/9d032356-a104-11e4-9243-2a35e7cf3fae.png)

##### Check JSON array's scheme on the fly
![screen shot 2015-01-21 at 00 25 36](https://cloud.githubusercontent.com/assets/4080835/5832040/0470745e-a104-11e4-91c5-5ea167c047bc.png)

![screen shot 2015-01-21 at 00 17 40](https://cloud.githubusercontent.com/assets/4080835/5832011/4a77a1bc-a103-11e4-8bb7-61c680204a11.png)

##### Browse easily within an array
![screen shot 2015-01-21 at 00 17 52](https://cloud.githubusercontent.com/assets/4080835/5832012/4a78ad5a-a103-11e4-96ad-8a509b01e2eb.png)

##### Url editing utils for quick turnaround
![screen shot 2015-01-26 at 13 02 30](https://cloud.githubusercontent.com/assets/4080835/5906227/97593b06-a55b-11e4-8a9b-645ee01a7e1a.png)

(Not released yet, in dev mode)

# How to build
> I use Grunt as the task managing tool

1. Make sure you have node.js and npm installed
2. `npm install`
3. `npm run build`

# How to load into Chrome

1. Disable all existing JSON viewer plugins

2. Load the plugin from `dist` folder following the steps below

> a. Visit chrome://extensions in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox.  The menu's icon is three horizontal bars. and select Extensions under the Tools menu to get to the same place).
>
> b. Ensure that the Developer mode checkbox in the top right-hand corner is checked.
>
> c. Click Load unpacked extension… to pop up a file-selection dialog.
>
> d. Navigate to the directory in which your extension files live, and select it.
>
> https://developer.chrome.com/extensions/getstarted#unpacked
