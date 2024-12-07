/**
 * @param {HTMLElement} btn button that triggrred the event
 * button attributes: onclick="expand(this)" id="[ID]-expand" class="expand-btn" for="[ID]" (where ID is the id of the element to expand/ collapse on click)
 * button inner-HTML: use icon "fa fa-solid fa-carat-down"
 */
function expand(btn)
{
  const id = btn.getAttribute("for");
  const target = document.getElementById(id);
  
  if(target == null)
    return;
    
  let hidden = !target.hidden;
  target.hidden = hidden;
  
  var icon = btn.innerHTML;
  if(hidden)
  {
    icon =icon.replace('up', 'down');
  }
  else
  {
    icon = icon.replace('down', 'up');
  }
    
  btn.innerHTML = icon;
}

let reg = /(https|http):\/\/(\S){1,}\.(\S){1,}/
let chopReg = /(http|https):\/\/[^\/]*/

let urlBox = document.getElementById("url");
let submit = document.getElementById("submit");

urlBox.addEventListener("input", (event) => 
{

    let val = urlBox.value;
    var chop = val.match(chopReg)
    var matches = false;
    var encoded = false;

    if(chop != null)
    {
      matches = reg.test(val);

      encoded = encodeURI(chop) == chop;
    }

    if(matches && encoded) //valid
    {
        console.log("VALID")
        submit.disabled = false;
        urlBox.classList.remove("err")
    }
    else
    {
        console.log("INVALID")
        submit.disabled = true;
        urlBox.classList.add("err")
    }
});

let pixNum = document.getElementById("pixiv_index");
pixNum.addEventListener("input", (event) => 
{
    let val = parseInt(pixNum.value);

    console.log(val);

    if(isNaN(val) || val < 1)
    {
        submit.disabled = true;
        pixNum.classList.add("err")
    }
    else
    {
        submit.disabled = false;
        pixNum.classList.remove("err")
    }
    
});

function copy()
{
  var copyText = (document.getElementById("clean-url")).innerText;
  navigator.clipboard.writeText(copyText);
}

if(!localStorage.theme)
{
  localStorage.theme = "Dark"
}

var themeDict =
{
  "Dark":
    {
      "bg-color-rgb": "17, 17, 33",
      "text-color-rgb": "255, 255, 255",
      "accent-color-rgb": "13, 255, 207",
      "err-color-rgb": "255, 26, 85"
    },
  "Light":
    {
      "bg-color-rgb": "248, 250, 252",
      "text-color-rgb": "17, 17, 33",
      "accent-color-rgb": "17, 6, 173",
      "err-color-rgb": "255, 26, 85"
    },
    "custom-accent": ""
};

if(localStorage.accent)
{
  themeDict["custom-accent"] = localStorage.accent;    
  document.getElementById('clear-color').hidden = false;
}

document.getElementById("cur-theme").innerText = Object.keys(themeDict)[Math.abs(1 - Object.keys(themeDict).indexOf(localStorage.theme))] + " Mode"


function setCssVar(varName, style)
{
  document.documentElement.style.setProperty("--" + varName, style);
}

colorPick = document.getElementById('color-pick');

function setTheme(theme)
{
  const newTheme = themeDict[theme]

  localStorage.theme = theme;
  document.getElementById("cur-theme").innerText = Object.keys(themeDict)[Math.abs(1 - Object.keys(themeDict).indexOf(localStorage.theme))] + " Mode"

  for(var [varName, style] of Object.entries(newTheme))
  {
    if(varName == "accent-color-rgb")
    {
      if( themeDict["custom-accent"].length != 0)
      {
        style = themeDict["custom-accent"]
      }
      colorPick.value = rgbToHex(style);
    }

    setCssVar(varName, style); 
  }
}

colorPick.addEventListener("input", (event) => 
{
  document.getElementById("clear-color").hidden = false; 
  updateColorPick();
});

function updateColorPick()
{
  const rgb = hexToRgb(colorPick.value).join(', ');

  themeDict["custom-accent"] = rgb;
  setCssVar("accent-color-rgb", rgb)
  localStorage.accent = rgb;
}

function toggleLight()
{
  var theme;
  if(localStorage.theme == "Dark")
    theme = "Light"
  else
    theme = "Dark"

    setTheme(theme);
}

function rgbToHex(style)
{
  var rgb = style.split(', ')
  return "#" + (1 << 24 | rgb[0] << 16 | rgb[1] << 8 | rgb[2]).toString(16).slice(1);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ?
    [parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)]
  : null;
}

function clearColor()
{
  colorPick.value = rgbToHex(themeDict[localStorage.theme]["accent-color-rgb"]);
  updateColorPick();
  themeDict["custom-accent"] = "";
  localStorage.removeItem('accent');
  document.getElementById("clear-color").hidden = true;
}

function toggleThemer(themeBtn)
{
  var visible = themeBtn.value == "true";
  document.getElementById("themer").hidden = visible;
  themeBtn.value = !visible;
  if(!visible)
  {
    themeBtn.innerHTML = themeBtn.innerHTML.replace('palette', 'x')
  }
  else
  {
    themeBtn.innerHTML = themeBtn.innerHTML.replace('x', 'palette')

  }

}

setTheme(localStorage.theme)