function CPreloader(){
    var _oLoadingText;
    
    this._init = function(){
       this._onAllPreloaderImagesLoaded();
    };
    
    this._onPreloaderImagesLoaded = function(){
            
    };
    
    this._onAllPreloaderImagesLoaded = function(){
        _oLoadingText = new createjs.Text("","bold 22px Arial center", "#ffffff");
        _oLoadingText.x = (CANVAS_WIDTH/2)-40;
        _oLoadingText.y = CANVAS_HEIGHT/2;
        s_oStage.addChild(_oLoadingText);
    };
    
    this.unload = function(){
        s_oStage.removeChild(_oLoadingText);
    };
    
    this.refreshLoader = function(iPerc){
        _oLoadingText.text = iPerc+"%";
    };
    
    this._init();
    
}