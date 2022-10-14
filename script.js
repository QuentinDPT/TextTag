TextTag = {
  on: function(id){
    if(typeof id != "string"){
      console.error(`TextTag.on(id) : id should be a string instead of "${typeof id}"`);
      return null;
    }

    if(TextTag._domElements[id] != null){
      console.warn(`${id} is already used`);
      return TextTag._domElements[id];
    }

    let result = {
      addTag : function(beginWith, fetchDataFunction){
        if(this._tags[beginWith] != null){
          console.error("Tag already exist on this node");
          return null;
        }

        this._tags[beginWith] = fetchDataFunction;

        return this;
      },
      _setInfoPos: function(){
        var req = getCursorXY(this.DOM, this.DOM.selectionEnd);

        this._infoDOM.style["display"] = "";
        this._infoDOM.style["top"] = `${req.y - 184}px`;
        this._infoDOM.style["left"] = `${req.x - 10}px`;
      },
      _showResult: function(rslt){
        if(rslt.length == 0){
          this._hideResult();
        }

        let txt = "<div>";
        for(let r of rslt){
          txt += `<div>${r}</div>`;
        }
        this._infoDOM.innerHTML = txt + "</div>";

      },
      _hideResult: function(){
        this._infoDOM.style = "display:none;",
        this._tagEntered = "";
        this._infoDOM.innerHTML = "";
      },
      _tagEntered : "",
      _tags : []
    };

    result["DOM"] = document.getElementById(id);
    if(result.DOM == null){
      console.error(`No element named : ${id}`);
      return null;
    }

    switch(result.DOM.tagName.toUpperCase()){
      case "TEXTAREA":
        break;
      case "INPUT":
        if(result.DOM.type != "text"){
          console.error("Not supported input type");
          return null;
        }
        break;
      default:
        console.error("Not supported tag type");
        return null;
    }

    // Initialize DOM
    let tmp_outerHTML = result.DOM.outerHTML;

    result.DOM.outerHTML = `<div class="TT_parent"><div class="TT_input">${tmp_outerHTML}</div><div class="TT_tooltip" style="display:none;"></div></div>` ;

    result.DOM = document.getElementById(id);

    result["_infoDOM"] = result.DOM.parentElement.parentElement.children[1] ;


    // Comportment onchange
    result.DOM.onkeypress = function(e){
      if(e.key == " " && this.TT._tagEntered != ""){
        this.TT._tagEntered = "";
        this.TT._hideResult();
      }

      if(this.TT._tagEntered != ""){
        let search = RegExp(this.TT._tagEntered + "[A-Za-z0-9]*$").exec(this.value);
        if(search == null){
          this.TT._tagEntered = "";
          this.TT._hideResult();
          return;
        }
        let self = this;
        this.TT._tags[this.TT._tagEntered](search[0].replace(this.TT._tagEntered,"")+e.key,function(data){self.TT._showResult(data);});
        return;
      }

      if(this.TT._tags[e.key] == null)
        return;

      this.TT._tagEntered = e.key;
      let self = this;
      this.TT._tags[this.TT._tagEntered]("",function(data){self.TT._showResult(data);});
      this.TT._setInfoPos();
    };

    result.DOM.onkeydown = function(e){
      switch(e.key){
        case "Enter":
          e.key = " ";
          result.DOM.onkeypress(e);
          break;
        case "Backspace":
          e.key = "";
          result.DOM.onkeypress(e)
          break ;
        case "Escape":
          this.TT._hideResult();
          break;
      }
    }


    TextTag._domElements[id] = result;
    result.DOM.TT = result;

    return result;
  },
  get: function(id){
    if(typeof id != "string"){
      console.error(`TextTag.on(id) : id should be a string instead of "${typeof id}"`);
      return null;
    }

    if(TextTag._domElements[id] == null){
      console.error(`"${id}" comportment doesn't exist\nCreate a comportment with .on() function`);
      return null;
    }
    return TextTag._domElements[id];
  },
  _domElements:[]
}


const getCursorXY = (input, selectionPoint) => {
  const {
    offsetLeft: inputX,
    offsetTop: inputY,
  } = input
  // create a dummy element that will be a clone of our input
  const div = document.createElement('div')
  // get the computed style of the input and clone it onto the dummy element
  const copyStyle = getComputedStyle(input)
  for (const prop of copyStyle) {
    div.style[prop] = copyStyle[prop]
  }
  // we need a character that will replace whitespace when filling our dummy element if it's a single line <input/>
  const swap = '.'
  const inputValue = input.tagName === 'INPUT' ? input.value.replace(/ /g, swap) : input.value
  // set the div content to that of the textarea up until selection
  const textContent = inputValue.substr(0, selectionPoint)
  // set the text content of the dummy element div
  div.textContent = textContent
  if (input.tagName === 'TEXTAREA') div.style.height = 'auto'
  // if a single line input then the div needs to be single line and not break out like a text area
  if (input.tagName === 'INPUT') div.style.width = 'auto'
  // create a marker element to obtain caret position
  const span = document.createElement('span')
  // give the span the textContent of remaining content so that the recreated dummy element is as close as possible
  span.textContent = inputValue.substr(selectionPoint) || '.'
  // append the span marker to the div
  div.appendChild(span)
  // append the dummy element to the body
  document.body.appendChild(div)
  // get the marker position, this is the caret position top and left relative to the input
  const { offsetLeft: spanX, offsetTop: spanY } = span
  // lastly, remove that dummy element
  // NOTE:: can comment this out for debugging purposes if you want to see where that span is rendered
  document.body.removeChild(div)
  // return an object with the x and y of the caret. account for input positioning so that you don't need to wrap the input
  return {
    x: inputX + spanX,
    y: inputY + spanY,
  }
}
