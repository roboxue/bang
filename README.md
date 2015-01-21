# Bang <ruby> 棒 <rt> Bàng</rt></ruby>

Frontend JSON workspace, a Chrome extension

*v0.0.3 Release*
Hightlights:

##### Custom Javascript expression being applied on JSON response
Supporting [Underscore](http://underscorejs.org/), [Backbone](backbonejs.org), [d3](d3js.org), and [jquery](jquery.com)
![screen shot 2015-01-21 at 00 29 58](https://cloud.githubusercontent.com/assets/4080835/5832066/9d032356-a104-11e4-9243-2a35e7cf3fae.png)

##### Check JSON array's scheme on the fly
![screen shot 2015-01-21 at 00 25 36](https://cloud.githubusercontent.com/assets/4080835/5832040/0470745e-a104-11e4-91c5-5ea167c047bc.png)

![screen shot 2015-01-21 at 00 17 40](https://cloud.githubusercontent.com/assets/4080835/5832011/4a77a1bc-a103-11e4-8bb7-61c680204a11.png)

##### Browse easily within an array
![screen shot 2015-01-21 at 00 17 52](https://cloud.githubusercontent.com/assets/4080835/5832012/4a78ad5a-a103-11e4-96ad-8a509b01e2eb.png)

(Not released yet, in dev mode)

# How to build
1. Make sure you have node.js and npm installed
2. `npm install`
3. `grunt`

# How to load into Chrome

1. Disable all existing JSON viewer plugins

2. Follow https://developer.chrome.com/extensions/getstarted#unpacked

3. Load the plugin from `dist` folder

> a. Visit chrome://extensions in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox.  The menu's icon is three horizontal bars. and select Extensions under the Tools menu to get to the same place).
>
> b. Ensure that the Developer mode checkbox in the top right-hand corner is checked.
> 
> c. Click Load unpacked extension… to pop up a file-selection dialog.
> 
> d. Navigate to the directory in which your extension files live, and select it.

