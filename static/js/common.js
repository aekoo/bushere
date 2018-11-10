window.alert = function(msg) {
    if(document.querySelectorAll('.alertBox').length) {
        clearTimeout(window.alert.time);
        document.querySelector('.alertBox').remove();
    }
    var obj = document.createElement('div')
    obj.setAttribute('class', 'alertBox');
    obj.innerHTML = msg;
    document.body.appendChild(obj);
    window.alert.time = setTimeout(function() {
        document.body.removeChild(document.querySelector('.alertBox'))
    }, 1500);
}

var btn = document.querySelector(".searchBtn");
btn.ontouchstart = function () {
    this.className = "searchBtn btn-on";
};
btn.ontouchend = function () {
    this.className = "searchBtn";
};